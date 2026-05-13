import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

// GET all students (with status)
export async function GET() {
  try {
    await initDb();
    const result = await db.execute(
      "SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC"
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      role: row.role,
      status: row.status ?? "activo",
      created_at: row.created_at,
      age: row.age,
      job_title: row.job_title,
      education_level: row.education_level,
      address: row.address,
      certificate_photo: row.certificate_photo,
    }));

    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST create user
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { id, name, email, image, role, status } = await req.json();
    if (!id || !email) {
      return NextResponse.json({ error: "id y email son requeridos" }, { status: 400 });
    }
    await db.execute({
      sql: "INSERT INTO users (id, name, email, image, role, status) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, name ?? null, email, image ?? null, role ?? "student", status ?? "pendiente"],
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}

