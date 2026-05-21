import { NextResponse } from "next/server";
import { db, initDb, hasCompletedTrial } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await db.execute({
      sql: "SELECT id, name, role, status, trial_exam_done FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({
        exists: false,
        role: null,
        name: null,
        status: null,
        trialExamDone: false,
        canEnroll: false,
      });
    }

    const row = result.rows[0];
    const status = String(row.status ?? "activo");
    const userId = String(row.id);
    const trialExamDone =
      Number(row.trial_exam_done) === 1 || (await hasCompletedTrial(userId));
    const canEnroll = status === "prueba" && trialExamDone;

    return NextResponse.json({
      exists: true,
      name: row.name,
      role: row.role,
      status,
      trialExamDone,
      canEnroll,
    });
  } catch (error) {
    console.error("Fetch User Role Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
