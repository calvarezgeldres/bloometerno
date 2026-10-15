import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Accent, SectionHeading } from "./SectionHeading";

const faqs = [
  {
    q: "¿Cuánto demora el envío?",
    a: "En Santiago (RM) despachamos a domicilio en 24 a 48 horas hábiles. A regiones coordinamos el envío contigo por WhatsApp y te enviamos el número de seguimiento del courier. También puedes retirar sin costo en nuestro taller de Vitacura. Más detalles en nuestra política de envíos.",
  },
  {
    q: "¿Puedo personalizar los colores de un ramo?",
    a: "Sí. Escríbenos por WhatsApp o Instagram antes de comprar y te ayudamos a elegir la combinación de piedras y mostacillas que más te guste.",
  },
  {
    q: "¿Qué cuidados necesitan las piezas?",
    a: "Evita la exposición directa al agua y al sol prolongado. Para limpiarlas basta un paño seco y suave. Así conservan su color y brillo por años.",
  },
  {
    q: "¿Aceptan cambios o devoluciones?",
    a: "Sí. Tienes 10 días desde que recibes tu pedido para retractarte de la compra (con el producto sin uso y en su embalaje original) y 6 meses de garantía legal si un producto tiene una falla. Más detalles en nuestra política de cambios y devoluciones.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Transferencia bancaria y Mercado Pago (tarjetas de crédito, débito y otros medios).",
  },
];

export function FAQ() {
  return (
    <section id="preguntas-frecuentes" style={{ backgroundColor: "var(--background)", paddingTop: "5rem", paddingBottom: "5rem", scrollMarginTop: "4rem" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 2rem" }}>
        <SectionHeading eyebrow="Preguntas frecuentes">
          Resolvemos tus <Accent>dudas</Accent>
        </SectionHeading>

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
