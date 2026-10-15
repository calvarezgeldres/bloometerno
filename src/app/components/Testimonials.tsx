import { Star } from "lucide-react";
import { Accent, SectionHeading } from "./SectionHeading";

const testimonials = [
  {
    name: "Javiera M.",
    location: "Providencia, Santiago",
    quote:
      "Los materiales son preciosos y llegan súper bien embalados. Hice un ramo de lirios en mostacillas para el cumpleaños de mi mamá y quedó espectacular.",
  },
  {
    name: "Fernanda S.",
    location: "Concepción",
    quote:
      "La atención es súper cercana, me ayudaron a elegir tonos de piedras para combinar. El envío llegó rápido incluso fuera de Santiago.",
  },
];

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
  return (
    <section style={{ backgroundColor: "var(--background)", paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
        <SectionHeading
          eyebrow="Lo que dicen nuestras creadoras"
          below={
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
              <Stars size={15} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                4.9 de 5
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  color: "var(--muted-foreground)",
                }}
              >
                · +500 piezas creadas con amor
              </span>
            </div>
          }
        >
          Confianza que <Accent>florece</Accent>
        </SectionHeading>

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
