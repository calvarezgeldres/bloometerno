import { useState } from "react";
import { Link } from "react-router";
import { ShoppingBag, Menu, X, SlidersHorizontal } from "lucide-react";
import { useStore } from "../context/StoreContext";

const navLinks = [
  { label: "Inicio", to: "/" },
  { label: "Productos", to: "/productos" },
  { label: "Ocasión", to: "/productos" },
  { label: "Kits", to: "/kits" },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Contacto", to: "/contacto" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useStore();

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
            color: "rgba(255,252,249,0.7)",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "4.5rem",
          gap: "1.5rem",
        }}
      >
        {/* Left logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            transition: "opacity 0.2s",
            flexShrink: 0,
          }}
          className="hover:opacity-85"
        >
          <img
            src="/logos/bloom-logo-full.png"
            alt="Bloom Eterno - Hecho a mano. Hecho para siempre"
            style={{
              height: "42px",
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Link>

        {/* Nav + icons */}
        <div className="hidden lg:flex items-center justify-end gap-7" style={{ flex: 1 }}>
          <nav className="flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
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
              </Link>
            ))}
          </nav>

          <div
            style={{
              width: "1px",
              height: "1.25rem",
              backgroundColor: "var(--border)",
            }}
          />

          {/* Admin Backoffice Button */}
          <Link
            to="/admin"
            title="Panel de Administración (Inventario & Pedidos)"
            style={{
              color: "var(--foreground)",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "1rem",
              padding: "0.25rem 0.65rem",
              cursor: "pointer",
              fontSize: "0.68rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              opacity: 0.85,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.backgroundColor = "var(--cream-deep)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = "0.85";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            <span>Admin</span>
          </Link>

          {/* Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            title="Ver Bolsa de Compras"
            style={{
              position: "relative",
              color: "var(--foreground)",
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.85,
              padding: "0.4rem",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile icons */}
        <div className="flex lg:hidden items-center justify-end gap-3">
          <Link
            to="/admin"
            title="Administración"
            style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer", padding: "0.3rem", display: "flex", alignItems: "center" }}
          >
            <SlidersHorizontal size={17} strokeWidth={1.5} />
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            title="Bolsa de Compras"
            style={{ position: "relative", color: "var(--foreground)", background: "none", border: "none", cursor: "pointer", padding: "0.3rem" }}
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  fontSize: "0.55rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
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
            <Link
              key={link.label}
              to={link.to}
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
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
