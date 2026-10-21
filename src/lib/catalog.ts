/**
 * catalog.ts — Utilidades de categorías, características y variantes de producto,
 * compartidas por la tienda, el carrito y el panel de administración.
 */
import type { Category, CategoryAttribute, Product, ProductVariant } from "../app/types/store";

/** Categoría del producto (por id; por nombre para productos antiguos o del modo local). */
export function findCategory(product: Pick<Product, "categoryId" | "category">, categories: Category[]): Category | undefined {
  return (
    (product.categoryId ? categories.find((c) => c.id === product.categoryId) : undefined) ??
    categories.find((c) => c.name.toLowerCase() === product.category.toLowerCase())
  );
}

export function variantAttributes(category?: Category): CategoryAttribute[] {
  return (category?.attributes ?? []).filter((a) => a.isVariant);
}

export function fixedAttributes(category?: Category): CategoryAttribute[] {
  return (category?.attributes ?? []).filter((a) => !a.isVariant);
}

/** "Color: Dorado · Largo: 10 m" — solo con las características que siguen existiendo en la categoría. */
export function variantLabel(variant: ProductVariant, category?: Category): string {
  const parts = variantAttributes(category)
    .filter((a) => variant.options[a.id])
    .map((a) => `${a.name}: ${variant.options[a.id]}`);
  return parts.length > 0 ? parts.join(" · ") : Object.values(variant.options).join(" · ");
}

export function variantPrice(product: Product, variant?: ProductVariant | null): number {
  return variant?.price != null ? variant.price : product.price;
}

/** Texto en minúsculas y sin tildes, para buscar sin importar cómo se escriba ("lavanda" = "Lavanda"). */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * ¿El producto calza con la búsqueda? Busca en nombre, categoría, descripción,
 * características fijas y opciones de las variantes (ej: "lavanda" encuentra el
 * alambre que tiene ese color). Cada palabra buscada tiene que aparecer en algún lado.
 */
export function productMatchesSearch(product: Product, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeText(
    [
      product.name,
      product.category,
      product.description ?? "",
      product.num,
      ...Object.values(product.attributes ?? {}),
      ...(product.variants ?? []).flatMap((v) => Object.values(v.options)),
    ].join(" ")
  );
  return words.every((w) => haystack.includes(w));
}

/** URL de la página de detalle; con variante, la página abre con esa opción elegida. */
export function productPath(product: Pick<Product, "id">, variant?: ProductVariant | null): string {
  const base = `/producto/${encodeURIComponent(String(product.id))}`;
  return variant ? `${base}?variante=${encodeURIComponent(variant.id)}` : base;
}

/** SKU a mostrar: el de la variante elegida si tiene uno propio; si no, el del producto. */
export function productSku(product: Pick<Product, "num">, variant?: ProductVariant | null): string {
  return variant?.sku || product.num;
}

/** Foto a mostrar: la de la variante elegida si tiene una propia; si no, la del producto. */
export function variantImage(product: Product, variant?: ProductVariant | null): string {
  return variant?.image || product.image;
}

export function hasVariants(product: Product): boolean {
  return (product.variants?.length ?? 0) > 0;
}

/** Clave única de una línea del carrito: el mismo producto en distinto color son líneas distintas. */
export function cartKey(productId: string | number, variantId?: string | null): string {
  return `${productId}::${variantId ?? ""}`;
}

export function sameOptions(a: Record<string, string>, b: Record<string, string>): boolean {
  const ka = Object.keys(a).filter((k) => a[k]);
  const kb = Object.keys(b).filter((k) => b[k]);
  return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
}

/**
 * Todas las combinaciones de opciones. Ej: { color: ["Dorado","Plata"], largo: ["5 m"] }
 * → [{color:"Dorado",largo:"5 m"}, {color:"Plata",largo:"5 m"}]. Las características sin
 * opciones cargadas se ignoran.
 */
export function combineOptions(attrs: CategoryAttribute[], values: Record<string, string[]>): Record<string, string>[] {
  const used = attrs.filter((a) => (values[a.id] ?? []).length > 0);
  if (used.length === 0) return [];
  let combos: Record<string, string>[] = [{}];
  for (const a of used) {
    combos = combos.flatMap((c) => values[a.id].map((v) => ({ ...c, [a.id]: v })));
  }
  return combos;
}

/** Texto corto con las características fijas: "Calibre: 0,8 mm · Material: Cobre". */
export function fixedAttributesSummary(product: Product, category?: Category): string {
  return fixedAttributes(category)
    .filter((a) => product.attributes?.[a.id])
    .map((a) => `${a.name}: ${product.attributes![a.id]}`)
    .join(" · ");
}

export function newLocalId(prefix: string): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
