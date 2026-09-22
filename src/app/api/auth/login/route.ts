import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyUserPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { username, password } = await req.json();

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "SELECT id, name, username, password_hash, role, status, must_change_password FROM users WHERE LOWER(username) = LOWER(?)",
      args: [username.trim()],
    });

    const row = result.rows[0];
    if (!row || !row.password_hash) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const valid = await verifyUserPassword(password, String(row.password_hash));
    if (!valid) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const status = String(row.status ?? "activo");
    const mustChangePassword = Number(row.must_change_password ?? 0) === 1;

    return NextResponse.json({
      id: String(row.id),
      username: String(row.username),
      name: String(row.name ?? ""),
      role: String(row.role ?? "student"),
      status,
      mustChangePassword,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
