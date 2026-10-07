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
