import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

// PATCH /api/admin/payments/[id]  { status: 'aprobado' | 'rechazado' }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const body = await req.json();
    const status = String(body.status ?? "");

    if (!["aprobado", "rechazado"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    await db.execute({
      sql: `UPDATE payments SET status = ? WHERE id = ?`,
      args: [status, id],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar pago" }, { status: 500 });
  }
}
