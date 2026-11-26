import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

// Servido en /sitemap.xml (rewrite en vercel.json). Se arma al momento leyendo los
// productos activos de Neon, así un producto nuevo cargado desde el panel aparece
// sin redeploy. No incluye /admin ni URLs con ?variante= (no son canónicas).

const BASE_URL = "https://www.bloometerno.cl";

/** Páginas fijas del sitio público */
const STATIC_PATHS = [
  "/",
  "/productos",
  "/nosotros",
  "/contacto",
  "/politica-de-envios",
  "/cambios-y-devoluciones",
  "/privacidad",
];

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function urlEntry(path: string): string {
  return `  <url><loc>${xmlEscape(BASE_URL + path)}</loc></url>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).end();

  const paths = [...STATIC_PATHS];
  try {
    const sql = getDb();
    // Categorías con al menos un producto activo, en el orden del panel
    const categories = await sql`
      SELECT c.name
      FROM categories c
      WHERE EXISTS (SELECT 1 FROM products p WHERE p.is_active = true AND p.category_id = c.id)
      ORDER BY c.sort_order, c.name
    `;
    for (const c of categories) paths.push(`/productos?categoria=${encodeURIComponent(c.name)}`);

    const products = await sql`SELECT id FROM products WHERE is_active = true ORDER BY created_at`;
    for (const p of products) paths.push(`/producto/${encodeURIComponent(p.id)}`);
  } catch (err) {
    // Sin base de datos se publica al menos el sitemap de las páginas fijas
    console.error("[/api/sitemap] No se pudieron leer los productos:", err);
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths.map(urlEntry).join("\n") +
    "\n</urlset>\n";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Una hora en el CDN de Vercel: suficiente para buscadores y no consulta Neon en cada visita
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
