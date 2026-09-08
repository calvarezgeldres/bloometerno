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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sql = getDb();

    // GET /api/orders — listar todos los pedidos con sus ítems (solo admin: contiene datos de clientes)
    if (req.method === "GET") {
      if (!requireAuth(req, res)) return;

      const orders = await sql`
        SELECT * FROM orders ORDER BY created_at DESC
      `;
      const items = await sql`
        SELECT * FROM order_items
      `;

      const result = orders.map((o: any) => ({
        ...o,
        order_items: items.filter((i: any) => i.order_id === o.id),
      }));

      return res.status(200).json(result);
    }

    // POST /api/orders — crear pedido + ítems + descontar stock
    if (req.method === "POST") {
      const body = req.body as Record<string, any>;

      const {
        order_number,
        customer_name,
        customer_rut,
        customer_email,
        customer_phone,
        region,
        comuna,
        address,
        notes,
        shipping_method,
        shipping_cost,
        subtotal,
        total,
        payment_method,
        items,
      } = body;

      if (!order_number || !customer_name || !items?.length) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      // 1. Insertar la orden
      const orderRows = await sql`
        INSERT INTO orders (
          order_number, customer_name, customer_rut, customer_email, customer_phone,
          region, comuna, address, notes,
          shipping_method, shipping_cost, subtotal, total, payment_method, status
        ) VALUES (
          ${order_number},
          ${customer_name},
          ${customer_rut ?? ""},
          ${customer_email ?? ""},
          ${customer_phone ?? ""},
          ${region ?? ""},
          ${comuna ?? ""},
          ${address ?? ""},
          ${notes ?? ""},
          ${shipping_method ?? ""},
          ${Number(shipping_cost ?? 0)},
          ${Number(subtotal)},
          ${Number(total)},
          ${payment_method ?? "Transferencia Bancaria"},
          'Pendiente de transferencia'
        )
        RETURNING *
      `;

      const order = orderRows[0];

      // 2. Insertar ítems y descontar stock
      for (const item of items as any[]) {
        await sql`
          INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image)
          VALUES (
            ${order.id},
            ${item.product_id ?? null},
            ${item.product_name},
            ${Number(item.price)},
            ${Number(item.quantity)},
            ${item.image ?? null}
          )
        `;

        // Descontar stock si existe el product_id
        if (item.product_id) {
          await sql`
            UPDATE products
            SET stock = GREATEST(0, stock - ${Number(item.quantity)})
            WHERE id = ${item.product_id}
          `;
        }
      }

      // 3. Devolver la orden completa con ítems
      const orderItems = await sql`
        SELECT * FROM order_items WHERE order_id = ${order.id}
      `;

      return res.status(201).json({ ...order, order_items: orderItems });
    }

    // PATCH /api/orders — actualizar estado de un pedido
    if (req.method === "PATCH") {
      if (!requireAuth(req, res)) return;

      const { id, status } = req.body as Record<string, any>;

      if (!id || !status) {
        return res.status(400).json({ error: "Faltan campos: id, status" });
      }

      const validStatuses = [
        "Pendiente de transferencia",
        "Pagado con Mercado Pago",
        "Comprobante recibido",
        "En preparación",
        "Enviado",
        "Anulado",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err: any) {
    console.error("[/api/orders] Error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}
