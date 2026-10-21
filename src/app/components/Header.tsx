import { Link, useLocation } from "react-router";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { HeaderSearch } from "./HeaderSearch";

const navLinks = [
  { label: "Inicio", to: "/" },
  { label: "Productos", to: "/productos" },
  { label: "Ocasión", to: "/#ocasiones" },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Contacto", to: "/contacto" },
];

/**
 * Encabezado de la tienda (inspirado en johnbead.com): una fila crema con logo,
 * buscador y bolsa, y debajo la barra verde de navegación. Es sticky y va en
 * PageLayout, así que queda visible al bajar y en todas las páginas, también en
 * celular (la barra verde se desliza de lado si no cabe).
 */
export function Header() {
  const { cartCount, setIsCartOpen } = useStore();
  const { pathname } = useLocation();
  // La página actual queda marcada; "Ocasión" es una sección de la portada, no una página
  const activeLabel = navLinks.find((l) => l.to === pathname)?.label ?? (pathname.startsWith("/producto/") ? "Productos" : null);

  return (
    <header
      style={{
        backgroundColor: "var(--background)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 0 var(--border)",
      }}
    >
      {/* Fila principal: logo · buscador · bolsa */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0.75rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
        }}
        className="max-sm:px-4 max-sm:gap-3"
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }} className="hover:opacity-85" aria-label="Bloom Eterno, ir al inicio">
          <img
            src="/logos/bloom-isotipo.png"
            alt="Bloom Eterno"
            style={{ height: "52px", width: "auto", objectFit: "contain", display: "block" }}
            className="max-sm:h-10"
          />
        </Link>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
          <div style={{ width: "100%", maxWidth: "620px" }}>
            <HeaderSearch />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          {/* Acceso al panel (discreto, solo ícono) */}
          <Link
            to="/admin"
            title="Panel de administración"
            aria-label="Panel de administración"
            style={{ color: "var(--muted-foreground)", display: "flex", padding: "0.5rem", borderRadius: "50%" }}
            className="hover:opacity-70"
          >
            <SlidersHorizontal size={17} strokeWidth={1.5} />
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            title="Ver bolsa de compras"
            aria-label={`Ver bolsa de compras (${cartCount} productos)`}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "2rem",
              padding: "0.55rem 1rem",
              cursor: "pointer",
              color: "var(--heading)",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
            className="hover:opacity-80 max-sm:!px-2.5"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="max-sm:hidden">Bolsa</span>
            {cartCount > 0 && (
              <span
                style={{
                  minWidth: "1.25rem",
                  height: "1.25rem",
                  padding: "0 0.3rem",
                  borderRadius: "1rem",
                  backgroundColor: "var(--gold)",
                  color: "var(--heading)",
                  fontSize: "0.65rem",
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
        </div>
      </div>

      {/* Barra de navegación verde */}
      <nav aria-label="Navegación principal" style={{ backgroundColor: "var(--olive-dark)" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            justifyContent: "center",
            gap: "2.5rem",
            overflowX: "auto",
            whiteSpace: "nowrap",
            scrollbarWidth: "none",
          }}
          className="max-sm:!gap-3 max-sm:!justify-between max-sm:px-4"
        >
          {navLinks.map((link) => {
            const isActive = link.label === activeLabel;
            return (
              <Link
                key={link.label}
                to={link.to}
                aria-current={isActive ? "page" : undefined}
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--background)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.14em",
                  fontWeight: isActive ? 600 : 400,
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "0.85rem 0",
                  borderBottom: isActive ? "2px solid var(--background)" : "2px solid transparent",
                  opacity: isActive ? 1 : 0.85,
                  transition: "opacity 0.2s",
                }}
                className="max-sm:!text-[0.66rem] max-sm:!tracking-[0.06em]"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = isActive ? "1" : "0.85")}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
