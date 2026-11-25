import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

/** Posición guardada de cada entrada del historial (por location.key), por si se recarga la pestaña. */
const STORAGE_KEY = "bloom_scroll_positions";

function readPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function savePosition(key: string, y: number) {
  try {
    const all = readPositions();
    all[key] = Math.round(y);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* sin sessionStorage (modo privado): solo no se restaura */
  }
}

/**
 * Maneja el scroll al navegar:
 * - Cambio de ruta (pathname): la nueva página parte arriba (sin esto, la SPA
 *   conserva el scroll de la anterior y el cliente llega al final de la nueva).
 * - Link con ancla (ej: "/#preguntas-frecuentes"): baja hasta esa sección;
 *   suave si ya estaba en esa página.
 * - Link a la misma página en que ya está (ej: "Inicio" en el footer estando en
 *   la portada): sube con scroll suave, para que se note que volvió.
 * - Cambios solo de query (?variante=, ?categoria=) no mueven la página.
 * - Atrás/Adelante (POP): vuelve a la posición exacta en que estaba esa página.
 *   Se guarda mientras se navega y se restaura cuando la página ya tiene alto
 *   suficiente (el catálogo puede terminar de cargar después), en vez de
 *   depender del navegador, que la restauraba antes de tiempo y quedaba corrida.
 */
export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(location);
  const currentKey = useRef(location.key);

  // El sitio maneja la restauración (ver arriba), no el navegador
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  // Guardar la posición de la página actual mientras se hace scroll
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => savePosition(currentKey.current, window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // La posición se guarda solo al hacer scroll (arriba): leerla al cambiar de página
  // podría dar un valor ya recortado si la nueva es más corta. Acá solo se cambia
  // a qué entrada del historial corresponde el scroll de ahora en adelante.
  useLayoutEffect(() => {
    currentKey.current = location.key;
  }, [location.key]);

  useEffect(() => {
    const prev = previous.current;
    previous.current = location;

    if (navigationType === "POP") {
      // Sin posición guardada = esa página nunca se desplazó: se muestra desde arriba
      const target = readPositions()[location.key] ?? 0;
      // Reintentar hasta que la página alcance esa altura (máx. ~1,5 s)
      let tries = 0;
      let frame = 0;
      const restore = () => {
        const reachable = document.documentElement.scrollHeight - window.innerHeight >= target - 2;
        if (reachable || tries++ > 90) window.scrollTo(0, target);
        else frame = requestAnimationFrame(restore);
      };
      restore();
      return () => cancelAnimationFrame(frame);
    }

    const samePath = prev.pathname === location.pathname;

    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        // Al llegar desde otra página se espera un cuadro a que la nueva página quede pintada
        requestAnimationFrame(() => el.scrollIntoView({ behavior: samePath ? "smooth" : "auto", block: "start" }));
        return;
      }
    }

    // Misma página, mismos filtros y sin ancla = un link a la página en que ya está
    // (también desde una sección: "/#preguntas-frecuentes" → "Inicio")
    const toSamePageTop = samePath && prev.search === location.search && !location.hash;
    if (!samePath) window.scrollTo(0, 0);
    else if (toSamePageTop) window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return null;
}
