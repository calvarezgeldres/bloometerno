import React from "react";
import { Link } from "react-router";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { CONTACT_EMAIL } from "../data/contact";

const navColumns = [
  {
    heading: "Tienda",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Productos", href: "/productos" },
      { label: "Nosotros", href: "/nosotros" },
    ],
  },
  {
    heading: "Información",
    links: [
      { label: "Política de envíos", href: "/politica-de-envios" },
      { label: "Cambios y devoluciones", href: "/cambios-y-devoluciones" },
      { label: "Preguntas frecuentes", href: "/#preguntas-frecuentes" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
];

const contactLinks = [
  { Icon: MessageCircle, label: "WhatsApp: +56 9 1234 5678", href: "https://wa.me/56912345678" },
  { Icon: Instagram, label: "@bloometernocl", href: "https://instagram.com/bloometernocl" },
  { Icon: Mail, label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
];

// Las 3 columnas comparten estilos para que títulos y filas queden a la misma altura
const columnHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.65rem",
  letterSpacing: "0.18em",
  lineHeight: 1,
  color: "rgba(255,252,249,0.35)",
  fontWeight: 500,
  textTransform: "uppercase",
  margin: "0 0 1.25rem",
};

const columnListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
};

const columnLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  minHeight: "1.4rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.82rem",
  lineHeight: 1.4,
  color: "rgba(255,252,249,0.45)",
  fontWeight: 300,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

export function Footer() {
  return (
    <footer
      id="footer"
      style={{ backgroundColor: "var(--olive-dark)", color: "var(--background)" }}
    >
      {/* Main footer: marca a la izquierda (isotipo con el texto al lado, como
          kingcrafts.cl) y las 3 columnas de links a la derecha, alineadas arriba y
          con la misma separación entre ellas. */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 2rem 4rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "4rem",
        }}
        className="footer-main"
      >
        {/* Marca: isotipo + texto al lado */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.75rem", maxWidth: "420px" }} className="footer-brand">
          <img
            src="/logos/bloom-isotipo-light.png"
            alt="Bloom Eterno"
            style={{ height: "88px", width: "auto", objectFit: "contain", display: "block", flexShrink: 0 }}
          />
          <div>
            <h4 style={columnHeadingStyle}>Acerca de</h4>
            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "rgba(255,252,249,0.55)",
                fontSize: "0.85rem",
                lineHeight: 1.8,
                fontWeight: 300,
                margin: 0,
              }}
            >
              Materiales seleccionados para crear piezas únicas. Arreglos florales, insumos de bisutería y más.
            </p>

          </div>
        </div>

        {/* Tienda · Información · Contacto: misma separación entre columnas */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4rem", flex: "0 1 640px" }} className="footer-columns">
          {navColumns.map((col) => (
            <div key={col.heading}>
              <h4 style={columnHeadingStyle}>{col.heading}</h4>
              <ul style={columnListStyle}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      style={columnLinkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,249,0.85)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,249,0.45)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 style={columnHeadingStyle}>Contacto</h4>
            <ul style={columnListStyle}>
              {contactLinks.map(({ Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={columnLinkStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,249,0.85)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,249,0.45)")}
                  >
                    <Icon size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .footer-main { flex-direction: column; gap: 3rem !important; }
            .footer-columns { flex: none !important; width: 100%; justify-content: flex-start !important; }
          }
          @media (max-width: 640px) {
            .footer-columns { flex-wrap: wrap; gap: 2.5rem 3rem !important; }
            .footer-brand { gap: 1.25rem !important; }
            .footer-brand img { height: 64px !important; }
          }
        `}</style>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "1.25rem 2rem",
          borderTop: "1px solid rgba(255,252,249,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.68rem",
            color: "rgba(255,252,249,0.2)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Bloom Eterno. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
