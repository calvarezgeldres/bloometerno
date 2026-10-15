/**
 * Separador entre secciones de la portada: una línea fina con un ✦ dorado al
 * centro. No lleva margen propio: el espacio lo dan las secciones con su padding.
 */
export function SectionDivider() {
  return (
    <div aria-hidden="true" style={{ backgroundColor: "var(--background)", padding: "0 2rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
        <span style={{ color: "var(--gold)", fontSize: "0.6rem", letterSpacing: "0.01em" }}>✦</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
      </div>
    </div>
  );
}
