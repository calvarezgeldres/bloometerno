import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";

type Product = {
  id: number;
  num: string;
  name: string;
  price: number;
  badge?: string;
  badgeType?: "new" | "hot" | "limited";
  image: string;
  alt: string;
  category: string;
};

const products: Product[] = [
  {
    id: 1,
    num: "01",
    name: "Mostacilla rosado pálido 2mm",
    price: 1490,
    badge: "Más vendido",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1560847133-e6f64dc352ea?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Mostacillas rosadas ensartadas",
    category: "Mostacillas",
  },
  {
    id: 2,
    num: "02",
    name: "Piedra ojo de tigre natural",
    price: 3900,
    badge: "Nuevo",
    badgeType: "new",
    image: "https://images.unsplash.com/photo-1766038844075-d997429c85ef?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Piedra ojo de tigre pulida natural",
    category: "Piedras",
  },
  {
    id: 3,
    num: "03",
    name: "Cristal facetado verde oliva",
    price: 2200,
    badge: "Nuevo",
    badgeType: "new",
    image: "https://images.unsplash.com/photo-1556376752-19770d78207f?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Cristales facetados color verde",
    category: "Cristales",
  },
  {
    id: 4,
    num: "04",
    name: "Kit pulsera floral completo",
    price: 8990,
    badge: "Ed. Limitada",
    badgeType: "limited",
    image: "https://images.unsplash.com/photo-1660911866937-9399bf71af1e?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Kit completo para pulsera floral",
    category: "Kits",
  },
  {
    id: 5,
    num: "05",
    name: "Separadores dorado suave x20",
    price: 2490,
    badge: "Más vendido",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1658915250017-bee8f8f0d9a6?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Separadores dorados para bisutería artesanal",
    category: "Herramientas",
  },
  {
    id: 6,
    num: "06",
    name: "Mix mostacillas crema y beige",
    price: 3200,
    image: "https://images.unsplash.com/photo-1510229955695-588e1612a69b?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Mix de mostacillas en tonos crema",
    category: "Mostacillas",
  },
  {
    id: 7,
    num: "07",
    name: "Cuarzo rosa rodado natural",
    price: 4500,
    badge: "Nuevo",
    badgeType: "new",
    image: "https://images.unsplash.com/photo-1568551732226-3ad05aac9a76?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Cuarzo rosa rodado sobre superficie natural",
    category: "Piedras",
  },
  {
    id: 8,
    num: "08",
    name: "Set iniciación bisutería natural",
    price: 12900,
    badge: "Ed. Limitada",
    badgeType: "limited",
    image: "https://images.unsplash.com/photo-1560847133-95f64e08e02a?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Set completo de iniciación en bisutería natural",
    category: "Kits",
  },
];

const badgeConfig = {
  new: { label: "Nuevo", bg: "var(--secondary)", color: "#fff" },
  hot: { label: "Más vendido", bg: "var(--gold)", color: "#fff" },
  limited: { label: "Ed. Limitada", bg: "var(--pale-pink)", color: "var(--foreground)" },
};

function formatCLP(n: number) {
  return `$${n.toLocaleString("es-CL")}`;
}

export function Products() {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<Set<number>>(new Set());

  const toggleWishlist = (id: number) =>
    setWishlist(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const addToCart = (id: number) => {
    setAdded(prev => new Set(prev).add(id));
    setTimeout(() => setAdded(prev => { const s = new Set(prev); s.delete(id); return s; }), 2000);
  };

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
          <div className="hidden md:flex items-center gap-2">
            {["Todos", "Piedras", "Mostacillas", "Kits"].map((f, i) => (
              <button
                key={f}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  fontWeight: i === 0 ? 500 : 400,
                  color: i === 0 ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  backgroundColor: i === 0 ? "var(--primary)" : "transparent",
                  border: i === 0 ? "none" : "1px solid var(--border)",
                  padding: "0.4rem 1rem",
                  borderRadius: "2rem",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
          }}
          className="max-lg:grid-cols-2 max-sm:grid-cols-2"
        >
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              inWishlist={wishlist.has(product.id)}
              wasAdded={added.has(product.id)}
              onWishlist={() => toggleWishlist(product.id)}
              onAddToCart={() => addToCart(product.id)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2.5rem", borderTop: "1px solid var(--border)" }}>
          <a
            href="#productos"
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
            }}
          >
            Ver catálogo completo
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
  const badge = product.badgeType ? badgeConfig[product.badgeType] : null;

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
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
          alt={product.alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s ease",
            display: "block",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
            color: "rgba(246,240,227,0.7)",
            backgroundColor: "rgba(33,28,18,0.45)",
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
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              padding: "0.25rem 0.65rem",
              borderRadius: "2rem",
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
              fontWeight: 500,
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
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
            }}
          >
            CLP
          </span>
        </div>

        <button
          onClick={onAddToCart}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            backgroundColor: wasAdded ? "var(--secondary)" : "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            borderRadius: "2rem",
            padding: "0.65rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.68rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            cursor: "pointer",
            transition: "background-color 0.25s ease",
          }}
        >
          <ShoppingBag size={12} strokeWidth={1.5} />
          {wasAdded ? "¡Agregado!" : "Agregar"}
        </button>
      </div>
    </div>
  );
}
