import { Instagram, MessageCircle, MessageCircleHeart, Star } from "lucide-react";
import { Accent, SectionHeading } from "./SectionHeading";
import { useStore } from "../context/StoreContext";
import { whatsappLink } from "../../lib/whatsapp";

/**
 * Reseñas de clientas reales. Las que traía la plantilla eran de ejemplo y se
 * quitaron (también la calificación "4.9 de 5 · +500 piezas", que no tenía
 * respaldo). Para mostrar reseñas, agrégalas aquí; mientras la lista esté
 * vacía, la sección invita a compartir la experiencia por WhatsApp o Instagram.
 */
const testimonials: { name: string; location: string; quote: string }[] = [];

function Stars({ size = 12 }: { size?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill="var(--gold)" color="var(--gold)" strokeWidth={0} />
      ))}
    </div>
  );
}

export function Testimonials() {
  const { settings } = useStore();

  return (
    <section style={{ backgroundColor: "var(--background)", paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
        <SectionHeading eyebrow="Lo que dicen nuestras creadoras">
          Confianza que <Accent>florece</Accent>
        </SectionHeading>

        {testimonials.length === 0 && (
          <div
            style={{
              maxWidth: "640px",
              margin: "0 auto",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.9rem",
              padding: "2.5rem 2rem",
            }}
          >
            {/* Mismo formato de ícono que "Por qué elegirnos" */}
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                margin: "0 auto 1.25rem",
                borderRadius: "0.5rem",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageCircleHeart size={18} strokeWidth={1.5} color="var(--gold)" />
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--heading)", margin: "0 0 0.6rem" }}>
              ¿Ya tienes tu pieza Bloom Eterno?
            </p>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--muted-foreground)", margin: "0 0 1.5rem" }}>
              Muy pronto compartiremos aquí las experiencias de nuestras clientas. Nos encantaría conocer la tuya: cuéntanos
              cómo te fue y mándanos una foto de tu pieza.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <a
                href={whatsappLink(settings.whatsappNumber, "Hola! Quiero compartir mi experiencia con Bloom Eterno")}
                target="_blank"
                rel="noopener noreferrer"
                style={shareButtonStyle}
              >
                <MessageCircle size={15} strokeWidth={1.75} /> Cuéntanos por WhatsApp
              </a>
              <a href="https://instagram.com/bloometernocl" target="_blank" rel="noopener noreferrer" style={shareButtonStyle}>
                <Instagram size={15} strokeWidth={1.75} /> Etiquétanos en Instagram
              </a>
            </div>
          </div>
        )}

        {/* Cards */}
        <div
          style={{ display: "grid", gridTemplateColumns: `repeat(${testimonials.length}, 1fr)`, gap: "1.5rem" }}
          className="max-lg:grid-cols-1"
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.9rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Stars />
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "1.05rem",
                  lineHeight: 1.55,
                  color: "var(--foreground)",
                  margin: 0,
                  flex: 1,
                }}
              >
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--primary)",
                    flexShrink: 0,
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
                    {t.name}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--muted-foreground)", margin: 0 }}>
                    {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const shareButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.6rem 1.1rem",
  borderRadius: "2rem",
  border: "1px solid var(--border)",
  backgroundColor: "var(--background)",
  color: "var(--heading)",
  fontSize: "0.8rem",
  fontWeight: 500,
  textDecoration: "none",
};
