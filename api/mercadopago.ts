import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

// NOTA: este archivo debe quedar 100% autocontenido (sin imports relativos a
// otros .ts locales). Un import compartido entre archivos de /api ya rompió
// el bundling serverless de Vercel dos veces en este proyecto
// (FUNCTION_INVOCATION_FAILED — ver commits 8d2c3c1 y 9857f5d), así que la
// pequeña lógica de acceso a datos se duplica a propósito en cada función.

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:5173";
}

async function fetchPayment(paymentId: string): Promise<any> {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sql = getDb();

    // GET ?pending=<id> — estado de una compra en curso (polling de /pago-resultado),
    // y el resumen del pedido ya creado cuando el pago quedó aprobado.
    if (req.method === "GET") {
      const pendingId = req.query.pending as string;
      if (!pendingId) return res.status(400).json({ error: "Falta 'pending'" });

      const rows = await sql`SELECT estado, order_id FROM mp_pending_orders WHERE id = ${pendingId}`;
      const pending = rows[0];
      if (!pending) return res.status(404).json({ error: "No encontrada" });

      if (pending.estado !== "aprobado" || !pending.order_id) {
        return res.status(200).json({ estado: pending.estado, order: null });
      }

      const orderRows = await sql`SELECT * FROM orders WHERE id = ${pending.order_id}`;
      const items = await sql`SELECT * FROM order_items WHERE order_id = ${pending.order_id}`;
      return res.status(200).json({ estado: pending.estado, order: { ...orderRows[0], order_items: items } });
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

    // POST ?webhook=1 — notificación de pago de Mercado Pago
    if (req.query.webhook === "1") {
      const paymentId =
        (req.query["data.id"] as string) || (req.query.id as string) || (req.body?.data?.id as string);
      const topic = (req.query.type as string) || (req.query.topic as string) || req.body?.type;
      if (!paymentId || (topic && topic !== "payment")) return res.status(200).end();

      // Nunca confiamos en el cuerpo de la notificación: siempre se vuelve a
      // consultar el pago real contra la API con nuestro access token.
      const payment = await fetchPayment(paymentId);
      if (!payment?.external_reference) return res.status(200).end();

      const pendingRows = await sql`SELECT * FROM mp_pending_orders WHERE id = ${payment.external_reference}`;
      const pending = pendingRows[0];
      if (!pending) return res.status(200).end();
      if (pending.estado !== "pendiente") return res.status(200).end(); // ya procesada (reintento de MP)

      if (payment.status === "approved") {
        const body = pending.payload as Record<string, any>;

        const orderRows = await sql`
          INSERT INTO orders (
            order_number, customer_name, customer_rut, customer_email, customer_phone,
            region, comuna, address, notes,
            shipping_method, shipping_cost, subtotal, total, payment_method, status
          ) VALUES (
            ${body.order_number},
            ${body.customer_name},
            ${body.customer_rut ?? ""},
            ${body.customer_email ?? ""},
            ${body.customer_phone ?? ""},
            ${body.region ?? ""},
            ${body.comuna ?? ""},
            ${body.address ?? ""},
            ${body.notes ?? ""},
            ${body.shipping_method ?? ""},
            ${Number(body.shipping_cost ?? 0)},
            ${Number(body.subtotal)},
            ${Number(body.total)},
            'Mercado Pago',
            'Pagado con Mercado Pago'
          )
          RETURNING *
        `;
        const order = orderRows[0];

        for (const item of (body.items as any[]) ?? []) {
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

          if (item.product_id) {
            await sql`
              UPDATE products SET stock = GREATEST(0, stock - ${Number(item.quantity)}) WHERE id = ${item.product_id}
            `;
          }
        }

        await sql`
          UPDATE mp_pending_orders
          SET estado = 'aprobado', mp_payment_id = ${String(paymentId)}, order_id = ${order.id}, updated_at = NOW()
          WHERE id = ${pending.id}
        `;
      } else if (["rejected", "cancelled"].includes(payment.status)) {
        await sql`
          UPDATE mp_pending_orders
          SET estado = 'rechazado', mp_payment_id = ${String(paymentId)}, updated_at = NOW()
          WHERE id = ${pending.id}
        `;
      }

      return res.status(200).end();
    }

    // POST (sin query) — crear preferencia de pago (checkout pro)
    const body = req.body as Record<string, any>;
    const { order_number, customer_name, items } = body || {};
    if (!order_number || !customer_name || !items?.length) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const pendingRows = await sql`
      INSERT INTO mp_pending_orders (order_number, payload)
      VALUES (${order_number}, ${JSON.stringify(body)}::jsonb)
      RETURNING id
    `;
    const pendingId = pendingRows[0].id;

    const mpItems = (items as any[]).map((i) => ({
      title: i.product_name,
      quantity: Number(i.quantity),
      unit_price: Number(i.price),
      currency_id: "CLP",
    }));
    if (Number(body.shipping_cost) > 0) {
      mpItems.push({
        title: `Despacho — ${body.shipping_method ?? ""}`,
        quantity: 1,
        unit_price: Number(body.shipping_cost),
        currency_id: "CLP",
      });
    }

    const base = siteUrl();
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: mpItems,
        payer: { name: customer_name, email: body.customer_email },
        external_reference: String(pendingId),
        back_urls: {
          success: `${base}/pago-resultado?pending=${pendingId}`,
          pending: `${base}/pago-resultado?pending=${pendingId}`,
          failure: `${base}/pago-error?pending=${pendingId}`,
        },
        auto_return: "approved",
        notification_url: `${base}/api/mercadopago?webhook=1`,
      }),
    });

    const preference: any = await mpRes.json();
    if (!mpRes.ok) {
      console.error("Error creando preferencia MP:", preference);
      return res.status(502).json({ error: "No se pudo iniciar el pago" });
    }

    await sql`UPDATE mp_pending_orders SET mp_preference_id = ${preference.id}, updated_at = NOW() WHERE id = ${pendingId}`;

    return res.status(200).json({ init_point: preference.init_point, pending_id: pendingId });
  } catch (err: any) {
    console.error("[/api/mercadopago] Error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}
