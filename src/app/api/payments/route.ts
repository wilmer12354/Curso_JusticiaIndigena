import { NextRequest, NextResponse } from "next/server";
import { db, initDb, getPaymentMaxTopic } from "@/lib/db";
import { savePaymentReceipt } from "@/lib/comprobantes";

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

    const contentType = request.headers.get("content-type") || "";
    let userId = "";
    let cuota = 0;
    let receiptFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      userId = String(form.get("userId") ?? "");
      cuota = Number(form.get("cuota"));
      const receipt = form.get("receipt");
      receiptFile = receipt instanceof File && receipt.size > 0 ? receipt : null;
    } else {
      const body = await request.json();
      userId = String(body.userId ?? "");
      cuota = Number(body.cuota);
      receiptFile = null;
    }

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    if (![1, 2, 3, 0].includes(cuota)) {
      return NextResponse.json({ error: "Cuota inválida (debe ser 1, 2, 3 o 0 para pago completo)" }, { status: 400 });
    }

    if (!receiptFile) {
      return NextResponse.json({ error: "Debes adjuntar el comprobante de pago." }, { status: 400 });
    }

    const userResult = await db.execute({
      sql: `SELECT name FROM users WHERE id = ? LIMIT 1`,
      args: [userId],
    });
    const userName = userResult.rows.length > 0 ? String(userResult.rows[0].name || "Estudiante") : "Estudiante";

    const receiptUrl = await savePaymentReceipt(receiptFile, userName, userId, cuota === 0 ? 0 : cuota);

    const createOrUpdatePayment = async (cuotaNumber: number) => {
      const existing = await db.execute({
        sql: `SELECT id, status FROM payments WHERE user_id = ? AND cuota = ?`,
        args: [userId, cuotaNumber],
      });

      if (existing.rows.length > 0) {
        const existingStatus = String(existing.rows[0].status);
        if (existingStatus === "aprobado") {
          return { skipped: true };
        }
        await db.execute({
          sql: `UPDATE payments SET status = 'pendiente', payment_receipt = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND cuota = ?`,
          args: [receiptUrl, userId, cuotaNumber],
        });
        return { skipped: false };
      }

      await db.execute({
        sql: `INSERT INTO payments (user_id, cuota, monto, status, payment_receipt) VALUES (?, ?, 140, 'pendiente', ?)`,
        args: [userId, cuotaNumber, receiptUrl],
      });
      return { skipped: false };
    };

    if (cuota === 0) {
      const cuotasToCreate = [1, 2, 3];
      let insertedCount = 0;
      for (const cuotaNumber of cuotasToCreate) {
        const result = await createOrUpdatePayment(cuotaNumber);
        if (!result.skipped) insertedCount++;
      }
      return NextResponse.json({ success: true, message: `Solicitud de pago completo registrada (${insertedCount} cuotas pendientes).` });
    }

    const existing = await db.execute({
      sql: `SELECT id, status FROM payments WHERE user_id = ? AND cuota = ?`,
      args: [userId, cuota],
    });

    if (existing.rows.length > 0) {
      const existingStatus = String(existing.rows[0].status);
      if (existingStatus === "aprobado") {
        return NextResponse.json({ error: "Esta cuota ya fue aprobada." }, { status: 409 });
      }
      await db.execute({
        sql: `UPDATE payments SET status = 'pendiente', payment_receipt = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND cuota = ?`,
        args: [receiptUrl, userId, cuota],
      });
      return NextResponse.json({ success: true, message: "Solicitud de pago reenviada con el nuevo comprobante." });
    }

    await db.execute({
      sql: `INSERT INTO payments (user_id, cuota, monto, status, payment_receipt) VALUES (?, ?, 140, 'pendiente', ?)`,
      args: [userId, cuota, receiptUrl],
    });

    return NextResponse.json({ success: true, message: "Solicitud de pago registrada. El administrador la revisará pronto." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}
