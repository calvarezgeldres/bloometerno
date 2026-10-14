import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

/**
 * Al pasar a otra página, la deja arriba. Sin esto, la SPA conserva el scroll de
 * la página anterior y el cliente llega al final de la nueva (ej: al tocar una
 * categoría desde el final de la portada).
 *
 * - Solo reacciona al cambio de ruta (pathname): cambiar ?variante= en el detalle
 *   del producto no debe mover la página.
 * - Atrás/Adelante (POP) no se toca: ahí el navegador devuelve al cliente adonde estaba.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
