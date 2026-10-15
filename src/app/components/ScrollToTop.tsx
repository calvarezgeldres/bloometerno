import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

/**
 * Al pasar a otra página, la deja arriba. Sin esto, la SPA conserva el scroll de
 * la página anterior y el cliente llega al final de la nueva (ej: al tocar una
 * categoría desde el final de la portada).
 *
 * - Cambio de ruta (pathname): sube al instante.
 * - Link con ancla (ej: "/#preguntas-frecuentes" en el footer): baja hasta esa
 *   sección; suave si ya estaba en esa página.
 * - Clic en un link a la misma página en que ya está (ej: "Inicio" en el footer
 *   estando en la portada): sube con scroll suave, para que se note que volvió.
 * - Cambios solo de query (?variante= en el detalle del producto) no mueven la página.
 * - Atrás/Adelante (POP) no se toca: ahí el navegador devuelve al cliente adonde estaba.
 */
export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(location);

  useEffect(() => {
    const prev = previous.current;
    previous.current = location;
    if (navigationType === "POP") return;

    const samePath = prev.pathname === location.pathname;

    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        // Al llegar desde otra página se espera un cuadro a que la nueva página quede pintada
        requestAnimationFrame(() => target.scrollIntoView({ behavior: samePath ? "smooth" : "auto", block: "start" }));
        return;
      }
    }

    const sameUrl = samePath && prev.search === location.search && prev.hash === location.hash;
    if (!samePath) window.scrollTo(0, 0);
    else if (sameUrl) window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return null;
}
