import { motion } from "motion/react";

const items = [
  "Piedras Naturales",
  "✦",
  "Mostacillas",
  "✦",
  "Cristales Facetados",
  "✦",
  "Cuarzo Rosa",
  "✦",
  "Ojo de Tigre",
  "✦",
  "Kits Creativos",
  "✦",
  "Separadores Dorados",
  "✦",
  "Bisutería Artesanal",
  "✦",
  "Flores Secas",
  "✦",
  "Dijes Naturales",
  "✦",
];

export function Marquee() {
  const repeated = [...items, ...items, ...items];

  return (
    <div
      style={{
        backgroundColor: "var(--primary)",
        overflow: "hidden",
        padding: "0.875rem 0",
        borderTop: "1px solid rgba(255,252,249,0.08)",
        borderBottom: "1px solid rgba(255,252,249,0.08)",
      }}
    >
      <motion.div
        animate={{ x: [0, "-33.333%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        style={{ display: "flex", gap: "2rem", width: "max-content" }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: item === "✦" ? "inherit" : "var(--font-body)",
              fontSize: item === "✦" ? "0.5rem" : "0.68rem",
              letterSpacing: item === "✦" ? 0 : "0.15em",
              color: item === "✦" ? "var(--gold)" : "rgba(255,252,249,0.55)",
              fontWeight: 400,
              textTransform: item === "✦" ? undefined : "uppercase" as const,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
