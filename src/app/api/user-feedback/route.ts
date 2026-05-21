import { NextRequest, NextResponse } from "next/server";
import { db, initDb, ensureCourseTables } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    await ensureCourseTables();

    const body = await request.json();
    const { userId, options } = body;

    if (!userId || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: "userId y al menos una opción son requeridos" },
        { status: 400 }
      );
    }

    const cleanOptions = options
      .filter((o) => typeof o === "string" && o.trim())
      .map((o: string) => o.trim());

    if (cleanOptions.length === 0) {
      return NextResponse.json({ error: "Opciones inválidas" }, { status: 400 });
    }

    // Upsert: one row per user, options stored as JSON array
    await db.execute({
      sql: `
        INSERT INTO trial_feedback (user_id, options, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          options    = excluded.options,
          created_at = excluded.created_at
      `,
      args: [userId, JSON.stringify(cleanOptions)],
    });

    return NextResponse.json({ message: "Feedback registrado con éxito" });
  } catch (error) {
    console.error("Error al registrar feedback:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el feedback" },
      { status: 500 }
    );
  }
}
