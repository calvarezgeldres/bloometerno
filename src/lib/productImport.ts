/**
 * productImport.ts — Carga masiva de productos desde una planilla CSV (panel admin).
 *
 * Formato: una fila por variante. Las filas con el mismo nombre y categoría forman
 * un solo producto (ej: 5 colores de una mostacilla = 5 filas). Además de las
 * columnas fijas (ver COLUMNS), cada característica de la categoría es una columna
 * con su nombre ("Color", "Tamaño"...): las de variante arman las opciones y las
 * fijas se leen de la primera fila del producto.
 *
 * SKU: en una fila de variante es el SKU de esa variante; en un producto sin
 * variantes es el SKU del producto (se guarda como su "Código"). Productos con el
 * mismo nombre pero distinto SKU y sin variantes son productos separados. Los SKU
 * no se repiten (ni en la planilla ni con lo que ya existe).
 *
 * Todo es lógica pura (sin React ni red) para poder probarla aparte; la pantalla
 * está en components/admin/ProductImporter.tsx.
 */
import type { Category, Product, ProductVariant } from "../app/types/store";
import { fixedAttributes, newLocalId, normalizeText, sameOptions, variantAttributes } from "./catalog";

/** Columnas fijas de la plantilla (encabezado sugerido → clave interna). */
export const COLUMNS = {
  sku: "sku",
  nombre: "nombre",
  categoria: "categoria",
  precio: "precio",
  stock: "stock",
  descripcion: "descripcion",
  insignia: "insignia",
  foto: "foto",
  precio_variante: "precio_variante",
  foto_variante: "foto_variante",
} as const;
type ColumnKey = keyof typeof COLUMNS;

/** Foto provisoria para productos sin foto (la API exige una). */
export const PLACEHOLDER_IMAGE = "/logos/bloom-isotipo.png";

const BADGES: Record<string, { badge: string; badgeType: Product["badgeType"] }> = {
  nuevo: { badge: "Nuevo", badgeType: "new" },
  "mas vendido": { badge: "Más vendido", badgeType: "hot" },
  "ed. limitada": { badge: "Ed. Limitada", badgeType: "limited" },
  "edicion limitada": { badge: "Ed. Limitada", badgeType: "limited" },
};

export type ImportIssue = { row: number | null; product?: string; message: string; level: "error" | "warning" };

export type PlannedProduct = {
  key: string;
  rows: number[];
  /** SKU del producto (solo si no tiene variantes); null = sin SKU */
  sku: string | null;
  data: Omit<Product, "id" | "num" | "isActive">;
  usesPlaceholder: boolean;
  errors: string[];
  warnings: string[];
};

export type ImportPlan = {
  products: PlannedProduct[];
  /** Problemas que no son de un producto puntual (columnas desconocidas, archivo vacío...) */
  general: ImportIssue[];
};

// ─── CSV ──────────────────────────────────────────────────────────────────────

/**
 * Lee un CSV respetando comillas ("a; b", comillas dobles escapadas "") y saltos
 * de línea dentro de campos. Detecta el separador: Excel en español guarda con
 * punto y coma; Google Sheets con coma.
 */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [";", ",", "\t"].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best
  );

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Las filas totalmente vacías (típicas al final de un Excel) no cuentan
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

function toCsvLine(values: string[], delimiter = ";"): string {
  return values.map((v) => (/[";\n,]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(delimiter);
}

// ─── Plantilla ──────────────────────────────────────────────────────────────

/**
 * Plantilla CSV (separada por punto y coma, con BOM para que Excel lea bien las
 * tildes) con las columnas fijas + una columna por cada característica existente,
 * y filas de ejemplo con categorías reales.
 */
export function buildTemplateCsv(categories: Category[]): string {
  const attrNames = Array.from(new Set(categories.flatMap((c) => c.attributes.map((a) => a.name))));
  const header = [...Object.keys(COLUMNS), ...attrNames];

  const example = categories.find((c) => variantAttributes(c).length > 0) ?? categories[0];
  const rows: string[][] = [];
  if (example) {
    const vAttr = variantAttributes(example)[0];
    const fill = (values: Partial<Record<string, string>>) => header.map((h) => values[h] ?? "");
    const base = {
      nombre: `Ejemplo ${example.name}`,
      categoria: example.name,
      precio: "2990",
      descripcion: "Borra estas filas de ejemplo antes de importar",
      insignia: "Nuevo",
      foto: "",
    };
    if (vAttr) {
      rows.push(fill({ ...base, sku: "EJ-001", stock: "10", [vAttr.name]: "Opción 1" }));
      rows.push(fill({ nombre: base.nombre, categoria: base.categoria, sku: "EJ-002", stock: "5", precio_variante: "3290", [vAttr.name]: "Opción 2" }));
    } else {
      rows.push(fill({ ...base, sku: "EJ-001", stock: "10" }));
    }
  }
  return "﻿" + [header, ...rows].map((r) => toCsvLine(r)).join("\r\n") + "\r\n";
}

// ─── Validación y armado ────────────────────────────────────────────────────

/** "$2.990" → 2990. null si está vacío; NaN si no es un entero válido en pesos. */
function parseCLP(raw: string): number | null {
  const v = raw.trim();
  if (!v) return null;
  if (/[,]\d{1,2}$/.test(v)) return NaN; // decimales: los montos en CLP son enteros
  const digits = v.replace(/[$\s.]/g, "");
  return /^\d+$/.test(digits) ? Number(digits) : NaN;
}

function parseIntField(raw: string): number | null {
  const v = raw.trim().replace(/\./g, "");
  if (!v) return null;
  return /^\d+$/.test(v) ? Number(v) : NaN;
}

const isImageUrl = (v: string) => /^https?:\/\/\S+$/i.test(v) || /^\/\S+$/.test(v);

/**
 * Convierte las filas del CSV en productos listos para crear, con los errores
 * (impiden crear ese producto) y avisos (se crea igual) de cada uno.
 */
export function buildImportPlan(table: string[][], categories: Category[], existing: Product[]): ImportPlan {
  const general: ImportIssue[] = [];
  if (table.length < 2) {
    general.push({ row: null, level: "error", message: "La planilla no tiene filas de productos (solo encabezado o está vacía)." });
    return { products: [], general };
  }

  // Encabezados: columnas fijas o nombre de una característica (sin importar tildes/mayúsculas)
  const header = table[0].map((h) => normalizeText(h).replace(/[\s_-]+/g, "_"));
  const colIndex: Partial<Record<ColumnKey, number>> = {};
  const attrColumns: { index: number; name: string }[] = [];
  const allAttrNames = new Set(categories.flatMap((c) => c.attributes.map((a) => normalizeText(a.name))));
  table[0].forEach((raw, i) => {
    const key = header[i] as ColumnKey;
    if (key in COLUMNS) colIndex[key] = i;
    else if (raw.trim()) {
      attrColumns.push({ index: i, name: normalizeText(raw) });
      if (!allAttrNames.has(normalizeText(raw))) {
        general.push({
          row: 1,
          level: "warning",
          message: `La columna «${raw.trim()}» no es una columna de la plantilla ni una característica de ninguna categoría; se ignora.`,
        });
      }
    }
  });
  for (const required of ["nombre", "categoria", "precio"] as const) {
    if (colIndex[required] === undefined) {
      general.push({ row: 1, level: "error", message: `Falta la columna obligatoria «${required}».` });
    }
  }
  if (general.some((g) => g.level === "error")) return { products: [], general };

  const cell = (row: string[], key: ColumnKey) => (colIndex[key] !== undefined ? (row[colIndex[key]!] ?? "").trim() : "");

  const colForAttr = (attrName: string) => attrColumns.find((c) => c.name === normalizeText(attrName))?.index;
  const findCategory = (name: string) => categories.find((c) => normalizeText(c.name) === normalizeText(name));
  /** ¿La fila trae valor en alguna característica de variante de su categoría? */
  const rowHasVariant = (values: string[]) =>
    variantAttributes(findCategory(cell(values, "categoria"))).some((a) => {
      const idx = colForAttr(a.name);
      return idx !== undefined && (values[idx] ?? "").trim() !== "";
    });

  // Agrupar filas por producto: nombre + categoría. Una fila sin variante pero con
  // SKU es un producto propio, así dos productos homónimos con distinto SKU no se juntan.
  const groups = new Map<string, { rows: { n: number; values: string[] }[] }>();
  table.slice(1).forEach((values, i) => {
    const n = i + 2; // número de fila como se ve en Excel (la 1 es el encabezado)
    let key = `${normalizeText(cell(values, "nombre"))}::${normalizeText(cell(values, "categoria"))}`;
    if (cell(values, "sku") && !rowHasVariant(values)) key += `::${normalizeText(cell(values, "sku"))}`;
    if (!groups.has(key)) groups.set(key, { rows: [] });
    groups.get(key)!.rows.push({ n, values });
  });

  const existingKeys = new Set(existing.map((p) => `${normalizeText(p.name)}::${normalizeText(p.category)}`));
  // SKU que ya existen en la tienda (de productos y de variantes) y los ya usados en la planilla
  const existingSkus = new Set(
    existing.flatMap((p) => [p.num, ...(p.variants ?? []).map((v) => v.sku ?? "")]).map((s) => normalizeText(s ?? "")).filter(Boolean)
  );
  const fileSkus = new Map<string, number>();
  const checkSku = (raw: string, rowNum: number, errors: string[]) => {
    const skuKey = normalizeText(raw);
    if (!skuKey) return;
    if (existingSkus.has(skuKey)) errors.push(`Fila ${rowNum}: el SKU «${raw}» ya existe en la tienda.`);
    else if (fileSkus.has(skuKey)) errors.push(`Fila ${rowNum}: el SKU «${raw}» está repetido (también en la fila ${fileSkus.get(skuKey)}).`);
    else fileSkus.set(skuKey, rowNum);
  };
  const products: PlannedProduct[] = [];

  for (const [key, group] of groups) {
    const first = group.rows[0];
    const name = cell(first.values, "nombre");
    const catName = cell(first.values, "categoria");
    const errors: string[] = [];
    const warnings: string[] = [];
    const rowNums = group.rows.map((r) => r.n);
    const at = (n: number) => `Fila ${n}`;

    if (!name) errors.push(`${at(first.n)}: falta el nombre del producto.`);
    const category = categories.find((c) => normalizeText(c.name) === normalizeText(catName));
    if (!catName) errors.push(`${at(first.n)}: falta la categoría.`);
    else if (!category) errors.push(`${at(first.n)}: la categoría «${catName}» no existe. Créala primero en la pestaña Categorías.`);
    // Sin ningún SKU, un producto con el mismo nombre en la categoría se considera duplicado
    const anySku = group.rows.some((r) => cell(r.values, "sku"));
    if (name && category && !anySku && existingKeys.has(`${normalizeText(name)}::${normalizeText(category.name)}`)) {
      errors.push(`Ya existe un producto «${name}» en ${category.name}; se omite para no duplicarlo (si es otro producto, agrégale su SKU).`);
    }

    const price = parseCLP(cell(first.values, "precio"));
    if (price === null) errors.push(`${at(first.n)}: falta el precio.`);
    else if (Number.isNaN(price)) errors.push(`${at(first.n)}: el precio «${cell(first.values, "precio")}» no es un monto válido en pesos (sin decimales).`);
    for (const r of group.rows.slice(1)) {
      const other = parseCLP(cell(r.values, "precio"));
      if (other !== null && other !== price) {
        warnings.push(`${at(r.n)}: el precio base distinto se ignora (se usa el de la fila ${first.n}). Para una variante con otro precio usa «precio_variante».`);
      }
    }

    // Columnas de características según la categoría del producto
    const vAttrs = variantAttributes(category);
    const fAttrs = fixedAttributes(category);
    const colFor = colForAttr;

    const attributes: Record<string, string> = {};
    for (const a of fAttrs) {
      const idx = colFor(a.name);
      const value = idx !== undefined ? (first.values[idx] ?? "").trim() : "";
      if (value) attributes[a.id] = value;
    }

    const variants: ProductVariant[] = [];
    let rowsWithoutVariant = 0;
    // Como en el formulario del panel, una característica de variante que el producto
    // no usa puede quedar vacía; pero todas sus filas deben usar las mismas.
    let usedAttrs: string[] | null = null;
    for (const r of group.rows) {
      const options: Record<string, string> = {};
      for (const a of vAttrs) {
        const idx = colFor(a.name);
        const value = idx !== undefined ? (r.values[idx] ?? "").trim() : "";
        if (value) options[a.id] = value;
      }
      const stock = parseIntField(cell(r.values, "stock"));
      if (stock !== null && Number.isNaN(stock)) errors.push(`${at(r.n)}: el stock «${cell(r.values, "stock")}» debe ser un número entero.`);
      if (Object.keys(options).length === 0) {
        rowsWithoutVariant++;
        continue;
      }
      const rowAttrs = vAttrs.filter((a) => options[a.id]).map((a) => a.id);
      if (usedAttrs === null) usedAttrs = rowAttrs;
      else if (rowAttrs.join("|") !== usedAttrs.join("|")) {
        const missing = vAttrs.filter((a) => usedAttrs!.includes(a.id) && !options[a.id]).map((a) => a.name);
        const extra = vAttrs.filter((a) => !usedAttrs!.includes(a.id) && options[a.id]).map((a) => a.name);
        errors.push(
          `${at(r.n)}: ` +
            [
              missing.length ? `falta ${missing.map((m) => `«${m}»`).join(" y ")}` : "",
              extra.length ? `trae ${extra.map((m) => `«${m}»`).join(" y ")}, que las otras filas del producto no tienen` : "",
            ]
              .filter(Boolean)
              .join(" y ") +
            ". Todas las filas de un producto deben usar las mismas características."
        );
      }
      if (variants.some((v) => sameOptions(v.options, options))) errors.push(`${at(r.n)}: esta variante está repetida.`);
      const vPrice = parseCLP(cell(r.values, "precio_variante"));
      if (vPrice !== null && Number.isNaN(vPrice)) errors.push(`${at(r.n)}: el precio_variante «${cell(r.values, "precio_variante")}» no es un monto válido.`);
      const vSku = cell(r.values, "sku");
      checkSku(vSku, r.n, errors);
      const vImage = cell(r.values, "foto_variante");
      if (vImage && !isImageUrl(vImage)) warnings.push(`${at(r.n)}: «foto_variante» no es un enlace (https://...); la variante queda sin foto propia.`);
      variants.push({
        id: newLocalId("var"),
        options,
        stock: stock !== null && !Number.isNaN(stock) ? stock : 0,
        price: vPrice !== null && !Number.isNaN(vPrice) ? vPrice : null,
        image: vImage && isImageUrl(vImage) ? vImage : null,
        sku: vSku ? vSku.slice(0, 64) : null,
      });
    }
    if (variants.length > 0 && rowsWithoutVariant > 0) {
      errors.push(`Algunas filas tienen variante y otras no. Si el producto tiene variantes, cada fila debe indicar su ${vAttrs.map((a) => `«${a.name}»`).join(" / ")}.`);
    }
    if (variants.length === 0 && group.rows.length > 1) {
      errors.push(
        vAttrs.length > 0
          ? `Hay ${group.rows.length} filas con el mismo producto pero sin ${vAttrs.map((a) => `«${a.name}»`).join(" / ")}: no se distinguen las variantes.`
          : `Hay ${group.rows.length} filas con el mismo producto y la categoría «${category?.name}» no tiene características de variante.`
      );
    }

    const badgeRaw = cell(first.values, "insignia");
    const badge = badgeRaw ? BADGES[normalizeText(badgeRaw)] : undefined;
    if (badgeRaw && !badge) warnings.push(`${at(first.n)}: la insignia «${badgeRaw}» no existe (usa Nuevo, Más vendido o Ed. Limitada); se ignora.`);

    const photo = cell(first.values, "foto");
    const usesPlaceholder = !photo || !isImageUrl(photo);
    if (photo && !isImageUrl(photo)) warnings.push(`${at(first.n)}: «foto» no es un enlace (https://...); se usa la foto provisoria.`);
    if (usesPlaceholder) warnings.push("Sin foto: queda con el isotipo como foto provisoria. Súbela después desde Editar.");

    // Sin variantes, el SKU de la fila es el del producto
    const productSkuValue = variants.length === 0 ? cell(first.values, "sku") : "";
    if (productSkuValue) checkSku(productSkuValue, first.n, errors);

    const firstStock = parseIntField(cell(first.values, "stock"));
    products.push({
      key,
      rows: rowNums,
      sku: productSkuValue ? productSkuValue.slice(0, 64) : null,
      usesPlaceholder,
      errors,
      warnings,
      data: {
        name,
        category: category?.name ?? catName,
        categoryId: category?.id ?? null,
        price: price !== null && !Number.isNaN(price) ? price : 0,
        stock: variants.length > 0 ? variants.reduce((acc, v) => acc + v.stock, 0) : firstStock !== null && !Number.isNaN(firstStock) ? firstStock : 0,
        attributes,
        variants,
        badge: badge?.badge ?? null,
        badgeType: badge?.badgeType ?? null,
        image: usesPlaceholder ? PLACEHOLDER_IMAGE : photo,
        alt: name,
        description: cell(first.values, "descripcion") || undefined,
      },
    });
  }

  return { products, general };
}
