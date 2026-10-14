import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Check, ChevronRight, MessageCircle, Minus, Plus, ShoppingBag, Store, Truck } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { ProductCard, badgeConfig, formatCLP } from "../components/Products";
import { useStore } from "../context/StoreContext";
import { useVariantSelection } from "../hooks/useVariantSelection";
import { SHIPPING_METHODS } from "../data/chileData";
import { Category, Product, ProductVariant } from "../types/store";
import { findCategory, fixedAttributes, variantAttributes, variantLabel } from "../../lib/catalog";

/**
 * Página de detalle de un producto (/producto/:id). Inspirada en las fichas de
 * tiendas de insumos (foto grande, código, tabla de características y productos
 * relacionados), con la compra completa: variante, cantidad y agregar a la bolsa.
 * ?variante=<id> abre con esa opción elegida y se mantiene al día al cambiarla,
 * así el enlace compartido muestra el mismo color.
 */
export const ProductoDetallePage: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { products, categories, isCatalogLoaded } = useStore();

  const product = products.find((p) => String(p.id) === id);

  return (
    <PageLayout>
      <main style={{ backgroundColor: "var(--background)", minHeight: "60vh" }}>
        {product ? (
          <ProductDetail
            // Remontar al cambiar de producto: la selección de variante parte de cero
            key={String(product.id)}
            product={product}
            category={findCategory(product, categories)}
            initialVariantId={searchParams.get("variante")}
            related={products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)}
            allCategories={categories}
          />
        ) : !isCatalogLoaded ? (
          <p style={{ textAlign: "center", padding: "6rem 1rem", color: "var(--muted-foreground)" }}>Cargando producto…</p>
        ) : (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.8rem", margin: "0 0 0.75rem" }}>
              Producto no encontrado
            </h1>
            <p style={{ color: "var(--muted-foreground)", margin: "0 0 1.5rem" }}>
              Puede que ya no esté disponible o que el enlace esté incompleto.
            </p>
            <Link
              to="/productos"
              style={{
                display: "inline-block",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "0.7rem 1.6rem",
                borderRadius: "2rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Ver todos los productos
            </Link>
          </div>
        )}
      </main>
    </PageLayout>
  );
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.65rem",
  letterSpacing: "0.2em",
  color: "var(--gold)",
  fontWeight: 600,
  textTransform: "uppercase",
  margin: 0,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
  fontWeight: 400,
  color: "var(--foreground)",
  margin: "0 0 1.5rem",
};

function ProductDetail({
  product,
  category,
  initialVariantId,
  related,
  allCategories,
}: {
  product: Product;
  category?: Category;
  initialVariantId: string | null;
  related: Product[];
  allCategories: Category[];
}) {
  const { addToCart, settings } = useStore();
  const [, setSearchParams] = useSearchParams();
  const {
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
    image,
    price,
    stock,
    isOutOfStock,
    isSelectionUnavailable,
    isLowStock,
  } = useVariantSelection(product, category, initialVariantId);

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  // Foto elegida a mano en la galería; null = la de la variante elegida
  const [viewImage, setViewImage] = useState<string | null>(null);

  // Al cambiar de variante: vuelve a su foto, ajusta la cantidad a su stock y deja
  // la variante en la URL (replace, para no llenar el historial del botón "atrás").
  useEffect(() => {
    setViewImage(null);
    setQuantity((q) => Math.max(1, Math.min(q, stock)));
    if (selectedVariant) {
      setSearchParams((prev) => {
        if (prev.get("variante") === selectedVariant.id) return prev;
        const next = new URLSearchParams(prev);
        next.set("variante", selectedVariant.id);
        return next;
      }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id]);

  // Galería: foto principal + una por cada foto distinta de las variantes
  const gallery: { src: string; variant: ProductVariant | null }[] = [{ src: product.image, variant: null }];
  for (const v of variants) {
    if (v.image && !gallery.some((g) => g.src === v.image)) gallery.push({ src: v.image, variant: v });
  }
  const shownImage = viewImage ?? image;

  const handleAdd = () => {
    if (stock <= 0) return;
    const ok = addToCart(product, quantity, selectedVariant, selectedVariant ? variantLabel(selectedVariant, category) : undefined);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  const badge = isOutOfStock
    ? { label: "Agotado", bg: "var(--destructive)", color: "#fff" }
    : (product.badgeType && badgeConfig[product.badgeType]) ||
      (product.badge ? { label: product.badge, bg: "var(--gold)", color: "#fff" } : null);

  // Tabla "Más información": código, categoría, características fijas y opciones disponibles
  const infoRows: [string, string][] = [
    ["Código", product.num],
    ["Categoría", product.category],
    ...fixedAttributes(category)
      .filter((a) => product.attributes?.[a.id])
      .map((a): [string, string] => [a.name, product.attributes![a.id]]),
    ...variantAttributes(category)
      .map((a): [string, string] => [
        a.name,
        Array.from(new Set(variants.map((v) => v.options[a.id]).filter(Boolean))).join(", "),
      ])
      .filter(([, values]) => values),
    ["Disponibilidad", isOutOfStock ? "Agotado" : withVariants ? "Según la opción elegida" : `${product.stock} un.`],
  ];

  const delivery = SHIPPING_METHODS.find((m) => m.id === "private_courier");
  const whatsapp = settings.whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <>
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "1.75rem 2rem 4rem" }}>
        {/* Migas de pan */}
        <nav
          aria-label="Ruta de navegación"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.35rem",
            fontSize: "0.72rem",
            color: "var(--muted-foreground)",
            marginBottom: "2rem",
          }}
        >
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Inicio
          </Link>
          <ChevronRight size={12} />
          <Link to="/productos" style={{ color: "inherit", textDecoration: "none" }}>
            Productos
          </Link>
          <ChevronRight size={12} />
          <Link
            to={`/productos?categoria=${encodeURIComponent(product.category)}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: "var(--foreground)" }}>{product.name}</span>
        </nav>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", alignItems: "start" }}
          className="max-lg:grid-cols-1"
        >
          {/* Galería */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "3/4",
                borderRadius: "0.9rem",
                overflow: "hidden",
                backgroundColor: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={shownImage}
                alt={selectedVariant ? `${product.name} (${variantLabel(selectedVariant, category)})` : product.alt || product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter: isOutOfStock ? "grayscale(40%)" : "none",
                }}
              />
              {badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    backgroundColor: badge.bg,
                    color: badge.color,
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "2rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  {badge.label}
                </span>
              )}
            </div>

            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {gallery.map((g) => {
                  const isActive = g.src === shownImage;
                  return (
                    <button
                      key={g.src}
                      type="button"
                      onClick={() => {
                        if (g.variant) {
                          selectVariant(g.variant);
                          setViewImage(g.src);
                        } else {
                          setViewImage(g.src);
                        }
                      }}
                      title={g.variant ? variantLabel(g.variant, category) : "Foto principal"}
                      style={{
                        width: "4.2rem",
                        aspectRatio: "3/4",
                        padding: 0,
                        borderRadius: "0.45rem",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: isActive ? "2px solid var(--primary)" : "1px solid var(--border)",
                        opacity: isActive ? 1 : 0.75,
                        backgroundColor: "var(--muted)",
                      }}
                    >
                      <img src={g.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información y compra */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            <div>
              <Link
                to={`/productos?categoria=${encodeURIComponent(product.category)}`}
                style={{ ...eyebrowStyle, textDecoration: "none", display: "inline-block", marginBottom: "0.6rem" }}
              >
                {product.category}
              </Link>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 3.2vw, 2.5rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: "var(--foreground)",
                  margin: 0,
                }}
              >
                {product.name}
              </h1>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: "var(--muted-foreground)", margin: "0.6rem 0 0" }}>
                Código {product.num}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 600, color: "var(--primary)" }}>
                {formatCLP(price)}
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 400, color: "var(--muted-foreground)", marginLeft: "0.4rem" }}>
                  CLP
                </span>
              </span>
              {stock <= 0 ? (
                <span style={{ fontSize: "0.78rem", color: "var(--destructive)", fontWeight: 600 }}>
                  {isOutOfStock ? "Agotado" : "Sin stock en esta opción"}
                </span>
              ) : isLowStock ? (
                <span style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 600 }}>¡Quedan solo {stock} un.!</span>
              ) : (
                <span style={{ fontSize: "0.78rem", color: "var(--secondary)" }}>{stock} un. disponibles</span>
              )}
            </div>

            {product.description && (
              <p style={{ fontSize: "0.92rem", lineHeight: 1.75, color: "var(--foreground)", margin: 0, fontWeight: 300 }}>
                {product.description}
              </p>
            )}

            {/* Selector de variantes, con la foto de cada opción */}
            {withVariants && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.2rem", borderTop: "1px solid var(--border)" }}>
                {groups.length > 0 ? (
                  groups.map((g) => (
                    <div key={g.attr.id}>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginBottom: "0.55rem" }}>
                        {g.attr.name}: <strong style={{ color: "var(--foreground)" }}>{selected[g.attr.id] ?? "—"}</strong>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {g.values.map((value) => {
                          const isSel = selected[g.attr.id] === value;
                          const available = isValueAvailable(g.attr.id, value);
                          const thumb = optionImage(g.attr.id, value);
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => selectOption(g.attr.id, value)}
                              title={available ? value : `${value} (sin stock)`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontFamily: "var(--font-body)",
                                fontSize: "0.8rem",
                                padding: thumb ? "0.25rem 0.9rem 0.25rem 0.25rem" : "0.45rem 1rem",
                                borderRadius: "2rem",
                                cursor: "pointer",
                                border: isSel ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                                backgroundColor: isSel ? "var(--primary)" : "var(--card)",
                                color: isSel ? "var(--primary-foreground)" : "var(--foreground)",
                                opacity: available ? 1 : 0.45,
                                textDecoration: available ? "none" : "line-through",
                              }}
                            >
                              {thumb && (
                                <img
                                  src={thumb}
                                  alt=""
                                  style={{ width: "2rem", height: "2rem", borderRadius: "50%", objectFit: "cover", display: "block" }}
                                />
                              )}
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <select
                    value={fallbackVariantId}
                    onChange={(e) => setFallbackVariantId(e.target.value)}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.85rem" }}
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {variantLabel(v, category)}
                        {v.stock <= 0 ? " (sin stock)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Cantidad y agregar a la bolsa */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "stretch", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  borderRadius: "2rem",
                  backgroundColor: "var(--card)",
                  opacity: stock <= 0 ? 0.5 : 1,
                }}
              >
                <button
                  type="button"
                  aria-label="Restar uno"
                  disabled={stock <= 0 || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ background: "none", border: "none", padding: "0 0.9rem", height: "100%", cursor: "pointer", color: "var(--foreground)", display: "flex", alignItems: "center" }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: "1.8rem", textAlign: "center", fontWeight: 600, fontSize: "0.9rem" }}>{quantity}</span>
                <button
                  type="button"
                  aria-label="Sumar uno"
                  disabled={stock <= 0 || quantity >= stock}
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  style={{ background: "none", border: "none", padding: "0 0.9rem", height: "100%", cursor: "pointer", color: "var(--foreground)", display: "flex", alignItems: "center" }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                disabled={stock <= 0}
                onClick={handleAdd}
                style={{
                  flex: 1,
                  minWidth: "13rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  backgroundColor: stock <= 0 ? "var(--muted)" : justAdded ? "var(--secondary)" : "var(--primary)",
                  color: stock <= 0 ? "var(--muted-foreground)" : "var(--primary-foreground)",
                  border: "none",
                  borderRadius: "2rem",
                  padding: "0.95rem 1.5rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: stock <= 0 ? "not-allowed" : "pointer",
                  transition: "background-color 0.25s ease",
                }}
              >
                {isOutOfStock ? (
                  "Agotado"
                ) : isSelectionUnavailable ? (
                  "Opción sin stock"
                ) : justAdded ? (
                  <>
                    <Check size={15} strokeWidth={2} />
                    ¡Agregado a la bolsa!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} strokeWidth={1.5} />
                    Agregar a la bolsa
                  </>
                )}
              </button>
            </div>

            {/* Despacho y contacto */}
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: "1.1rem 1.25rem",
                borderRadius: "0.75rem",
                backgroundColor: "var(--cream-deep)",
                display: "flex",
                flexDirection: "column",
                gap: "0.7rem",
                fontSize: "0.8rem",
                color: "var(--foreground)",
              }}
            >
              {delivery && (
                <li style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <Truck size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.1rem" }} />
                  <span>
                    Despacho en Santiago {formatCLP(delivery.costRM)} · {delivery.estimatedDays}
                    {settings.freeShippingThreshold > 0 && (
                      <>
                        {" "}
                        · <strong>gratis sobre {formatCLP(settings.freeShippingThreshold)}</strong>
                      </>
                    )}
                    . Regiones: lo coordinamos por WhatsApp.
                  </span>
                </li>
              )}
              <li style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <Store size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.1rem" }} />
                <span>Retiro sin costo en nuestro taller de Vitacura, previo aviso.</span>
              </li>
              {whatsapp && (
                <li style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <MessageCircle size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.1rem" }} />
                  <span>
                    ¿Dudas con este producto?{" "}
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre "${product.name}" (código ${product.num})`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", fontWeight: 600 }}
                    >
                      Escríbenos por WhatsApp
                    </a>
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Más información */}
      <section style={{ backgroundColor: "var(--cream-deep)", padding: "3.5rem 2rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <p style={{ ...eyebrowStyle, marginBottom: "0.5rem" }}>Ficha técnica</p>
          <h2 style={sectionTitleStyle}>Más información</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", backgroundColor: "var(--card)", borderRadius: "0.75rem", overflow: "hidden" }}>
            <tbody>
              {infoRows.map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid var(--border)" }}>
                  <th
                    scope="row"
                    style={{ textAlign: "left", fontWeight: 600, padding: "0.8rem 1.1rem", width: "38%", color: "var(--muted-foreground)" }}
                  >
                    {label}
                  </th>
                  <td style={{ padding: "0.8rem 1.1rem", color: "var(--foreground)" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Productos relacionados */}
      {related.length > 0 && <RelatedProducts products={related} categories={allCategories} />}
    </>
  );
}

function RelatedProducts({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { addToCart } = useStore();
  const [wishlist, setWishlist] = useState<Set<string | number>>(new Set());
  const [added, setAdded] = useState<string | number | null>(null);

  return (
    <section style={{ padding: "4rem 2rem 5rem" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <p style={{ ...eyebrowStyle, marginBottom: "0.5rem" }}>De la misma categoría</p>
        <h2 style={sectionTitleStyle}>
          También te puede <em style={{ fontStyle: "italic", color: "var(--primary)" }}>gustar</em>
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}
          className="max-lg:grid-cols-2 max-sm:grid-cols-2"
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              category={findCategory(p, categories)}
              inWishlist={wishlist.has(p.id)}
              wasAdded={added === p.id}
              onWishlist={() =>
                setWishlist((prev) => {
                  const s = new Set(prev);
                  s.has(p.id) ? s.delete(p.id) : s.add(p.id);
                  return s;
                })
              }
              onAddToCart={(variant, label) => {
                if (addToCart(p, 1, variant, label)) {
                  setAdded(p.id);
                  setTimeout(() => setAdded((cur) => (cur === p.id ? null : cur)), 1500);
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
