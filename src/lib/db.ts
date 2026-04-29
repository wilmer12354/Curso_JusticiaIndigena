import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

export const db = createClient({
  url: url,
  authToken: authToken,
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      image TEXT,
      role TEXT DEFAULT 'student',
      status TEXT DEFAULT 'pendiente',
      phone TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations for existing tables (safe - ignore if column already exists)
  const migrations = [
    "ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pendiente'",
    "ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''",
  ];
  for (const sql of migrations) {
    try { await db.execute(sql); } catch { /* column already exists */ }
  }
}
