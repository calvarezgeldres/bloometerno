// Crea o actualiza (upsert) un usuario administrador para /admin.
//
// Uso:
//   node --env-file=.env scripts/create-admin-user.mjs <usuario> <contraseña>
//
// (Requiere Node 20.6+ para --env-file; también puedes exportar DATABASE_URL
// manualmente en la terminal y correr: node scripts/create-admin-user.mjs <usuario> <contraseña>)

import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Uso: node --env-file=.env scripts/create-admin-user.mjs <usuario> <contraseña>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Falta la variable de entorno DATABASE_URL (usa --env-file=.env o expórtala manualmente).");
  process.exit(1);
}

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const sql = neon(databaseUrl);

await sql`
  CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )
`;

const rows = await sql`
  INSERT INTO admin_users (username, password_hash)
  VALUES (${username}, ${hashPassword(password)})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING username, created_at
`;

console.log(`Usuario administrador guardado: "${rows[0].username}" (${rows[0].created_at})`);
