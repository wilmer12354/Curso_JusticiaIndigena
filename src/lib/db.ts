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

let usersInitialized = false;
let courseTablesInitialized = false;

export async function initDb() {
  if (usersInitialized) {
    return;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      image TEXT,
      role TEXT DEFAULT 'student',
      status TEXT DEFAULT 'pendiente',
      phone TEXT DEFAULT '',
      age TEXT DEFAULT '',
      job_title TEXT DEFAULT '',
      education_level TEXT DEFAULT '',
      address TEXT DEFAULT '',
      certificate_photo TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      cuota INTEGER NOT NULL,
      monto INTEGER NOT NULL DEFAULT 140,
      status TEXT DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations for existing tables (safe - ignore if column already exists)
  const migrations = [
    "ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pendiente'",
    "ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN registration_receipt TEXT",
    "ALTER TABLE users ADD COLUMN age TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN job_title TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN education_level TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN address TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN certificate_photo TEXT DEFAULT ''",
  ];
  for (const sql of migrations) {
    try { await db.execute(sql); } catch { /* column already exists */ }
  }

  usersInitialized = true;
}

/** Registra cuotas en revisión al inscribirse (140 Bs por mes). El admin aprueba cada cuota por separado. */
export async function insertEnrollmentPendingPayments(
  userId: string,
  months: 1 | 2 | 3
): Promise<void> {
  for (let c = 1; c <= months; c++) {
    const exists = await db.execute({
      sql: `SELECT id FROM payments WHERE user_id = ? AND cuota = ?`,
      args: [userId, c],
    });
    if (exists.rows.length > 0) continue;
    await db.execute({
      sql: `INSERT INTO payments (user_id, cuota, monto, status) VALUES (?, ?, 140, 'pendiente')`,
      args: [userId, c],
    });
  }
}

/**
 * Returns the maximum topic order a user can access based on approved payments.
 * Cuota 1 (approved) → topics 1-8
 * Cuota 2 (approved) → topics 9-16
 * Cuota 3 (approved) → topics 17+ (all remaining)
 */
export async function getPaymentMaxTopic(userId: string): Promise<number> {
  const result = await db.execute({
    sql: `SELECT cuota FROM payments WHERE user_id = ? AND status = 'aprobado' ORDER BY cuota ASC`,
    args: [userId],
  });

  const approvedCuotas = new Set(result.rows.map((r) => Number(r.cuota)));

  if (approvedCuotas.has(3) || approvedCuotas.size === 3) return 999; // All topics
  if (approvedCuotas.has(2)) return 16;
  if (approvedCuotas.has(1)) return 8;
  return 0;
}

export async function ensureCourseTables() {
  if (courseTablesInitialized) {
    return;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_order INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      topic_order INTEGER NOT NULL,
      score REAL DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      passed INTEGER DEFAULT 0,
      completed_at TEXT,
      UNIQUE(user_id, topic_order)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_order INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer1 TEXT NOT NULL,
      answer2 TEXT NOT NULL,
      answer3 TEXT NOT NULL,
      answer4 TEXT NOT NULL,
      correct_answer INTEGER NOT NULL
    );
  `);

  courseTablesInitialized = true;
}
