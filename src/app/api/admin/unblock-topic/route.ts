import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDb();

    const { userId, topicOrder } = await req.json();

    if (!userId || !topicOrder) {
      return NextResponse.json({ error: "userId y topicOrder son requeridos" }, { status: 400 });
    }

    await db.execute({
      sql: `
        UPDATE progress
        SET blocked = 0, attempts = 0
        WHERE user_id = ? AND topic_order = ?
      `,
      args: [userId, Number(topicOrder)],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al desbloquear tema" }, { status: 500 });
  }
}
