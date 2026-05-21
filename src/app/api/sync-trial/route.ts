import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initDb();

    const body = await request.json();
    const id = String(body.id ?? "").trim();
    const email = String(body.email ?? "").trim();
    const name = String(body.name ?? "").trim();
    const image = String(body.image ?? "");

    if (!id || !email) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    const isAdmin = email === process.env.ADMIN_EMAIL;

    const existingUser = await db.execute({
      sql: "SELECT id, role, status, trial_exam_done FROM users WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length === 0) {
      const role = isAdmin ? "admin" : "student";
      const status = isAdmin ? "activo" : "prueba";
      await db.execute({
        sql: `INSERT INTO users (id, name, email, image, role, status, trial_exam_done) VALUES (?, ?, ?, ?, ?, ?, 0)`,
        args: [id, name || "", email, image || "", role, status],
      });

      return NextResponse.json({
        success: true,
        status,
        role,
        trialExamDone: false,
        canEnroll: false,
        isNew: true,
      });
    }

    const row = existingUser.rows[0];
    const currentStatus = String(row.status ?? "pendiente");
    const trialExamDone = Number(row.trial_exam_done ?? 0) === 1;
    const role = String(row.role ?? "student");

    await db.execute({
      sql: "UPDATE users SET name = ?, image = ? WHERE email = ?",
      args: [name || "", image || "", email],
    }).catch(() => {});

    if (isAdmin && role !== "admin") {
      await db.execute({
        sql: "UPDATE users SET role = 'admin', status = 'activo' WHERE email = ?",
        args: [email],
      });
      return NextResponse.json({
        success: true,
        status: "activo",
        role: "admin",
        trialExamDone: true,
        canEnroll: false,
        isNew: false,
      });
    }

    const canEnroll = currentStatus === "prueba" && trialExamDone;

    return NextResponse.json({
      success: true,
      status: currentStatus,
      role,
      trialExamDone,
      canEnroll,
      isNew: false,
    });
  } catch (error) {
    console.error("Sync Trial Error:", error);
    return NextResponse.json({ error: "Failed to sync trial user" }, { status: 500 });
  }
}
