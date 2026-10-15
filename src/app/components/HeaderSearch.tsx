import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Search, X } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { productMatchesSearch, productPath } from "../../lib/catalog";

const MAX_SUGGESTIONS = 6;

function formatCLP(n: number) {
  return `$${n.toLocaleString("es-CL")}`;
}

/**
 * Buscador del encabezado. Mientras se escribe muestra hasta 6 productos (con foto,
 * categoría y precio); Enter o "Ver todos" abre el catálogo filtrado (/productos?buscar=).
 * Flechas ↑/↓ recorren las sugerencias y Escape las cierra.
 */
export function HeaderSearch() {
  const { products } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const term = query.trim();
  const matches = term ? products.filter((p) => productMatchesSearch(p, term)) : [];
  const suggestions = matches.slice(0, MAX_SUGGESTIONS);

  // Cerrar al cambiar de página y al hacer clic fuera
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToResults = () => {
    if (!term) return;
    navigate(`/productos?buscar=${encodeURIComponent(term)}`);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && suggestions[highlight]) navigate(productPath(suggestions[highlight]));
      else goToResults();
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} style={{ position: "relative", width: "100%" }}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goToResults();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "2rem",
          padding: "0 0.5rem 0 1.1rem",
          height: "2.75rem",
        }}
      >
        <Search size={16} strokeWidth={1.75} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        <input
          // type="text" (no "search"): el de búsqueda agrega su propia ✕ además de la nuestra
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar productos o colores…"
          aria-label="Buscar productos"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "var(--foreground)",
          }}
        />
        {query && (
          <button
            type="button"
            aria-label="Borrar búsqueda"
            onClick={() => {
              setQuery("");
              setHighlight(-1);
            }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", padding: "0.25rem" }}
          >
            <X size={15} />
          </button>
        )}
        <button
          type="submit"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            borderRadius: "2rem",
            padding: "0.45rem 1.1rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            flexShrink: 0,
          }}
          className="max-sm:hidden"
        >
          Buscar
        </button>
      </form>

      {open && term && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.4rem)",
            left: 0,
            right: 0,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.9rem",
            boxShadow: "0 12px 32px rgba(5,60,41,0.14)",
            overflow: "hidden",
            zIndex: 60,
          }}
        >
          {suggestions.length === 0 ? (
            <p style={{ margin: 0, padding: "1rem 1.1rem", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
              No encontramos productos para "{term}".
            </p>
          ) : (
            <>
              {suggestions.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => {
                    navigate(productPath(p));
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    width: "100%",
                    padding: "0.6rem 1.1rem",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    backgroundColor: highlight === i ? "var(--cream-deep)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <img
                    src={p.image}
                    alt=""
                    style={{ width: "2.6rem", height: "3.45rem", objectFit: "cover", borderRadius: "0.35rem", flexShrink: 0, backgroundColor: "var(--muted)" }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
                      {p.category}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.92rem",
                        color: "var(--heading)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </span>
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)", flexShrink: 0 }}>{formatCLP(p.price)}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={goToResults}
                style={{
                  width: "100%",
                  padding: "0.75rem 1.1rem",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "var(--primary)",
                  textAlign: "left",
                }}
              >
                Ver {matches.length === 1 ? "el resultado" : `los ${matches.length} resultados`} en el catálogo →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
