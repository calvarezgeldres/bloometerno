import React, { ReactNode } from "react";
import { MessageCircle, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageLayout } from "./PageLayout";
import { PageHeader } from "./PageHeader";
import { useStore } from "../context/StoreContext";
import { CONTACT_EMAIL } from "../data/contact";

export type PolicyHighlight = { icon: LucideIcon; title: string; text: ReactNode };
export type PolicySection = { id: string; title: string; content: ReactNode };

/**
 * Plantilla de las páginas de políticas (envíos, cambios y devoluciones,
 * privacidad): encabezado verde, resumen en tarjetas, índice, secciones y un
 * recuadro de contacto con el WhatsApp y el email configurados en el panel.
 */
export function PolicyPage({
  eyebrow,
  title,
  subtitle,
  updated,
  intro,
  highlights,
  sections,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Fecha de la última actualización, ej: "15 de octubre de 2026" */
  updated: string;
  intro?: ReactNode;
  highlights?: PolicyHighlight[];
  sections: PolicySection[];
}) {
  const { settings } = useStore();
  const whatsapp = settings.whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <PageLayout>
      <main>
        <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <section style={{ backgroundColor: "var(--background)", padding: "4rem 2rem 5rem" }}>
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            {intro && <div style={{ ...paragraphStyle, fontSize: "1rem", marginBottom: "2.5rem" }}>{intro}</div>}

            {/* Resumen en tarjetas, con el formato de íconos de "Por qué elegirnos" */}
            {highlights && highlights.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${highlights.length}, 1fr)`,
                  gap: "1rem",
                  marginBottom: "3rem",
                }}
                className="max-lg:grid-cols-1"
              >
                {highlights.map(({ icon: Icon, title: hTitle, text }) => (
                  <div
                    key={hTitle}
                    style={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.9rem",
                      padding: "1.5rem 1.25rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "0.5rem",
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <Icon size={18} strokeWidth={1.5} color="var(--gold)" />
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 500, color: "var(--heading)", margin: "0 0 0.45rem" }}>
                      {hTitle}
                    </h3>
                    <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--muted-foreground)", margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Índice */}
            <nav
              aria-label="En esta página"
              style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "1.25rem 0", marginBottom: "3rem" }}
            >
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  fontWeight: 500,
                  margin: "0 0 0.75rem",
                }}
              >
                En esta página
              </p>
              {/* Tailwind (preflight) quita los números de las listas: se vuelven a poner */}
              <ol
                style={{ margin: 0, paddingLeft: "1.2rem", listStyle: "decimal", columnGap: "2rem" }}
                className={sections.length > 5 ? "politica-indice-2col" : undefined}
              >
                {sections.map((s) => (
                  <li key={s.id} style={{ fontSize: "0.88rem", lineHeight: 1.9, color: "var(--muted-foreground)" }}>
                    <a href={`#${s.id}`} style={{ color: "var(--heading)", textDecoration: "none" }}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <style>{`
              .politica-indice-2col { columns: 2; }
              @media (max-width: 640px) { .politica-indice-2col { columns: 1; } }
            `}</style>

            {/* Secciones */}
            {sections.map((s, i) => (
              <article key={s.id} id={s.id} style={{ scrollMarginTop: "9rem", marginBottom: "2.75rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 400, color: "var(--heading)", margin: "0 0 1rem" }}>
                  <span style={{ fontStyle: "italic", color: "var(--accent-italic)", marginRight: "0.5rem" }}>{i + 1}.</span>
                  {s.title}
                </h2>
                <div style={paragraphStyle}>{s.content}</div>
              </article>
            ))}

            {/* Contacto */}
            <div
              style={{
                marginTop: "3.5rem",
                padding: "1.75rem",
                borderRadius: "0.9rem",
                backgroundColor: "var(--cream-deep)",
                textAlign: "center",
              }}
            >
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 400, color: "var(--heading)", margin: "0 0 0.5rem" }}>
                ¿Tienes alguna <em style={{ fontStyle: "italic", color: "var(--accent-italic)" }}>duda</em>?
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--muted-foreground)", margin: "0 0 1.25rem" }}>
                Escríbenos y te respondemos a la brevedad.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" style={contactButtonStyle}>
                    <MessageCircle size={15} strokeWidth={1.75} /> WhatsApp {settings.whatsappNumber}
                  </a>
                )}
                <a href={`mailto:${CONTACT_EMAIL}`} style={contactButtonStyle}>
                  <Mail size={15} strokeWidth={1.75} /> {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "2rem" }}>
              Última actualización: {updated}
            </p>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

const paragraphStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  lineHeight: 1.8,
  color: "var(--foreground)",
  fontWeight: 300,
};

const contactButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.6rem 1.1rem",
  borderRadius: "2rem",
  border: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  color: "var(--heading)",
  fontSize: "0.82rem",
  fontWeight: 500,
  textDecoration: "none",
};

/** Párrafo y lista con el espaciado de las páginas de políticas. */
export function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 0.9rem" }}>{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul style={{ margin: "0 0 0.9rem", paddingLeft: "1.25rem", listStyle: "disc", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {children}
    </ul>
  );
}

export function formatCLP(n: number) {
  return `$${n.toLocaleString("es-CL")}`;
}
