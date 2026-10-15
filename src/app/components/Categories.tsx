import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Accent, SectionHeading } from "./SectionHeading";

type CategoryCard = {
  id: string;
  name: string;
  image: string | null;
  count: number;
};

/**
 * Colecciones de la portada: una tarjeta por categoría, todas del mismo tamaño
 * (inspirado en "Featured Categories" de johnbead.com): foto cuadrada y el nombre
 * debajo. El encabezado va centrado con líneas, igual que el de las reseñas.
 */
export function Categories() {
  const { categories: storeCategories, products } = useStore();

  // Todas las categorías, en el orden del panel. Sin foto propia se usa la de uno
  // de sus productos; sin productos, el isotipo (ver CategoryTile).
  const categories: CategoryCard[] = storeCategories.map((c) => {
    const own = products.filter((p) => p.categoryId === c.id || (!p.categoryId && p.category === c.name));
    return { id: c.id, name: c.name, image: c.image || own[0]?.image || null, count: own.length };
  });

  if (categories.length === 0) return null;

  return (
    <section id="categorias" style={{ backgroundColor: "var(--background)", paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
        <SectionHeading eyebrow="Colecciones">
          Todo lo que necesitas <Accent>para crear</Accent>
        </SectionHeading>

        {/* Tarjetas de igual tamaño, centradas aunque sean pocas */}
        <div className="categorias-grid">
          {categories.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
        <style>{`
          .categorias-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(13rem, 17rem));
            justify-content: center;
            gap: 1.75rem 1.5rem;
          }
          @media (max-width: 640px) {
            .categorias-grid { grid-template-columns: 1fr 1fr; gap: 1.25rem 0.9rem; }
          }
        `}</style>

        <div style={{ textAlign: "center", marginTop: "2.75rem" }}>
          <Link
            to="/productos"
            style={{
              display: "inline-flex",
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
          >
            Ver catálogo <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ category }: { category: CategoryCard }) {
  return (
    <Link
      to={`/productos?categoria=${encodeURIComponent(category.name)}`}
      style={{ display: "block", textDecoration: "none", textAlign: "center" }}
      onMouseEnter={(e) => {
        const img = e.currentTarget.querySelector("img");
        if (img && category.image) img.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.transform = "scale(1)";
      }}
    >
      <div
        style={{
          aspectRatio: "1 / 1",
          borderRadius: "0.875rem",
          overflow: "hidden",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={category.image ?? "/logos/bloom-isotipo.png"}
          alt={category.name}
          style={
            category.image
              ? {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }
              : { width: "35%", height: "auto", opacity: 0.35 }
          }
        />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          fontWeight: 500,
          color: "var(--heading)",
          margin: "1rem 0 0.25rem",
          lineHeight: 1.2,
        }}
      >
        {category.name}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.62rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
          margin: 0,
        }}
      >
        {category.count} producto{category.count === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
