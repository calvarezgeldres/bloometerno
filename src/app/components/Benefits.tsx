import { Gem, Truck, MessageCircleHeart, Lightbulb } from "lucide-react";

const benefits = [
  {
    icon: Gem,
    title: "Materiales seleccionados",
    description: "Cada piedra y mostacilla pasa por una cuidadosa selección de calidad, color y origen.",
  },
  {
    icon: Truck,
    title: "Envíos a todo Chile",
    description: "Despachos rápidos y seguros desde Santiago a cualquier región del país.",
  },
  {
    icon: MessageCircleHeart,
    title: "Atención personalizada",
    description: "Te ayudamos a elegir los materiales perfectos para tu proyecto creativo.",
  },
  {
    icon: Lightbulb,
    title: "Inspiración incluida",
    description: "Guías de combinaciones y tutoriales para que nunca te falte inspiración.",
  },
];

export function Benefits() {
  return (
    <section style={{ backgroundColor: "var(--primary)", position: "relative", overflow: "hidden" }}>
      {/* Grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 2rem",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "3.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "var(--gold-muted)",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              marginBottom: "0.75rem",
            }}
          >
            Por qué elegirnos
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 400,
              color: "var(--primary-foreground)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Creado con{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>intención</em>
          </h2>
        </div>

        {/* Benefits grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0",
            borderTop: "1px solid rgba(255,252,249,0.12)",
          }}
          className="max-lg:grid-cols-2"
        >
          {benefits.map((b, i) => {
            const Icon = b.icon;
            const isLast = i === benefits.length - 1;
            return (
              <div
                key={i}
                style={{
                  padding: "2.5rem 2rem",
                  borderRight: !isLast ? "1px solid rgba(255,252,249,0.12)" : "none",
                  borderBottom: "1px solid rgba(255,252,249,0.12)",
                }}
                className={i >= 2 ? "max-lg:border-b-0" : ""}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "rgba(255,252,249,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                    border: "1px solid rgba(255,252,249,0.15)",
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} color="var(--gold-light)" />
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: "var(--primary-foreground)",
                    margin: "0 0 0.6rem",
                    lineHeight: 1.2,
                  }}
                >
                  {b.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "rgba(255,252,249,0.5)",
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
