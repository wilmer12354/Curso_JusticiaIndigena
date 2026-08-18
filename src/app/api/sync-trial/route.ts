import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

function randomSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request) {
  try {
    await initDb();

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }
    if (!/^\d{7,15}$/.test(phone)) {
      return NextResponse.json({ error: "Ingresa un celular válido (7-15 dígitos)." }, { status: 400 });
    }

    const existingUser = await db.execute({
      sql: "SELECT id, name, role, status, trial_exam_done FROM users WHERE phone = ? LIMIT 1",
      args: [phone],
    });

    if (existingUser.rows.length > 0) {
      const row = existingUser.rows[0];
      const userStatus = String(row.status ?? "");

      if (userStatus !== "prueba") {
        // El número ya corresponde a un usuario inscrito/registrado.
        return NextResponse.json({
          success: true,
          id: String(row.id),
          name: String(row.name ?? name),
          role: String(row.role ?? "student"),
          status: userStatus,
          trialExamDone: Number(row.trial_exam_done ?? 0) === 1,
          canEnroll: false,
          isNew: false,
          existingRegistered: true,
        });
      }

      await db.execute({
        sql: "UPDATE users SET name = ? WHERE id = ?",
        args: [name, String(row.id)],
      }).catch(() => {});
      return NextResponse.json({
        success: true,
        id: String(row.id),
        name,
        role: String(row.role ?? "student"),
        status: "prueba",
        trialExamDone: Number(row.trial_exam_done ?? 0) === 1,
        canEnroll: Number(row.trial_exam_done ?? 0) === 1,
        isNew: false,
        existingRegistered: false,
      });
    }

    const suffix = randomSuffix();
    const id = `prueba_${suffix}`;
    const email = `prueba_${suffix}@prueba.local`;

    await db.execute({
      sql: `INSERT INTO users (id, name, email, image, role, status, phone, trial_exam_done) VALUES (?, ?, ?, '', 'student', 'prueba', ?, 0)`,
      args: [id, name, email, phone],
    });

    return NextResponse.json({
      success: true,
      id,
      name,
      role: "student",
      status: "prueba",
      trialExamDone: false,
      canEnroll: false,
      isNew: true,
      existingRegistered: false,
    });
  } catch (error) {
    console.error("Sync Trial Error:", error);
    return NextResponse.json({ error: "Failed to sync trial user" }, { status: 500 });
  }
}