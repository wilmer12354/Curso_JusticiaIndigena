import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH update user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email, role, image } = await req.json();
    await db.execute({
      sql: "UPDATE users SET name = ?, email = ?, role = ?, image = ? WHERE id = ?",
      args: [name ?? null, email ?? null, role ?? "student", image ?? null, params.id],
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [params.id],
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
