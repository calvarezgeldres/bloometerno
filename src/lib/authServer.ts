import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";

const COOKIE_NAME = "bloom_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no está configurada");
  return secret;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (computed.length !== expected.length) return false;
  return crypto.timingSafeEqual(computed, expected);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionCookie(username: string): string {
  const exp = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const secureFlag = process.env.VERCEL ? "Secure; " : "";
  return `${COOKIE_NAME}=${token}; HttpOnly; ${secureFlag}SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;
}

export function clearSessionCookie(): string {
  const secureFlag = process.env.VERCEL ? "Secure; " : "";
  return `${COOKIE_NAME}=; HttpOnly; ${secureFlag}SameSite=Lax; Path=/; Max-Age=0`;
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

export function getSessionUser(req: VercelRequest): string | null {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
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

/** Corta la petición con 401 si no hay sesión válida. Devuelve el usuario si sí la hay. */
export function requireAuth(req: VercelRequest, res: VercelResponse): string | null {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "No autorizado. Debes iniciar sesión." });
    return null;
  }
  return user;
}
