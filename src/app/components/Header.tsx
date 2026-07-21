import { useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Productos", href: "#productos" },
  { label: "Piedras", href: "#categorias" },
  { label: "Mostacillas", href: "#categorias" },
  { label: "Kits", href: "#categorias" },
  { label: "Nosotros", href: "#marca" },
  { label: "Contacto", href: "#footer" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(2);

  return (
    <header
      style={{
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          backgroundColor: "var(--olive-dark)",
          padding: "0.5rem 1rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            color: "rgba(246,240,227,0.7)",
            fontWeight: 400,
          }}
        >
          ✦&ensp;ENVÍOS A TODO CHILE&ensp;·&ensp;MATERIALES SELECCIONADOS&ensp;·&ensp;ATENCIÓN PERSONALIZADA&ensp;✦
        </p>
      </div>

      {/* Main header */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          height: "4.5rem",
          gap: "1rem",
        }}
      >
        {/* Left nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.slice(0, 4).map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--foreground)",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                fontWeight: 400,
                textTransform: "uppercase" as const,
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Center logo */}
        <a href="#inicio" style={{ textDecoration: "none", textAlign: "center" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "var(--foreground)",
                lineHeight: 1,
              }}
            >
              Bloom <em style={{ color: "var(--gold)", fontWeight: 400 }}>Eterno</em>
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.58rem",
                letterSpacing: "0.22em",
                color: "var(--muted-foreground)",
                fontWeight: 400,
                marginTop: "0.2rem",
                textTransform: "uppercase" as const,
              }}
            >
              Bisutería &amp; Materiales
            </div>
          </div>
        </a>

        {/* Right nav + icons */}
        <div className="hidden lg:flex items-center justify-end gap-7">
          {navLinks.slice(4).map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--foreground)",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                fontWeight: 400,
                textTransform: "uppercase" as const,
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
            >
              {link.label}
            </a>
          ))}

          <div
            style={{
              width: "1px",
              height: "1.25rem",
              backgroundColor: "var(--border)",
            }}
          />

          {[Search, User].map((Icon, i) => (
            <button
              key={i}
              style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
            >
              <Icon size={16} strokeWidth={1.5} />
            </button>
          ))}

          <button
            style={{
              position: "relative",
              color: "var(--foreground)",
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.6,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-6px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "var(--gold)",
                  color: "#fff",
                  fontSize: "0.55rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          <a
            href="#productos"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              color: "var(--primary-foreground)",
              backgroundColor: "var(--primary)",
              padding: "0.55rem 1.25rem",
              borderRadius: "2rem",
              textDecoration: "none",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--olive-dark)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--primary)")}
          >
            Comprar
          </a>
        </div>

        {/* Mobile icons */}
        <div className="flex lg:hidden items-center justify-end gap-3">
          <button style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer" }}>
            <ShoppingBag size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer" }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: "var(--background)",
            borderTop: "1px solid var(--border)",
            padding: "1.5rem 2rem 2rem",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                color: "var(--foreground)",
                padding: "0.6rem 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                fontStyle: "italic",
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#productos"
            style={{
              display: "block",
              marginTop: "1.25rem",
              textAlign: "center",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              color: "var(--primary-foreground)",
              backgroundColor: "var(--primary)",
              padding: "0.9rem",
              borderRadius: "2rem",
              textDecoration: "none",
            }}
          >
            Comprar ahora
          </a>
        </div>
      )}
    </header>
  );
}
