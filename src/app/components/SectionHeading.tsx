import { ReactNode } from "react";

/**
 * Encabezado de sección de la portada: texto pequeño dorado entre dos líneas y,
 * debajo, el título centrado (con su palabra en cursiva de acento). Lo comparten
 * Productos destacados, Colecciones, Reseñas, Por qué elegirnos y Preguntas
 * frecuentes, para que todos se vean iguales.
 */
export function SectionHeading({ eyebrow, children, below }: { eyebrow: string; children: ReactNode; below?: ReactNode }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold)" }} />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            color: "var(--gold)",
            fontWeight: 500,
            textTransform: "uppercase" as const,
          }}
        >
          {eyebrow}
        </span>
        <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold)" }} />
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
          fontWeight: 400,
          color: "var(--heading)",
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {children}
      </h2>
      {below && <div style={{ marginTop: "1.25rem" }}>{below}</div>}
    </div>
  );
}

/** Palabra de acento de los títulos: cursiva en el color --accent-italic. */
export function Accent({ children }: { children: ReactNode }) {
  return <em style={{ fontStyle: "italic", color: "var(--accent-italic)" }}>{children}</em>;
}
