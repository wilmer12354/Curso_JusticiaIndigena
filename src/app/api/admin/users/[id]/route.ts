import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH update user (name, email, role, image, status)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { name, email, role, image, status } = body;
    const { id } = await params;

    // If only status is being updated (activate/deactivate)
    if (status !== undefined && Object.keys(body).length === 1) {
      await db.execute({
        sql: "UPDATE users SET status = ? WHERE id = ?",
        args: [status, id],
      });
      return NextResponse.json({ success: true });
    }

    // Full update
    await db.execute({
      sql: "UPDATE users SET name = ?, email = ?, role = ?, image = ? WHERE id = ?",
      args: [name ?? null, email ?? null, role ?? "student", image ?? null, id],
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
