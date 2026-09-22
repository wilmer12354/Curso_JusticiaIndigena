import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { hashUserPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { userId, newPassword } = await req.json();

    if (
      typeof userId !== "string" ||
      !userId.trim() ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await db.execute({
      sql: "SELECT id, username FROM users WHERE id = ? AND username IS NOT NULL",
      args: [userId.trim()],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Cuenta no válida" },
        { status: 404 }
      );
    }

    const passwordHash = await hashUserPassword(newPassword);
    await db.execute({
      sql: "UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?",
      args: [passwordHash, userId.trim()],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
