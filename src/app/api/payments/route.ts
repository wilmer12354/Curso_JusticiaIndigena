import { NextRequest, NextResponse } from "next/server";
import { db, initDb, getPaymentMaxTopic } from "@/lib/db";
import { savePaymentReceipt } from "@/lib/comprobantes";
import { PRICE_TOTAL } from "@/lib/pricing";

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

// POST /api/payments  → register a payment request
// Body: { userId, cuota?, monto? }  default cuota=1, monto=PRICE_TOTAL (300)
export async function POST(request: NextRequest) {
  try {
    await initDb();

    const contentType = request.headers.get("content-type") || "";
    let userId = "";
    let cuota = 1;
    let monto = PRICE_TOTAL;
    let receiptFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      userId = String(form.get("userId") ?? "");
      cuota = Number(form.get("cuota") ?? 1);
      monto = Number(form.get("monto") ?? PRICE_TOTAL);
      const receipt = form.get("receipt");
      receiptFile = receipt instanceof File && receipt.size > 0 ? receipt : null;
    } else {
      const body = await request.json();
      userId = String(body.userId ?? "");
      cuota = Number(body.cuota ?? 1);
      monto = Number(body.monto ?? PRICE_TOTAL);
      receiptFile = null;
    }

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    if (!receiptFile) {
      return NextResponse.json({ error: "Debes adjuntar el comprobante de pago." }, { status: 400 });
    }

    const userResult = await db.execute({
      sql: `SELECT name FROM users WHERE id = ? LIMIT 1`,
      args: [userId],
    });
    const userName = userResult.rows.length > 0 ? String(userResult.rows[0].name || "Estudiante") : "Estudiante";

    const receiptUrl = await savePaymentReceipt(receiptFile, userName, userId, cuota);

    const existing = await db.execute({
      sql: `SELECT id, status FROM payments WHERE user_id = ? AND cuota = ?`,
      args: [userId, cuota],
    });

    if (existing.rows.length > 0) {
      const existingStatus = String(existing.rows[0].status);
      if (existingStatus === "aprobado") {
        return NextResponse.json({ error: "Este pago ya fue aprobado." }, { status: 409 });
      }
      await db.execute({
        sql: `UPDATE payments SET status = 'pendiente', monto = ?, payment_receipt = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND cuota = ?`,
        args: [monto, receiptUrl, userId, cuota],
      });
      return NextResponse.json({ success: true, message: "Solicitud de pago reenviada con el nuevo comprobante." });
    }

    await db.execute({
      sql: `INSERT INTO payments (user_id, cuota, monto, status, payment_receipt) VALUES (?, ?, ?, 'pendiente', ?)`,
      args: [userId, cuota, monto, receiptUrl],
    });

    return NextResponse.json({ success: true, message: "Solicitud de pago registrada. El administrador la revisará pronto." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}
