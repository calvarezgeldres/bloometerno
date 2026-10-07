import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import crypto from "node:crypto";

// Autocontenido a propósito (sin imports relativos): ver la nota en api/mercadopago.ts.
//
// Subida de imágenes de productos/categorías a Vercel Blob. El navegador sube el
// archivo directo a Blob (sin pasar por esta función, que tiene límite de 4,5 MB
// de cuerpo); acá solo se entrega el permiso de subida, y únicamente a un admin
// con sesión iniciada y con tipo/peso acotados. Requiere BLOB_READ_WRITE_TOKEN,
// que Vercel agrega solo al conectar un Blob Store al proyecto.

// El panel ya valida, achica y convierte a WebP antes de subir; esto es el tope duro.
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];
const MAX_BYTES = 2 * 1024 * 1024;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      error: "El almacenamiento de imágenes no está configurado (falta conectar un Blob Store en Vercel).",
    });
  }

  try {
    const result = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!getSessionUser(req)) throw new Error("No autorizado. Debes iniciar sesión.");
        if (!pathname.startsWith("productos/") && !pathname.startsWith("categorias/")) {
          throw new Error("Ruta de imagen no permitida");
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[/api/upload] Error:", err);
    const msg = err?.message ?? "No se pudo subir la imagen";
    return res.status(msg.startsWith("No autorizado") ? 401 : 400).json({ error: msg });
  }
}
