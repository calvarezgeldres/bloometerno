import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

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

/** { "<id característica>": "valor" } con claves y valores de texto, sin vacíos. */
function cleanStringMap(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const value = String(v ?? "").trim();
    if (k && value) out[k] = value;
  }
  return out;
}

/** Busca la categoría por id (o por nombre, para clientes antiguos). */
async function resolveCategory(sql: any, categoryId?: string, categoryName?: string) {
  if (categoryId) {
    const rows = await sql`SELECT id, name FROM categories WHERE id = ${categoryId}`;
    return rows[0] ?? null;
  }
  if (categoryName) {
    const rows = await sql`SELECT id, name FROM categories WHERE LOWER(name) = LOWER(${categoryName})`;
    return rows[0] ?? null;
  }
  return null;
}

/**
 * Deja las variantes del producto exactamente como la lista recibida: actualiza
 * las que ya existen (por id, así los pedidos antiguos siguen apuntando a ellas),
 * crea las nuevas y borra las que ya no vienen. Si quedan variantes, el stock
 * del producto pasa a ser la suma del stock de sus variantes.
 */
async function syncVariants(sql: any, productId: string, raw: unknown) {
  const incoming = Array.isArray(raw) ? (raw as any[]) : [];
  const existing = await sql`SELECT id FROM product_variants WHERE product_id = ${productId}`;
  const existingIds = new Set<string>(existing.map((r: any) => r.id));
  const keep = new Set<string>();

  for (const [i, v] of incoming.entries()) {
    const options = JSON.stringify(cleanStringMap(v?.options));
    const stock = Math.max(0, Math.floor(Number(v?.stock) || 0));
    const price =
      v?.price === null || v?.price === undefined || v?.price === "" ? null : Math.max(0, Math.floor(Number(v.price) || 0));

    if (v?.id && existingIds.has(v.id)) {
      await sql`
        UPDATE product_variants
        SET options = ${options}::jsonb, stock = ${stock}, price = ${price}, sort_order = ${i}
        WHERE id = ${v.id}
      `;
      keep.add(v.id);
    } else {
      const rows = await sql`
        INSERT INTO product_variants (product_id, options, stock, price, sort_order)
        VALUES (${productId}, ${options}::jsonb, ${stock}, ${price}, ${i})
        RETURNING id
      `;
      keep.add(rows[0].id);
    }
  }

  for (const id of existingIds) {
    if (!keep.has(id)) await sql`DELETE FROM product_variants WHERE id = ${id}`;
  }

  if (incoming.length > 0) {
    await sql`
      UPDATE products
      SET stock = (SELECT COALESCE(SUM(stock), 0) FROM product_variants WHERE product_id = ${productId})
      WHERE id = ${productId}
    `;
  }
}

async function getProduct(sql: any, id: string) {
  const rows = await sql`
    SELECT p.*,
      COALESCE(
        (SELECT json_agg(v ORDER BY v.sort_order, v.created_at) FROM product_variants v WHERE v.product_id = p.id),
        '[]'::json
      ) AS variants
    FROM products p
    WHERE p.id = ${id}
  `;
  return rows[0] ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS permisivo (mismo dominio en producción, cualquier origen en dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sql = getDb();

    // GET /api/products — listar todos los productos activos, con sus variantes
    if (req.method === "GET") {
      const rows = await sql`
        SELECT p.*,
          COALESCE(
            (SELECT json_agg(v ORDER BY v.sort_order, v.created_at) FROM product_variants v WHERE v.product_id = p.id),
            '[]'::json
          ) AS variants
        FROM products p
        WHERE p.is_active = true
        ORDER BY p.created_at ASC
      `;
      return res.status(200).json(rows);
    }

    // POST /api/products — crear producto (con sus características y variantes)
    if (req.method === "POST") {
      if (!requireAuth(req, res)) return;

      const { num, name, category_id, category, price, stock, badge, badge_type, image, alt, description, attributes, variants } =
        req.body as Record<string, any>;

      if (!name || price == null || !image) {
        return res.status(400).json({ error: "Faltan campos obligatorios: name, price, image" });
      }

      const cat = await resolveCategory(sql, category_id, category);
      if (!cat) return res.status(400).json({ error: "La categoría indicada no existe" });

      const rows = await sql`
        INSERT INTO products (num, name, category, category_id, price, stock, badge, badge_type, image, alt, description, attributes, is_active)
        VALUES (
          ${num ?? null},
          ${name},
          ${cat.name},
          ${cat.id},
          ${Number(price)},
          ${Number(stock ?? 10)},
          ${badge ?? null},
          ${badge_type ?? null},
          ${image},
          ${alt ?? name},
          ${description ?? null},
          ${JSON.stringify(cleanStringMap(attributes))}::jsonb,
          true
        )
        RETURNING id
      `;
      const id = rows[0].id;
      if (variants !== undefined) await syncVariants(sql, id, variants);

      return res.status(201).json(await getProduct(sql, id));
    }

    // PATCH /api/products — actualizar campos de un producto (id requerido en body)
    if (req.method === "PATCH") {
      if (!requireAuth(req, res)) return;

      const { id, ...updates } = req.body as Record<string, any>;

      if (!id) return res.status(400).json({ error: "Falta el campo id" });

      const allowed = [
        "name", "category_id", "price", "stock", "badge", "badge_type", "image", "alt", "description", "is_active",
        "attributes", "variants",
      ] as const;
      type AllowedKey = typeof allowed[number];

      const fields = Object.keys(updates).filter((k): k is AllowedKey => allowed.includes(k as AllowedKey));

      if (fields.length === 0) {
        return res.status(400).json({ error: "No hay campos válidos para actualizar" });
      }

      // La categoría se valida antes de tocar nada
      let cat: { id: string; name: string } | null = null;
      if (fields.includes("category_id")) {
        cat = await resolveCategory(sql, updates.category_id);
        if (!cat) return res.status(400).json({ error: "La categoría indicada no existe" });
      }

      // Actualizar campo a campo usando tagged template (neon no soporta SET dinámico en un solo query)
      for (const field of fields) {
        const value = updates[field];
        if (field === "name")         await sql`UPDATE products SET name         = ${value} WHERE id = ${id}`;
        if (field === "price")        await sql`UPDATE products SET price        = ${Number(value)} WHERE id = ${id}`;
        if (field === "stock")        await sql`UPDATE products SET stock        = ${Number(value)} WHERE id = ${id}`;
        if (field === "badge")        await sql`UPDATE products SET badge        = ${value ?? null} WHERE id = ${id}`;
        if (field === "badge_type")   await sql`UPDATE products SET badge_type   = ${value ?? null} WHERE id = ${id}`;
        if (field === "image")        await sql`UPDATE products SET image        = ${value} WHERE id = ${id}`;
        if (field === "alt")          await sql`UPDATE products SET alt          = ${value ?? null} WHERE id = ${id}`;
        if (field === "description")  await sql`UPDATE products SET description  = ${value ?? null} WHERE id = ${id}`;
        if (field === "is_active")    await sql`UPDATE products SET is_active    = ${Boolean(value)} WHERE id = ${id}`;
        if (field === "attributes")   await sql`UPDATE products SET attributes   = ${JSON.stringify(cleanStringMap(value))}::jsonb WHERE id = ${id}`;
        if (field === "category_id" && cat) {
          await sql`UPDATE products SET category_id = ${cat.id}, category = ${cat.name} WHERE id = ${id}`;
        }
      }
      // Las variantes van al final: recalculan el stock del producto
      if (fields.includes("variants")) await syncVariants(sql, id, updates.variants);

      return res.status(200).json((await getProduct(sql, id)) ?? { id });
    }

    // DELETE /api/products — eliminar producto (id en query string)
    if (req.method === "DELETE") {
      if (!requireAuth(req, res)) return;

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Falta el parámetro id" });

      await sql`DELETE FROM products WHERE id = ${id as string}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err: any) {
    console.error("[/api/products] Error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}
