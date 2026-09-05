import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

const SESSION_COOKIE = "bloom_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no está configurada");
  return secret;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (computed.length !== expected.length) return false;
  return crypto.timingSafeEqual(computed, expected);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionCookie(username: string): string {
  const exp = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const secureFlag = process.env.VERCEL ? "Secure; " : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; ${secureFlag}SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;
}

function clearSessionCookie(): string {
  const secureFlag = process.env.VERCEL ? "Secure; " : "";
  return `${SESSION_COOKIE}=; HttpOnly; ${secureFlag}SameSite=Lax; Path=/; Max-Age=0`;
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
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSig = Buffer.from(sign(payload), "hex");
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // GET /api/auth — verificar si hay una sesión de admin activa
    if (req.method === "GET") {
      const user = getSessionUser(req);
      return res.status(200).json({ authenticated: !!user, username: user });
    }

    // POST /api/auth — login con usuario y contraseña
    if (req.method === "POST") {
      const { username, password } = req.body as Record<string, any>;
      if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
      }

      const sql = getDb();
      const rows = await sql`
        SELECT username, password_hash FROM admin_users WHERE username = ${username} LIMIT 1
      `;

      if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }

      res.setHeader("Set-Cookie", createSessionCookie(rows[0].username));
      return res.status(200).json({ ok: true, username: rows[0].username });
    }

    // DELETE /api/auth — logout
    if (req.method === "DELETE") {
      res.setHeader("Set-Cookie", clearSessionCookie());
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err: any) {
    console.error("[/api/auth] Error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}
