import { useState } from "react";
import { Heart, ShoppingBag, Check, AlertCircle } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Product } from "../types/store";

const badgeConfig: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: "Nuevo", bg: "var(--secondary)", color: "#fff" },
  hot: { label: "Más vendido", bg: "var(--gold)", color: "#fff" },
  limited: { label: "Ed. Limitada", bg: "var(--pale-pink)", color: "var(--foreground)" },
};

function formatCLP(n: number) {
  return `$${n.toLocaleString("es-CL")}`;
}

export function Products() {
  const { products, addToCart } = useStore();
  const [wishlist, setWishlist] = useState<Set<string | number>>(new Set());
  const [added, setAdded] = useState<Set<string | number>>(new Set());
  const [activeCategory, setActiveCategory] = useState("Todos");

  const toggleWishlist = (id: string | number) =>
    setWishlist((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    const ok = addToCart(product, 1);
    if (ok) {
      setAdded((prev) => new Set(prev).add(product.id));
      setTimeout(() => {
        setAdded((prev) => {
          const s = new Set(prev);
          s.delete(product.id);
          return s;
        });
      }, 1500);
    }
  };

  // Extraer categorías dinámicas únicas del catálogo
  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    activeCategory === "Todos"
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section
      id="productos"
      style={{ backgroundColor: "var(--cream-deep)", paddingTop: "5rem", paddingBottom: "5rem" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "3rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "var(--gold)",
                fontWeight: 500,
                textTransform: "uppercase" as const,
                marginBottom: "0.5rem",
              }}
            >
              Selección especial
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Materiales <em style={{ fontStyle: "italic", color: "var(--primary)" }}>destacados</em>
            </h2>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    backgroundColor: isSelected ? "var(--primary)" : "transparent",
                    border: isSelected ? "none" : "1px solid var(--border)",
                    padding: "0.4rem 1.1rem",
                    borderRadius: "2rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted-foreground)" }}>
            <p>No hay productos en esta categoría en este momento.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
            }}
            className="max-lg:grid-cols-2 max-sm:grid-cols-2"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inWishlist={wishlist.has(product.id)}
                wasAdded={added.has(product.id)}
                onWishlist={() => toggleWishlist(product.id)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2.5rem", borderTop: "1px solid var(--border)" }}>
          <a
            href="#productos"
            onClick={() => setActiveCategory("Todos")}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              color: "var(--primary)",
              border: "1.5px solid var(--primary)",
              padding: "0.875rem 2.5rem",
              borderRadius: "2rem",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary)";
              e.currentTarget.style.color = "var(--primary-foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--primary)";
            }}
          >
            Ver catálogo completo ({products.length} productos)
          </a>
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  inWishlist,
  wasAdded,
  onWishlist,
  onAddToCart,
}: {
  product: Product;
  inWishlist: boolean;
  wasAdded: boolean;
  onWishlist: () => void;
  onAddToCart: () => void;
}) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const defaultBadge = product.badgeType ? badgeConfig[product.badgeType] : null;
  const badge = isOutOfStock
    ? { label: "Agotado", bg: "var(--destructive)", color: "#fff" }
    : defaultBadge || (product.badge ? { label: product.badge, bg: "var(--gold)", color: "#fff" } : null);

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.3s ease",
        opacity: isOutOfStock ? 0.78 : 1,
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          overflow: "hidden",
          backgroundColor: "var(--muted)",
        }}
      >
        <img
          src={product.image}
          alt={product.alt || product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s ease",
            display: "block",
            filter: isOutOfStock ? "grayscale(40%)" : "none",
          }}
          onMouseEnter={(e) => {
            if (!isOutOfStock) e.currentTarget.style.transform = "scale(1.04)";
          }}
          onMouseLeave={(e) => {
            if (!isOutOfStock) e.currentTarget.style.transform = "scale(1)";
          }}
        />

        {/* Number tag */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.08em",
            color: "rgba(246,240,227,0.85)",
            backgroundColor: "rgba(33,28,18,0.55)",
            backdropFilter: "blur(4px)",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
          }}
        >
          {product.num}
        </div>

        {/* Badge */}
        {badge && (
          <div
            style={{
              position: "absolute",
              bottom: "0.75rem",
              left: "0.75rem",
              backgroundColor: badge.bg,
              color: badge.color,
              fontFamily: "var(--font-body)",
              fontSize: "0.58rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              padding: "0.25rem 0.65rem",
              borderRadius: "2rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {badge.label}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={onWishlist}
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            backgroundColor: "rgba(250,246,236,0.92)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: inWishlist ? "#C1455A" : "var(--muted-foreground)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Heart size={12} fill={inWishlist ? "#C1455A" : "none"} strokeWidth={1.5} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              color: "var(--gold)",
              fontWeight: 600,
              textTransform: "uppercase" as const,
              margin: "0 0 0.3rem",
            }}
          >
            {product.category}
          </p>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 500,
              color: "var(--foreground)",
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Stock info */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 600,
                color: "var(--primary)",
              }}
            >
              {formatCLP(product.price)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                color: "var(--muted-foreground)",
                letterSpacing: "0.08em",
                marginLeft: "0.3rem",
              }}
            >
              CLP
            </span>
          </div>

          {/* Stock badge */}
          {isOutOfStock ? (
            <span style={{ fontSize: "0.65rem", color: "var(--destructive)", fontWeight: 600 }}>
              Sin stock
            </span>
          ) : isLowStock ? (
            <span style={{ fontSize: "0.65rem", color: "var(--gold)", fontWeight: 600 }}>
              ¡Solo {product.stock} un!
            </span>
          ) : (
            <span style={{ fontSize: "0.62rem", color: "var(--muted-foreground)" }}>
              {product.stock} un. disp.
            </span>
          )}
        </div>

        {/* Add button */}
        <button
          disabled={isOutOfStock}
          onClick={onAddToCart}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            backgroundColor: isOutOfStock
              ? "var(--muted)"
              : wasAdded
              ? "var(--secondary)"
              : "var(--primary)",
            color: isOutOfStock ? "var(--muted-foreground)" : "var(--primary-foreground)",
            border: "none",
            borderRadius: "2rem",
            padding: "0.65rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            transition: "background-color 0.25s ease",
          }}
        >
          {isOutOfStock ? (
            "Agotado"
          ) : wasAdded ? (
            <>
              <Check size={13} strokeWidth={2} />
              ¡Agregado a la bolsa!
            </>
          ) : (
            <>
              <ShoppingBag size={13} strokeWidth={1.5} />
              Agregar a la bolsa
            </>
          )}
        </button>
      </div>
    </div>
  );
}
