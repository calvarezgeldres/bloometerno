import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PIECES = [
  {
    src: "/gallery/ramo-mixto.webp",
    alt: "Ramo mixto de flores en mostacillas: lirios, tulipanes y flor de nube",
    title: "Ramo Mixto",
  },
  {
    src: "/gallery/lilium-azul-mano.webp",
    alt: "Ramo de lirios azules tejidos en mostacillas",
    title: "Lirios Azules",
  },
  {
    src: "/gallery/lilium-azul-lazo.webp",
    alt: "Ramo de lirios azules con lazo de regalo",
    title: "Lirios de Regalo",
  },
  {
    src: "/gallery/suculentas-macetero.webp",
    alt: "Macetero con suculentas tejidas en mostacillas",
    title: "Suculentas en Macetero",
  },
  {
    src: "/gallery/suculentas-manos.webp",
    alt: "Macetero artesanal de suculentas sostenido en las manos",
    title: "Suculentas Artesanales",
  },
];

export function RealCreations() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 300) + 20;
    el.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <section
      id="creaciones"
      style={{
        backgroundColor: "var(--cream-deep)",
        padding: "5rem 0",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold)" }} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  color: "var(--gold)",
                  fontWeight: 500,
                  textTransform: "uppercase" as const,
                }}
              >
                Hecho con nuestros materiales
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 400,
                color: "var(--foreground)",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Piezas <em style={{ fontStyle: "italic", color: "var(--primary)" }}>reales</em>, hechas a mano
            </h2>
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Anterior"
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Siguiente"
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Scroll-snap carousel */}
        <div
          ref={scrollerRef}
          style={{
            display: "flex",
            gap: "1.25rem",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingBottom: "0.5rem",
            scrollbarWidth: "none",
          }}
        >
          {PIECES.map((piece) => (
            <div
              key={piece.src}
              data-card
              style={{
                flex: "0 0 auto",
                width: "min(78vw, 300px)",
                scrollSnapAlign: "start",
              }}
            >
              <div
                style={{
                  borderRadius: "0.9rem",
                  overflow: "hidden",
                  aspectRatio: "3/4",
                  backgroundColor: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={piece.src}
                  alt={piece.alt}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  margin: "0.85rem 0 0",
                }}
              >
                {piece.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
