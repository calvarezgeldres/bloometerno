import { useState } from "react";
import type { Category, Product, ProductVariant } from "../types/store";
import { hasVariants, variantAttributes, variantImage, variantPrice } from "../../lib/catalog";

/**
 * Estado de "qué variante eligió el cliente" de un producto, compartido por la
 * tarjeta del catálogo y la página de detalle.
 * initialVariantId: variante con la que parte (ej: la que venía elegida en la
 * tarjeta); si no existe, parte con la primera que tenga stock.
 */
export function useVariantSelection(product: Product, category?: Category, initialVariantId?: string | null) {
  const variants = product.variants ?? [];
  const withVariants = hasVariants(product);
  const initialVariant = () =>
    variants.find((v) => v.id === initialVariantId) ?? variants.find((v) => v.stock > 0) ?? variants[0];

  // Opciones elegibles: cada característica variante con los valores que tiene este producto.
  // Si la categoría ya no tiene esas características, se elige directo entre las variantes.
  const groups = variantAttributes(category)
    .map((a) => ({
      attr: a,
      values: Array.from(new Set(variants.map((v) => v.options[a.id]).filter(Boolean))),
    }))
    .filter((g) => g.values.length > 0);

  const [selected, setSelected] = useState<Record<string, string>>(() => initialVariant()?.options ?? {});
  const [fallbackVariantId, setFallbackVariantId] = useState<string | undefined>(() => initialVariant()?.id);

  const selectedVariant: ProductVariant | null = !withVariants
    ? null
    : groups.length > 0
    ? variants.find((v) => groups.every((g) => v.options[g.attr.id] === selected[g.attr.id])) ?? null
    : variants.find((v) => v.id === fallbackVariantId) ?? null;

  const isValueAvailable = (attrId: string, value: string) =>
    variants.some(
      (v) => v.stock > 0 && groups.every((g) => v.options[g.attr.id] === (g.attr.id === attrId ? value : selected[g.attr.id]))
    );

  // Foto de cada opción para el botón: la de la combinación que quedaría elegida o,
  // si esa no tiene, la de cualquier variante con esa opción (ej: la foto del Dorado
  // aunque el largo elegido no tenga foto propia).
  const optionImage = (attrId: string, value: string) =>
    (
      variants.find(
        (v) => v.image && groups.every((g) => v.options[g.attr.id] === (g.attr.id === attrId ? value : selected[g.attr.id]))
      ) ?? variants.find((v) => v.image && v.options[attrId] === value)
    )?.image ?? null;

  const selectOption = (attrId: string, value: string) => setSelected((prev) => ({ ...prev, [attrId]: value }));

  /** Elige una variante completa (ej: al tocar su foto en la galería de la página de detalle). */
  const selectVariant = (variant: ProductVariant) => {
    setSelected(variant.options);
    setFallbackVariantId(variant.id);
  };

  const stock = withVariants ? selectedVariant?.stock ?? 0 : product.stock;
  const isOutOfStock = product.stock <= 0;

  return {
    variants,
    withVariants,
    groups,
    selected,
    selectOption,
    fallbackVariantId,
    setFallbackVariantId,
    selectVariant,
    selectedVariant,
    isValueAvailable,
    optionImage,
    image: variantImage(product, selectedVariant),
    price: variantPrice(product, selectedVariant),
    stock,
    isOutOfStock,
    /** El producto tiene stock, pero no en la combinación elegida */
    isSelectionUnavailable: !isOutOfStock && stock <= 0,
    isLowStock: stock > 0 && stock <= 3,
  };
}
