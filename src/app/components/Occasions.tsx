import { ArrowRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Accent, SectionHeading } from "./SectionHeading";

/**
 * "¿Para qué ocasión?" (inspirada en delacons.com): tres tarjetas iguales con
 * foto, ocasión, frase corta y un link. Como todavía no hay productos de estas
 * ocasiones en el catálogo, cada tarjeta abre WhatsApp con un mensaje listo
 * (las piezas hechas a mano se cotizan y personalizan por ahí). Cuando existan
 * productos, basta cambiar el link de cada ocasión.
 */
const OCCASIONS = [
  {
    title: "Para regalar",
    text: "Flores que no se marchitan, para sorprender a quien quieres.",
    image: "/gallery/lilium-azul-lazo.webp",
    alt: "Ramo de lirios azules tejidos en mostacillas con lazo de regalo",
    focus: "center 30%",
    message: "Hola! Me interesa un arreglo para regalar",
  },
  {
    title: "Para tu hogar",
    text: "Plantas y arreglos que decoran tus espacios para siempre.",
    image: "/gallery/suculentas-macetero.webp",
    alt: "Suculentas tejidas en mostacillas en un macetero",
    focus: "center 55%",
    message: "Hola! Me interesa un arreglo para mi hogar",
  },
  {
    title: "Para tu matrimonio",
    text: "Ramos de novia hechos a mano que te acompañan toda la vida.",
    image: "/gallery/ramo-de-novia.webp",
    alt: "Ramo de novia tejido en mostacillas con girasol y tulipanes",
    focus: "center 35%",
    message: "Hola! Me interesa un ramo para mi matrimonio",
  },
];

export function Occasions() {
  const { settings } = useStore();
  const whatsapp = settings.whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <section id="ocasiones" style={{ backgroundColor: "var(--background)", padding: "5rem 0", scrollMarginTop: "4rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
        <SectionHeading
          eyebrow="Ocasiones"
          below={
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
              Encuentra la pieza perfecta para cada momento
            </p>
          }
        >
          ¿Para qué <Accent>ocasión</Accent>?
        </SectionHeading>
      </div>

      {/* En celular las tarjetas se deslizan de lado, como en la referencia */}
      <div className="ocasiones-grid">
        {OCCASIONS.map((o) => (
          <a
            key={o.title}
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(o.message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ocasion-card"
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.9rem",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ aspectRatio: "4 / 3", overflow: "hidden", backgroundColor: "var(--muted)" }}>
              <img
                src={o.image}
                alt={o.alt}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: o.focus, display: "block", transition: "transform 0.7s ease" }}
              />
            </div>
            <div style={{ padding: "1.25rem 1.35rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500, color: "var(--heading)", margin: 0 }}>
                {o.title}
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted-foreground)", flex: 1 }}>{o.text}</p>
              <span
                style={{
                  alignSelf: "flex-start",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginTop: "0.5rem",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--primary)",
                  borderBottom: "1px solid var(--primary)",
                  paddingBottom: "1px",
                }}
              >
                Cotizar por WhatsApp <ArrowRight size={12} />
              </span>
            </div>
          </a>
        ))}
      </div>
      <style>{`
        .ocasiones-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .ocasion-card:hover img { transform: scale(1.04); }
        @media (max-width: 768px) {
          .ocasiones-grid {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 1rem;
            scrollbar-width: none;
            padding: 0 1rem 0.5rem;
            gap: 1rem;
          }
          .ocasion-card { flex: 0 0 82%; scroll-snap-align: start; }
        }
      `}</style>
    </section>
  );
}
