import { NextResponse } from "next/server";
import { db, initDb, insertEnrollmentPendingPayments } from "@/lib/db";
import {
  saveRegistrationReceipt,
  deletePublicComprobanteIfExists,
} from "@/lib/comprobantes";

type ParsedBody = {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  enrollmentMonths: number;
  receiptFile: File | null;
};

async function parseRequest(request: Request): Promise<ParsedBody> {
  const ct = request.headers.get("content-type") || "";

  if (ct.includes("multipart/form-data")) {
    const form = await request.formData();
    const r = form.get("receipt");
    const receiptFile = r instanceof File && r.size > 0 ? r : null;
    return {
      id: String(form.get("id") ?? "").trim(),
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      image: String(form.get("image") ?? ""),
      phone: String(form.get("phone") ?? "").trim(),
      enrollmentMonths: Number(form.get("enrollmentMonths")),
      receiptFile,
    };
  }

  const body = await request.json().catch(() => ({}));
  return {
    id: String(body.id ?? "").trim(),
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim(),
    image: String(body.image ?? ""),
    phone: String(body.phone ?? "").trim(),
    enrollmentMonths: Number(body.enrollmentMonths),
    receiptFile: null,
  };
}

export async function POST(request: Request) {
  try {
    await initDb();

    const parsed = await parseRequest(request);

    const { id, name, email, image, phone, enrollmentMonths, receiptFile } = parsed;

    if (!id || !email) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    const existingUser = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });

    const isAdmin = email === process.env.ADMIN_EMAIL;
    const wasExisting = existingUser.rows.length > 0;

    if (!wasExisting && !isAdmin) {
      if (![1, 2, 3].includes(enrollmentMonths)) {
        return NextResponse.json(
          { error: "Indica cuántos meses pagaste: 1, 2 o 3 (140 Bs por mes)." },
          { status: 400 }
        );
      }
      if (!receiptFile) {
        return NextResponse.json(
          { error: "Debes adjuntar el comprobante de pago (archivo)." },
          { status: 400 }
        );
      }
    }

    let registrationReceiptPath: string | null = null;
    if (receiptFile) {
      try {
        registrationReceiptPath = await saveRegistrationReceipt(
          receiptFile,
          name || email.split("@")[0] || "Estudiante",
          id
        );
      } catch (e) {
        const code = e instanceof Error ? e.message : "";
        if (code === "INVALID_RECEIPT_TYPE") {
          return NextResponse.json(
            { error: "Comprobante no válido. Usa JPG, PNG, WebP o PDF." },
            { status: 400 }
          );
        }
        if (code === "RECEIPT_TOO_LARGE") {
          return NextResponse.json(
            { error: "El archivo supera 3 MB." },
            { status: 413 }
          );
        }
        throw e;
      }
    }

    const rawPrevReceipt =
      wasExisting && existingUser.rows[0]
        ? (existingUser.rows[0] as Record<string, unknown>).registration_receipt
        : null;
    const previousReceiptPath =
      typeof rawPrevReceipt === "string" && rawPrevReceipt.startsWith("public/comprobantes/")
        ? rawPrevReceipt
        : null;

    if (existingUser.rows.length === 0) {
      const role = isAdmin ? "admin" : "student";
      const receipt = registrationReceiptPath ?? null;
      try {
        await db.execute({
          sql: "INSERT INTO users (id, name, email, image, role, phone, status, registration_receipt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [id, name || "", email, image || "", role, phone || "", "pendiente", receipt],
        });
      } catch {
        try {
          await db.execute({
            sql: "INSERT INTO users (id, name, email, image, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [id, name || "", email, image || "", role, phone || "", "pendiente"],
          });
        } catch {
          try {
            await db.execute({
              sql: "INSERT INTO users (id, name, email, image, role, status) VALUES (?, ?, ?, ?, ?, ?)",
              args: [id, name || "", email, image || "", role, "pendiente"],
            });
          } catch {
            await db.execute({
              sql: "INSERT INTO users (id, name, email, image, role) VALUES (?, ?, ?, ?, ?)",
              args: [id, name || "", email, image || "", role],
            });
          }
        }
      }
      if (receipt) {
        await db.execute({
          sql: "UPDATE users SET registration_receipt = ? WHERE id = ?",
          args: [receipt, id],
        }).catch(() => {});
      }
    } else {
      if (phone) {
        await db.execute({
          sql: "UPDATE users SET phone = ? WHERE email = ?",
          args: [phone, email],
        }).catch(() => {});
      }
      if (registrationReceiptPath) {
        await deletePublicComprobanteIfExists(previousReceiptPath);
        await db.execute({
          sql: "UPDATE users SET registration_receipt = ? WHERE email = ?",
          args: [registrationReceiptPath, email],
        }).catch(() => {});
      }
      if (isAdmin && existingUser.rows[0].role !== "admin") {
        await db.execute({
          sql: "UPDATE users SET role = 'admin' WHERE email = ?",
          args: [email],
        });
      }
    }

    if (!wasExisting && !isAdmin && [1, 2, 3].includes(enrollmentMonths)) {
      await insertEnrollmentPendingPayments(id, enrollmentMonths as 1 | 2 | 3);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync User Error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
