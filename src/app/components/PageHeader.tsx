import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--olive-dark)",
        padding: "3.5rem 2rem 3rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: "640px", margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold-light)" }} />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "var(--gold-muted)",
              fontWeight: 500,
              textTransform: "uppercase" as const,
            }}
          >
            {eyebrow}
          </span>
          <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold-light)" }} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            fontWeight: 400,
            color: "var(--background)",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(255,252,249,0.65)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              fontWeight: 300,
              margin: "1rem auto 0",
              maxWidth: "480px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
