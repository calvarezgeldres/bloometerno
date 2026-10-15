/**
 * Separador entre secciones de la portada: una línea fina con un ✦ dorado al
 * centro. Normalmente no lleva margen propio (el espacio lo dan las secciones con
 * su padding). Junto a una sección de fondo de color que llega al borde (ej: la
 * verde de Benefits), spaceBelow/spaceAbove agregan ese espacio del lado crema
 * para que la línea no quede pegada al bloque de color.
 */
export function SectionDivider({ spaceAbove = false, spaceBelow = false }: { spaceAbove?: boolean; spaceBelow?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: "var(--background)",
        padding: `${spaceAbove ? "5rem" : "0"} 2rem ${spaceBelow ? "5rem" : "0"}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
        <span style={{ color: "var(--gold)", fontSize: "0.6rem", letterSpacing: "0.01em" }}>✦</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
      </div>
    </div>
  );
}
