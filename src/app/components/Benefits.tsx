import { Gem, Truck, MessageCircleHeart, Lightbulb } from "lucide-react";
import { Accent, SectionHeading } from "./SectionHeading";

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
    <section style={{ backgroundColor: "var(--background)", position: "relative" }}>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 2rem",
          position: "relative",
        }}
      >
        <SectionHeading eyebrow="Por qué elegirnos">
          Creado con <Accent>intención</Accent>
        </SectionHeading>

        {/* Benefits grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0",
            borderTop: "1px solid var(--border)",
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
                  borderRight: !isLast ? "1px solid var(--border)" : "none",
                  borderBottom: "1px solid var(--border)",
                }}
                className={i >= 2 ? "max-lg:border-b-0" : ""}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} color="var(--gold)" />
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: "var(--heading)",
                    margin: "0 0 0.6rem",
                    lineHeight: 1.2,
                  }}
                >
                  {b.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--muted-foreground)",
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
