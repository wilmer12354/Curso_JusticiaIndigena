import { NextResponse } from "next/server";
import { db, initDb, ensureCourseTables } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    await ensureCourseTables();

    const result = await db.execute(`
      SELECT
        p.user_id,
        p.topic_order,
        p.attempts,
        u.name AS user_name,
        u.email AS user_email,
        t.title AS topic_title
      FROM progress p
      JOIN users u ON u.id = p.user_id
      JOIN topics t ON t.topic_order = p.topic_order
      WHERE p.blocked = 1
      ORDER BY p.topic_order ASC
    `);

    const blocked = result.rows.map((row) => ({
      userId: String(row.user_id),
      topicOrder: Number(row.topic_order),
      attempts: Number(row.attempts ?? 0),
      userName: String(row.user_name ?? ""),
      userEmail: String(row.user_email ?? ""),
      topicTitle: String(row.topic_title ?? ""),
    }));

    return NextResponse.json(blocked);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener temas bloqueados" }, { status: 500 });
  }
}
