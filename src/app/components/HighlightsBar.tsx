import { ChevronDown, CreditCard, HandHeart, Store, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "../context/StoreContext";

function formatCLP(n: number) {
  return `$${n.toLocaleString("es-CL")}`;
}

/**
 * Franja de beneficios justo bajo el banner (inspirada en delacons.com): cuatro
 * datos cortos con ícono y un botón redondo sobre el borde del banner que baja a
 * la siguiente sección. Solo afirma cosas ciertas de la tienda; el umbral de
 * despacho gratis sale de la configuración del panel, igual que en el checkout.
 */
export function HighlightsBar({ nextSectionId }: { nextSectionId: string }) {
  const { settings } = useStore();
  const freeFrom = settings.freeShippingThreshold > 0 ? formatCLP(settings.freeShippingThreshold) : null;

  const items: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: HandHeart, title: "Hecho a mano en Chile", text: "Piezas únicas, hechas para siempre" },
    freeFrom
      ? { icon: Truck, title: `Despacho gratis sobre ${freeFrom}`, text: "En Santiago (RM)" }
      : { icon: Truck, title: "Despacho a todo Chile", text: "Santiago en 24 a 48 h hábiles" },
    { icon: CreditCard, title: "Pago seguro", text: "Mercado Pago o transferencia" },
    { icon: Store, title: "Retiro sin costo", text: "En nuestro taller de Vitacura" },
  ];

  return (
    <section
      aria-label="Beneficios de comprar en Bloom Eterno"
      style={{ position: "relative", backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}
    >
      {/* Botón sobre el borde del banner: baja a la siguiente sección */}
      <button
        type="button"
        aria-label="Ir a la siguiente sección"
        onClick={() => {
          // Descuenta el encabezado fijo (su alto cambia entre computador y celular)
          const target = document.getElementById(nextSectionId);
          if (!target) return;
          const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerHeight, behavior: "smooth" });
        }}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          border: "1px solid var(--border)",
          backgroundColor: "var(--background)",
          color: "var(--heading)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(5,60,41,0.12)",
          zIndex: 2,
        }}
      >
        <ChevronDown size={20} strokeWidth={1.75} />
      </button>

      <div className="highlights-grid">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            {/* Mismo formato de ícono que "Por qué elegirnos" */}
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                flexShrink: 0,
                borderRadius: "0.5rem",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} strokeWidth={1.5} color="var(--gold)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "var(--heading)", lineHeight: 1.3 }}>{title}</p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{text}</p>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .highlights-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.25rem 2rem 1.75rem;
          display: grid;
          grid-template-columns: repeat(4, auto);
          justify-content: space-between;
          gap: 1.5rem 2rem;
        }
        @media (max-width: 1024px) {
          .highlights-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); justify-content: stretch; }
        }
        @media (max-width: 480px) {
          .highlights-grid { padding: 2.25rem 1rem 1.5rem; gap: 1.25rem 0.9rem; }
        }
      `}</style>
    </section>
  );
}
