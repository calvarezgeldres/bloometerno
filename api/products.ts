import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "./_lib/auth";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS permisivo (mismo dominio en producción, cualquier origen en dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sql = getDb();

    // GET /api/products — listar todos los productos activos
    if (req.method === "GET") {
      const rows = await sql`
        SELECT * FROM products
        WHERE is_active = true
        ORDER BY created_at ASC
      `;
      return res.status(200).json(rows);
    }

    // POST /api/products — crear producto
    if (req.method === "POST") {
      if (!requireAuth(req, res)) return;

      const { num, name, category, price, stock, badge, badge_type, image, alt, description } =
        req.body as Record<string, any>;

      if (!name || !category || price == null || !image) {
        return res.status(400).json({ error: "Faltan campos obligatorios: name, category, price, image" });
      }

      const rows = await sql`
        INSERT INTO products (num, name, category, price, stock, badge, badge_type, image, alt, description, is_active)
        VALUES (
          ${num ?? null},
          ${name},
          ${category},
          ${Number(price)},
          ${Number(stock ?? 10)},
          ${badge ?? null},
          ${badge_type ?? null},
          ${image},
          ${alt ?? name},
          ${description ?? null},
          true
        )
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    // PATCH /api/products — actualizar campos de un producto (id requerido en body)
    if (req.method === "PATCH") {
      if (!requireAuth(req, res)) return;

      const { id, ...updates } = req.body as Record<string, any>;

      if (!id) return res.status(400).json({ error: "Falta el campo id" });

      // Construir SET dinámico con los campos permitidos
      const allowed = ["name", "category", "price", "stock", "badge", "badge_type", "image", "alt", "description", "is_active"] as const;
      type AllowedKey = typeof allowed[number];

      const fields = Object.keys(updates).filter((k): k is AllowedKey => allowed.includes(k as AllowedKey));

      if (fields.length === 0) {
        return res.status(400).json({ error: "No hay campos válidos para actualizar" });
      }

      // Actualizar campo a campo usando tagged template (neon no soporta SET dinámico en un solo query)
      // Se usa sql.unsafe solo si es absolutamente necesario; aquí iteramos:
      for (const field of fields) {
        const value = updates[field];
        if (field === "name")         await sql`UPDATE products SET name         = ${value} WHERE id = ${id}`;
        if (field === "category")     await sql`UPDATE products SET category     = ${value} WHERE id = ${id}`;
        if (field === "price")        await sql`UPDATE products SET price        = ${Number(value)} WHERE id = ${id}`;
        if (field === "stock")        await sql`UPDATE products SET stock        = ${Number(value)} WHERE id = ${id}`;
        if (field === "badge")        await sql`UPDATE products SET badge        = ${value ?? null} WHERE id = ${id}`;
        if (field === "badge_type")   await sql`UPDATE products SET badge_type   = ${value ?? null} WHERE id = ${id}`;
        if (field === "image")        await sql`UPDATE products SET image        = ${value} WHERE id = ${id}`;
        if (field === "alt")          await sql`UPDATE products SET alt          = ${value ?? null} WHERE id = ${id}`;
        if (field === "description")  await sql`UPDATE products SET description  = ${value ?? null} WHERE id = ${id}`;
        if (field === "is_active")    await sql`UPDATE products SET is_active    = ${Boolean(value)} WHERE id = ${id}`;
      }

      const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
      return res.status(200).json(rows[0] ?? { id });
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
