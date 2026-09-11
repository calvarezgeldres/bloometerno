import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "¿Cuánto demora el envío?",
    a: "Los despachos a la Región Metropolitana llegan en 1 a 3 días hábiles, y a regiones entre 3 y 6 días hábiles. Te enviamos el número de seguimiento apenas tu pedido sale de nuestro taller.",
  },
  {
    q: "¿Puedo personalizar los colores de un kit o ramo?",
    a: "Sí. Escríbenos por WhatsApp o Instagram antes de comprar y te ayudamos a elegir la combinación de piedras y mostacillas que más te guste.",
  },
  {
    q: "¿Qué cuidados necesitan las piezas?",
    a: "Evita la exposición directa al agua y al sol prolongado. Para limpiarlas basta un paño seco y suave. Así conservan su color y brillo por años.",
  },
  {
    q: "¿Aceptan cambios o devoluciones?",
    a: "Sí, tienes 7 días desde que recibes tu pedido para solicitar un cambio si el producto llega en mal estado o no corresponde a lo comprado.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Webpay, Mercado Pago, transferencia bancaria y efectivo en retiro coordinado.",
  },
];

export function FAQ() {
  return (
    <section style={{ backgroundColor: "var(--cream-deep)", paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "var(--gold)",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              marginBottom: "0.75rem",
            }}
          >
            Preguntas frecuentes
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
            Resolvemos tus <em style={{ fontStyle: "italic", color: "var(--primary)" }}>dudas</em>
          </h2>
        </div>

        {/* Accordion */}
        <AccordionPrimitive.Root type="single" collapsible style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((item, i) => (
            <AccordionPrimitive.Item
              key={item.q}
              value={`item-${i}`}
              style={{
                borderBottom: i < faqs.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <AccordionPrimitive.Header>
                <AccordionPrimitive.Trigger
                  className="group"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "1.5rem 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      color: "var(--foreground)",
                    }}
                  >
                    {item.q}
                  </span>
                  <Plus
                    size={18}
                    strokeWidth={1.5}
                    color="var(--primary)"
                    className="transition-transform duration-200 group-data-[state=open]:rotate-45"
                    style={{ flexShrink: 0 }}
                  />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    lineHeight: 1.75,
                    color: "var(--muted-foreground)",
                    fontWeight: 300,
                    margin: "0 0 1.5rem",
                    maxWidth: "620px",
                  }}
                >
                  {item.a}
                </p>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </section>
  );
}
