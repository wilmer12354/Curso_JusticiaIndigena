import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

// GET /api/admin/payments → all payments with user info
export async function GET() {
  try {
    await initDb();

    const result = await db.execute(`
      SELECT
        p.id,
        p.user_id,
        p.cuota,
        p.monto,
        p.status,
        p.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.image AS user_image
      FROM payments p
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);

    const payments = result.rows.map((r) => ({
      id: Number(r.id),
      userId: String(r.user_id),
      cuota: Number(r.cuota),
      monto: Number(r.monto),
      status: String(r.status),
      createdAt: r.created_at ? String(r.created_at) : null,
      userName: r.user_name ? String(r.user_name) : null,
      userEmail: r.user_email ? String(r.user_email) : null,
      userImage: r.user_image ? String(r.user_image) : null,
    }));

    return NextResponse.json(payments);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 });
  }
}
