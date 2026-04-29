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

  usersInitialized = true;
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
