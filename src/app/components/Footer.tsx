import { Instagram, MessageCircle, Shield, Truck } from "lucide-react";

const navColumns = [
  {
    heading: "Tienda",
    links: [
      { label: "Piedras naturales", href: "#categorias" },
      { label: "Mostacillas", href: "#categorias" },
      { label: "Cristales y dijes", href: "#categorias" },
      { label: "Kits creativos", href: "#categorias" },
      { label: "Herramientas", href: "#categorias" },
    ],
  },
  {
    heading: "Información",
    links: [
      { label: "Nosotros", href: "#marca" },
      { label: "Política de envíos", href: "#" },
      { label: "Cambios y devoluciones", href: "#" },
      { label: "Preguntas frecuentes", href: "#" },
      { label: "Privacidad", href: "#" },
    ],
  },
  {
    heading: "Contacto",
    links: [
      { label: "WhatsApp: +56 9 1234 5678", href: "https://wa.me/56912345678" },
      { label: "@bloometerno", href: "https://instagram.com" },
      { label: "hola@bloometerno.cl", href: "mailto:hola@bloometerno.cl" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      id="footer"
      style={{ backgroundColor: "#1A1710", color: "var(--background)" }}
    >
      {/* Main footer */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 2rem 4rem",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: "3rem",
        }}
        className="max-lg:grid-cols-2 max-sm:grid-cols-1"
      >
        {/* Brand column */}
        <div>
          {/* Official brand logo */}
          <div style={{ marginBottom: "1.75rem" }}>
            <img
              src="/logos/bloom-logo-full-light.png"
              alt="Bloom Eterno"
              style={{
                height: "54px",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(246,240,227,0.4)",
              fontSize: "0.85rem",
              lineHeight: 1.8,
              fontWeight: 300,
              margin: "0 0 1.75rem",
              maxWidth: "280px",
            }}
          >
            Materiales seleccionados para crear piezas únicas con alma natural. Bisutería, piedras, cristales y más.
          </p>

          {/* Social links */}
          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem" }}>
            {[
              { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
              { Icon: MessageCircle, href: "https://wa.me/56912345678", label: "WhatsApp" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "0.4rem",
                  backgroundColor: "rgba(246,240,227,0.08)",
                  border: "1px solid rgba(246,240,227,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(246,240,227,0.55)",
                  textDecoration: "none",
                }}
              >
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>

          {/* Trust row */}
          <div style={{ display: "flex", gap: "1rem" }}>
            {[
              { Icon: Shield, label: "Pago seguro" },
              { Icon: Truck, label: "Envío seguro" },
            ].map(({ Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Icon size={11} style={{ color: "var(--gold)", opacity: 0.7 }} strokeWidth={1.5} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    color: "rgba(246,240,227,0.3)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {navColumns.map(col => (
          <div key={col.heading}>
            <h4
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                color: "rgba(246,240,227,0.35)",
                fontWeight: 500,
                textTransform: "uppercase" as const,
                margin: "0 0 1.25rem",
              }}
            >
              {col.heading}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      color: "rgba(246,240,227,0.45)",
                      fontWeight: 300,
                      textDecoration: "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(246,240,227,0.85)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(246,240,227,0.45)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment badges */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "1.5rem 2rem",
          borderTop: "1px solid rgba(246,240,227,0.07)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            color: "rgba(246,240,227,0.25)",
            textTransform: "uppercase" as const,
            marginRight: "0.5rem",
          }}
        >
          Medios de pago
        </span>
        {["Webpay", "Mercado Pago", "Transferencia", "Efectivo"].map(m => (
          <span
            key={m}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              color: "rgba(246,240,227,0.3)",
              border: "1px solid rgba(246,240,227,0.1)",
              padding: "0.2rem 0.55rem",
              borderRadius: "0.25rem",
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "1.25rem 2rem",
          borderTop: "1px solid rgba(246,240,227,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "0.82rem",
            color: "rgba(246,240,227,0.2)",
            margin: 0,
          }}
        >
          Bloom Eterno — materiales para crear piezas con alma.
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.68rem",
            color: "rgba(246,240,227,0.2)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Bloom Eterno. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
