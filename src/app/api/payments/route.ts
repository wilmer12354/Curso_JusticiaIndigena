import { NextRequest, NextResponse } from "next/server";
import { db, initDb, getPaymentMaxTopic } from "@/lib/db";

// GET /api/payments?userId=...  → all payments for a user
export async function GET(request: NextRequest) {
  try {
    await initDb();
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    const result = await db.execute({
      sql: `SELECT id, cuota, monto, status, created_at FROM payments WHERE user_id = ? ORDER BY cuota ASC`,
      args: [userId],
    });

    const payments = result.rows.map((r) => ({
      id: Number(r.id),
      cuota: Number(r.cuota),
      monto: Number(r.monto),
      status: String(r.status),
      createdAt: r.created_at ? String(r.created_at) : null,
    }));

    const maxTopic = await getPaymentMaxTopic(userId);

    return NextResponse.json({ payments, maxTopic });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 });
  }
}

// POST /api/payments  → register a new installment request
// Body: { userId, cuota }  cuota = 1|2|3  (monto is fixed at 140)
// Or body: { userId, cuota: 0 } for full payment (420 bs, creates cuota 1+2+3 pending)
export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const userId = String(body.userId ?? "");
    const cuota = Number(body.cuota);

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    if (![1, 2, 3, 0].includes(cuota)) {
      return NextResponse.json({ error: "Cuota inválida (debe ser 1, 2, 3 o 0 para pago completo)" }, { status: 400 });
    }

    if (cuota === 0) {
      // Full payment: insert cuota 1, 2, 3 as pending (each 140)
      for (const c of [1, 2, 3]) {
        // Check if already exists
        const exists = await db.execute({
          sql: `SELECT id FROM payments WHERE user_id = ? AND cuota = ?`,
          args: [userId, c],
        });
        if (exists.rows.length === 0) {
          await db.execute({
            sql: `INSERT INTO payments (user_id, cuota, monto, status) VALUES (?, ?, 140, 'pendiente')`,
            args: [userId, c],
          });
        }
      }
      return NextResponse.json({ success: true, message: "Solicitud de pago completo registrada (3 cuotas pendientes)" });
    }

    // Single cuota — check not already pending or approved
    const existing = await db.execute({
      sql: `SELECT id, status FROM payments WHERE user_id = ? AND cuota = ?`,
      args: [userId, cuota],
    });

    if (existing.rows.length > 0) {
      const existingStatus = String(existing.rows[0].status);
      if (existingStatus === "aprobado") {
        return NextResponse.json({ error: "Esta cuota ya fue aprobada." }, { status: 409 });
      }
      if (existingStatus === "pendiente") {
        return NextResponse.json({ error: "Esta cuota ya está en revisión por el administrador." }, { status: 409 });
      }
      // Rejected → allow re-request by updating
      await db.execute({
        sql: `UPDATE payments SET status = 'pendiente', created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND cuota = ?`,
        args: [userId, cuota],
      });
      return NextResponse.json({ success: true, message: "Solicitud de pago reenviada." });
    }

    await db.execute({
      sql: `INSERT INTO payments (user_id, cuota, monto, status) VALUES (?, ?, 140, 'pendiente')`,
      args: [userId, cuota],
    });

    return NextResponse.json({ success: true, message: "Solicitud de pago registrada. El administrador la revisará pronto." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}
