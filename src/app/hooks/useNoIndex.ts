import { useEffect } from "react";

/**
 * Marca la página actual como "no indexar" (<meta name="robots" content="noindex">)
 * mientras el componente está montado. El sitio es indexable; esto es solo para
 * páginas que no deben aparecer en buscadores: el panel /admin y la vista de
 * "Producto no encontrado" (esa ruta responde 200 porque el producto se busca en
 * la base desde el navegador).
 */
export function useNoIndex(active = true) {
  useEffect(() => {
    if (!active) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [active]);
}
