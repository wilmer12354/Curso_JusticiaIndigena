import { NextRequest, NextResponse } from "next/server";
import { db, ensureCourseTables, initDb } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/verify-admin";
import { deletePublicComprobanteIfExists } from "@/lib/comprobantes";

// PATCH update user (name, email, role, image, status)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await verifyAdminRequest(req);
    if (unauthorized) return unauthorized;

    await initDb();
    const body = await req.json();
    const { name, email, role, image, status } = body;
    const { id } = await params;

    // If only status is being updated (activate/deactivate)
    if (status !== undefined && Object.keys(body).length === 1) {
      if (status === "activo") {
        await ensureCourseTables();
      }

      await db.execute({
        sql: "UPDATE users SET status = ? WHERE id = ?",
        args: [status, id],
      });

      if (status === "activo") {
        const firstTopic = await db.execute({
          sql: "SELECT topic_order FROM topics ORDER BY topic_order ASC LIMIT 1",
        });

        if (firstTopic.rows.length > 0) {
          await db.execute({
            sql: `
              INSERT OR IGNORE INTO progress (user_id, topic_order, score, attempts, passed, completed_at)
              VALUES (?, ?, 0, 0, 0, NULL)
            `,
            args: [id, firstTopic.rows[0].topic_order],
          });
        }
      }

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

// DELETE user (cascading: removes related records and Blob files)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await verifyAdminRequest(req);
    if (unauthorized) return unauthorized;

    await initDb();
    const { id } = await params;

    // 1. Fetch user data to get Blob URLs
    const userResult = await db.execute({
      sql: "SELECT registration_receipt, certificate_photo FROM users WHERE id = ?",
      args: [id],
    });
    const user = userResult.rows[0] as { registration_receipt?: string; certificate_photo?: string } | undefined;

    // 2. Fetch payment receipt URLs
    const paymentsResult = await db.execute({
      sql: "SELECT payment_receipt FROM payments WHERE user_id = ?",
      args: [id],
    });

    // 3. Delete Blob files
    if (user) {
      await deletePublicComprobanteIfExists(user.registration_receipt);
      await deletePublicComprobanteIfExists(user.certificate_photo);
    }
    for (const row of paymentsResult.rows) {
      const p = row as { payment_receipt?: string };
      await deletePublicComprobanteIfExists(p.payment_receipt);
    }

    // 4. Delete related rows
    await db.execute({ sql: "DELETE FROM payments WHERE user_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM progress WHERE user_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM trial_feedback WHERE user_id = ?", args: [id] });

    // 5. Delete user
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
