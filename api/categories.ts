import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

// Autocontenido a propósito (sin imports relativos): ver la nota en api/mercadopago.ts.

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function getSessionUser(req: VercelRequest): string | null {
  const token = parseCookies(req.headers.cookie)["bloom_admin_session"];
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const expectedSig = Buffer.from(crypto.createHmac("sha256", secret).update(payload).digest("hex"), "hex");
  const gotSig = Buffer.from(signature, "hex");
  if (gotSig.length !== expectedSig.length || !crypto.timingSafeEqual(gotSig, expectedSig)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.u || !data.exp || Date.now() > data.exp) return null;
    return data.u as string;
  } catch {
    return null;
  }
}

function requireAuth(req: VercelRequest, res: VercelResponse): string | null {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "No autorizado. Debes iniciar sesión." });
    return null;
  }
  return user;
}

/** Normaliza la lista de características: nombre obligatorio, sin repetidos, id estable. */
function cleanAttributes(raw: unknown): { id: string; name: string; isVariant: boolean }[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: { id: string; name: string; isVariant: boolean }[] = [];
  for (const a of raw as any[]) {
    const name = String(a?.name ?? "").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({
      id: typeof a.id === "string" && a.id ? a.id : crypto.randomUUID(),
      name,
      isVariant: Boolean(a.isVariant),
    });
  }
  return out;
}

async function listCategories(sql: any) {
  return sql`
    SELECT c.*, (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.is_active = true) AS product_count
    FROM categories c
    ORDER BY c.sort_order ASC, c.name ASC
  `;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sql = getDb();

    // GET /api/categories — listar categorías (público: la tienda las usa para filtros y fichas)
    if (req.method === "GET") {
      return res.status(200).json(await listCategories(sql));
    }

    // POST /api/categories — crear categoría
    if (req.method === "POST") {
      if (!requireAuth(req, res)) return;

      const { name, description, image, attributes } = req.body as Record<string, any>;
      const cleanName = String(name ?? "").trim();
      if (!cleanName) return res.status(400).json({ error: "Falta el nombre de la categoría" });

      const dup = await sql`SELECT id FROM categories WHERE LOWER(name) = LOWER(${cleanName})`;
      if (dup.length > 0) return res.status(409).json({ error: `Ya existe una categoría llamada "${cleanName}"` });

      const rows = await sql`
        INSERT INTO categories (name, description, image, attributes, sort_order)
        VALUES (
          ${cleanName},
          ${description || null},
          ${image || null},
          ${JSON.stringify(cleanAttributes(attributes))}::jsonb,
          (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories)
        )
        RETURNING *, 0 AS product_count
      `;
      return res.status(201).json(rows[0]);
    }

    // PATCH /api/categories — editar categoría (id en el body)
    if (req.method === "PATCH") {
      if (!requireAuth(req, res)) return;

      const { id, name, description, image, attributes, sort_order } = req.body as Record<string, any>;
      if (!id) return res.status(400).json({ error: "Falta el campo id" });

      const current = await sql`SELECT * FROM categories WHERE id = ${id}`;
      if (current.length === 0) return res.status(404).json({ error: "Categoría no encontrada" });

      if (name !== undefined) {
        const cleanName = String(name).trim();
        if (!cleanName) return res.status(400).json({ error: "El nombre no puede quedar vacío" });

        const dup = await sql`SELECT id FROM categories WHERE LOWER(name) = LOWER(${cleanName}) AND id <> ${id}`;
        if (dup.length > 0) return res.status(409).json({ error: `Ya existe una categoría llamada "${cleanName}"` });

        await sql`UPDATE categories SET name = ${cleanName} WHERE id = ${id}`;
        // La columna de texto products.category se mantiene en sincronía con el nombre
        await sql`UPDATE products SET category = ${cleanName} WHERE category_id = ${id}`;
      }
      if (description !== undefined) await sql`UPDATE categories SET description = ${description || null} WHERE id = ${id}`;
      if (image !== undefined)       await sql`UPDATE categories SET image = ${image || null} WHERE id = ${id}`;
      if (sort_order !== undefined)  await sql`UPDATE categories SET sort_order = ${Number(sort_order) || 0} WHERE id = ${id}`;
      if (attributes !== undefined) {
        await sql`UPDATE categories SET attributes = ${JSON.stringify(cleanAttributes(attributes))}::jsonb WHERE id = ${id}`;
      }

      const rows = await sql`
        SELECT c.*, (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.is_active = true) AS product_count
        FROM categories c WHERE c.id = ${id}
      `;
      return res.status(200).json(rows[0]);
    }

    // DELETE /api/categories?id=... — solo si no tiene productos
    if (req.method === "DELETE") {
      if (!requireAuth(req, res)) return;

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Falta el parámetro id" });

      const used = await sql`SELECT COUNT(*)::int AS n FROM products WHERE category_id = ${id as string}`;
      if (used[0].n > 0) {
        return res.status(409).json({
          error: `No se puede eliminar: la categoría tiene ${used[0].n} producto(s). Muévelos a otra categoría o elimínalos primero.`,
        });
      }

      await sql`DELETE FROM categories WHERE id = ${id as string}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err: any) {
    console.error("[/api/categories] Error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}
