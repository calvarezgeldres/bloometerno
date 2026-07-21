import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Piedras naturales",
    sub: "Cuarzo, ámbar, ojo de tigre",
    image: "https://images.unsplash.com/photo-1560427450-00fa9481f01e?w=900&h=1100&fit=crop&auto=format&q=80",
    alt: "Colección de piedras naturales multicolor",
    count: "48 productos",
    featured: true,
  },
  {
    id: 2,
    name: "Mostacillas",
    sub: "Decenas de colores y tamaños",
    image: "https://images.unsplash.com/photo-1560847133-e6f64dc352ea?w=600&h=500&fit=crop&auto=format&q=80",
    alt: "Mostacillas de colores ensartadas",
    count: "62 productos",
    featured: false,
  },
  {
    id: 3,
    name: "Cristales",
    sub: "Facetados y brillantes",
    image: "https://images.unsplash.com/photo-1556376752-19770d78207f?w=600&h=500&fit=crop&auto=format&q=80",
    alt: "Cristales y gemas facetadas",
    count: "35 productos",
    featured: false,
  },
  {
    id: 4,
    name: "Kits creativos",
    sub: "Para empezar a crear hoy",
    image: "https://images.unsplash.com/photo-1660911866937-9399bf71af1e?w=600&h=500&fit=crop&auto=format&q=80",
    alt: "Kit completo de materiales para bisutería",
    count: "12 kits",
    featured: false,
  },
  {
    id: 5,
    name: "Herramientas",
    sub: "Hilos, cierres y accesorios",
    image: "https://images.unsplash.com/photo-1658915250017-bee8f8f0d9a6?w=600&h=500&fit=crop&auto=format&q=80",
    alt: "Aretes y accesorios artesanales",
    count: "29 productos",
    featured: false,
  },
];

export function Categories() {
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
          <a
            href="#productos"
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
          </a>
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
          {/* Featured large card — col 1-5, rows 1-2 */}
          <BentoCard
            category={categories[0]}
            style={{ gridColumn: "span 5", gridRow: "span 2", aspectRatio: "unset" }}
            tall
          />

          {/* Row 1 — small cards */}
          <BentoCard
            category={categories[1]}
            style={{ gridColumn: "span 4" }}
          />
          <BentoCard
            category={categories[2]}
            style={{ gridColumn: "span 3" }}
          />

          {/* Row 2 — small cards */}
          <BentoCard
            category={categories[3]}
            style={{ gridColumn: "span 3" }}
          />
          <BentoCard
            category={categories[4]}
            style={{ gridColumn: "span 4" }}
          />
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
  category: (typeof categories)[0];
  style?: React.CSSProperties;
  tall?: boolean;
}) {
  return (
    <a
      href="#productos"
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
        alt={category.alt}
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
          background: "linear-gradient(to top, rgba(33,28,18,0.8) 0%, rgba(33,28,18,0.2) 40%, transparent 70%)",
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
          backgroundColor: "rgba(246,240,227,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(246,240,227,0.2)",
          backdropFilter: "blur(4px)",
        }}
      >
        <ArrowRight size={12} color="#fff" />
      </div>
    </a>
  );
}
