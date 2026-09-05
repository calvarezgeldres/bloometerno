import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { verifyPassword, createSessionCookie, clearSessionCookie, getSessionUser } from "../src/lib/authServer";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
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
