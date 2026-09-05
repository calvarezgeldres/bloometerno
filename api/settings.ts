import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "../src/lib/authServer";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sql = getDb();

    // GET /api/settings — obtener configuración de la tienda
    if (req.method === "GET") {
      const rows = await sql`
        SELECT * FROM store_settings WHERE id = 'default' LIMIT 1
      `;

      if (rows.length === 0) {
        // Insertar fila por defecto si no existe
        await sql`
          INSERT INTO store_settings (id) VALUES ('default')
          ON CONFLICT (id) DO NOTHING
        `;
        const fresh = await sql`SELECT * FROM store_settings WHERE id = 'default' LIMIT 1`;
        return res.status(200).json(fresh[0]);
      }

      return res.status(200).json(rows[0]);
    }

    // PATCH /api/settings — actualizar configuración
    if (req.method === "PATCH") {
      if (!requireAuth(req, res)) return;

      const {
        bank_name,
        account_type,
        account_number,
        account_rut,
        account_holder,
        contact_email,
        whatsapp_number,
        free_shipping_threshold,
      } = req.body as Record<string, any>;

      await sql`
        UPDATE store_settings SET
          bank_name                 = COALESCE(${bank_name ?? null},                 bank_name),
          account_type              = COALESCE(${account_type ?? null},              account_type),
          account_number            = COALESCE(${account_number ?? null},            account_number),
          account_rut               = COALESCE(${account_rut ?? null},               account_rut),
          account_holder            = COALESCE(${account_holder ?? null},            account_holder),
          contact_email             = COALESCE(${contact_email ?? null},             contact_email),
          whatsapp_number           = COALESCE(${whatsapp_number ?? null},           whatsapp_number),
          free_shipping_threshold   = COALESCE(${free_shipping_threshold != null ? Number(free_shipping_threshold) : null}, free_shipping_threshold),
          updated_at                = CURRENT_TIMESTAMP
        WHERE id = 'default'
      `;

      const rows = await sql`SELECT * FROM store_settings WHERE id = 'default' LIMIT 1`;
      return res.status(200).json(rows[0]);
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err: any) {
    console.error("[/api/settings] Error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}
