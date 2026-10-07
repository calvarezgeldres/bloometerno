import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useStore } from "../context/StoreContext";

type BentoCategory = {
  id: string;
  name: string;
  sub: string;
  image: string;
  count: string;
};

// Posición de cada tarjeta en la grilla (la primera es la grande)
const BENTO_SPANS: React.CSSProperties[] = [
  { gridColumn: "span 5", gridRow: "span 2", aspectRatio: "unset" },
  { gridColumn: "span 4" },
  { gridColumn: "span 3" },
  { gridColumn: "span 3" },
  { gridColumn: "span 4" },
];

export function Categories() {
  const { categories: storeCategories, products } = useStore();

  // Las categorías con foto, en el orden definido en el panel de administración
  const categories: BentoCategory[] = storeCategories
    .filter((c) => c.image)
    .slice(0, BENTO_SPANS.length)
    .map((c) => {
      const n = products.filter((p) => p.categoryId === c.id || (!p.categoryId && p.category === c.name)).length;
      return {
        id: c.id,
        name: c.name,
        sub: c.description ?? "",
        image: c.image!,
        count: `${n} producto${n === 1 ? "" : "s"}`,
      };
    });

  if (categories.length === 0) return null;

  return (
    <section id="categorias" style={{ backgroundColor: "var(--background)", paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem" }}>
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
              Colecciones
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
              Todo lo que necesitas
              <br />
              <em style={{ color: "var(--primary)", fontStyle: "italic" }}>para crear</em>
            </h2>
          </div>
          <Link
            to="/productos"
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              color: "var(--primary)",
              textDecoration: "none",
              borderBottom: "1px solid var(--primary)",
              paddingBottom: "1px",
              textTransform: "uppercase" as const,
            }}
            className="lg:flex"
          >
            Ver catálogo <ArrowRight size={12} />
          </Link>
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gridTemplateRows: "auto auto",
            gap: "0.875rem",
          }}
        >
          {categories.map((category, i) => (
            <BentoCard key={category.id} category={category} style={BENTO_SPANS[i]} tall={i === 0} />
          ))}
        </div>

        {/* Mobile grid override */}
        <style>{`
          @media (max-width: 768px) {
            .bento-grid {
              grid-template-columns: 1fr 1fr !important;
              grid-template-rows: auto !important;
            }
            .bento-card-featured {
              grid-column: 1 / -1 !important;
              grid-row: auto !important;
            }
            .bento-card-small {
              grid-column: span 1 !important;
              grid-row: auto !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

function BentoCard({
  category,
  style,
  tall = false,
}: {
  category: BentoCategory;
  style?: React.CSSProperties;
  tall?: boolean;
}) {
  return (
    <Link
      to={`/productos?categoria=${encodeURIComponent(category.name)}`}
      className={tall ? "bento-card-featured" : "bento-card-small"}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "0.875rem",
        backgroundColor: "var(--muted)",
        display: "block",
        textDecoration: "none",
        aspectRatio: tall ? "3/4" : "4/3",
        cursor: "pointer",
        ...style,
      }}
    >
      <img
        src={category.image}
        alt={category.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          display: "block",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")}
        onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
      />

      {/* Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(31,46,31,0.8) 0%, rgba(31,46,31,0.2) 40%, transparent 70%)",
        }}
      />

      {/* Text */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: tall ? "1.75rem" : "1.25rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.14em",
            color: "var(--gold-muted)",
            textTransform: "uppercase" as const,
            margin: "0 0 0.3rem",
          }}
        >
          {category.count}
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            color: "#fff",
            fontSize: tall ? "1.5rem" : "1.1rem",
            fontWeight: 500,
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {category.name}
        </h3>
        {tall && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.78rem",
              margin: "0.4rem 0 0",
              fontWeight: 300,
            }}
          >
            {category.sub}
          </p>
        )}
      </div>

      {/* Arrow on hover */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          backgroundColor: "rgba(255,252,249,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,252,249,0.2)",
          backdropFilter: "blur(4px)",
        }}
      >
        <ArrowRight size={12} color="#fff" />
      </div>
    </Link>
  );
}
