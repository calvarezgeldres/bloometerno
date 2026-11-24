import { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Accent } from "./SectionHeading";

/**
 * Página Nosotros: la historia de Bloom Eterno (texto de Carolina, tal cual) en
 * tres bloques — Nuestra historia, Lo que buscamos, Cómo trabajamos — y un cierre
 * que lleva al catálogo. Mismo estilo que la portada: fondo crema, títulos en
 * verde con cursiva de acento y fotos en recuadros redondeados.
 */
export function BrandStory() {
  return (
    <section id="marca" style={{ backgroundColor: "var(--background)" }}>
      {/* Nuestra historia: texto + foto */}
      <div className="historia-grid" style={{ paddingTop: "4.5rem" }}>
        <div className="historia-texto">
          <Title>
            Nuestra <Accent>historia</Accent>
          </Title>
          <Paragraph>
            Bloom Eterno nació de una pregunta muy simple: ¿qué regalar para el Día de la Madre? Buscando algo distinto,
            descubrimos el <em>french beading</em>, una técnica que forma flores con mostacillas y alambre, pétalo por pétalo.
            Ese primer ramo fue un regalo hecho a mano y con mucho cariño. Ahí entendimos que habíamos encontrado algo
            especial.
          </Paragraph>
        </div>
        <Photo src="/gallery/lilium-azul-mano.webp" alt="Ramo de lirios azules tejidos en mostacillas, sostenido en la mano" />
      </div>

      {/* La frase que resume la marca, destacada */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "4.5rem 2rem", textAlign: "center" }}>
        <div style={{ width: "2.5rem", height: "1px", backgroundColor: "var(--gold)", margin: "0 auto 1.75rem" }} />
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            lineHeight: 1.35,
            color: "var(--heading)",
            margin: 0,
          }}
        >
          Lo que empezó como un hobby se transformó en Bloom Eterno:{" "}
          <span style={{ color: "var(--accent-italic)" }}>flores hechas a mano que no se marchitan.</span>
        </p>
        <div style={{ width: "2.5rem", height: "1px", backgroundColor: "var(--gold)", margin: "1.75rem auto 0" }} />
      </div>

      {/* Lo que buscamos + Cómo trabajamos: foto + texto */}
      <div className="historia-grid historia-grid-invertida" style={{ paddingBottom: "4.5rem" }}>
        <Photo src="/gallery/suculentas-manos.webp" alt="Macetero de suculentas tejidas en mostacillas, sostenido en las manos" />
        <div className="historia-texto">
          <Title>
            Lo que <Accent>buscamos</Accent>
          </Title>
          <Paragraph>
            Queremos ser una alternativa original para esos días especiales en que siempre regalamos flores. Nuestras flores
            son para quienes quieren que ese detalle dure para siempre, para quienes no se llevan bien con las plantas y
            también para quienes buscan una pieza decorativa que le dé vida a su hogar.
          </Paragraph>

          <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "2.25rem 0" }} />

          <Title>
            Cómo <Accent>trabajamos</Accent>
          </Title>
          <Paragraph>
            Creemos en crear algo bonito y duradero. Por eso trabajamos solo con materiales de alta calidad, tanto en las
            mostacillas como en el alambre. Elegimos mostacillas de tamaño y color parejos, porque esa uniformidad permite que
            cada flor se parezca lo más posible a una de verdad.
          </Paragraph>
          <Paragraph>
            Cada pieza está hecha a mano, con paciencia y dedicación, para acompañar tus momentos importantes por mucho
            tiempo.
          </Paragraph>
        </div>
      </div>

      {/* Cierre */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "4rem 2rem 5rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)",
              lineHeight: 1.3,
              color: "var(--heading)",
              margin: "0 0 1.75rem",
            }}
          >
            Encuentra la flor que <Accent>florecerá para siempre</Accent> en tu historia.
          </p>
          <Link
            to="/productos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.9rem 1.75rem",
              borderRadius: "2rem",
              textDecoration: "none",
            }}
          >
            Ver catálogo <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <style>{`
        .historia-grid {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: clamp(2rem, 6vw, 5rem);
          align-items: center;
        }
        .historia-grid-invertida { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); }
        @media (max-width: 900px) {
          .historia-grid, .historia-grid-invertida { grid-template-columns: 1fr; gap: 2rem; padding-left: 1.25rem; padding-right: 1.25rem; }
          /* En celular la foto va siempre arriba del texto */
          .historia-grid .historia-texto { order: 1; }
        }
      `}</style>
    </section>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        fontWeight: 400,
        lineHeight: 1.15,
        color: "var(--heading)",
        margin: "0 0 1.25rem",
      }}
    >
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", lineHeight: 1.85, fontWeight: 300, color: "var(--foreground)", margin: "0 0 1.1rem" }}>
      {children}
    </p>
  );
}

function Photo({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: "4 / 5", backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}>
      <img src={src} alt={alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}
