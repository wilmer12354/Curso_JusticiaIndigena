import { NextRequest, NextResponse } from "next/server";
import { db, initDb, ensureCourseTables, getPaymentMaxTopic } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/verify-admin";
import { hashUserPassword } from "@/lib/password";
import { PRICE_TOTAL } from "@/lib/pricing";
import { randomBytes } from "crypto";

// GET all students (with status)
export async function GET(req: NextRequest) {
  try {
    const unauthorized = await verifyAdminRequest(req);
    if (unauthorized) return unauthorized;

    await initDb();
    const result = await db.execute(
      "SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC"
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      username: row.username ?? null,
      image: row.image,
      role: row.role,
      status: row.status ?? "activo",
      created_at: row.created_at,
      phone: row.phone ?? "",
      age: row.age,
      job_title: row.job_title,
      education_level: row.education_level,
      address: row.address,
      certificate_photo: row.certificate_photo,
      trial_exam_done: row.trial_exam_done ?? 0,
    }));

    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST create user
export async function POST(req: NextRequest) {
  try {
    const unauthorized = await verifyAdminRequest(req);
    if (unauthorized) return unauthorized;

    await initDb();
    const body = await req.json();
    const { id, name, email, image, role, status, username, password } = body;

    const usernameStr =
      typeof username === "string" && username.trim() ? username.trim() : "";
    const passwordStr = typeof password === "string" ? password : "";

    // Ruta: usuario + contraseña (sin email obligatorio)
    if (usernameStr || passwordStr) {
      if (!usernameStr || !passwordStr) {
        return NextResponse.json(
          { error: "Debes ingresar usuario y contraseña juntos" },
          { status: 400 }
        );
      }
      if (usernameStr.length < 3 || usernameStr.length > 32) {
        return NextResponse.json(
          { error: "El usuario debe tener entre 3 y 32 caracteres" },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(usernameStr)) {
        return NextResponse.json(
          { error: "El usuario solo puede contener letras, números, _, . y -" },
          { status: 400 }
        );
      }
      if (passwordStr.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 }
        );
      }

      const existing = await db.execute({
        sql: "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
        args: [usernameStr],
      });
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { error: "Ese usuario ya existe" },
          { status: 409 }
        );
      }

      const newId = `usr_${randomBytes(8).toString("hex")}`;
      const passwordHash = await hashUserPassword(passwordStr);
      const finalStatus = status ?? "activo";
      const finalEmail =
        typeof email === "string" && email.trim() ? email.trim() : null;

      await db.execute({
        sql: `INSERT INTO users (id, name, email, image, role, status, username, password_hash, must_change_password)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        args: [
          newId,
          name ?? null,
          finalEmail,
          image ?? null,
          role ?? "student",
          finalStatus,
          usernameStr,
          passwordHash,
        ],
      });

      // Acceso inmediato: pago total aprobado
      if ((role ?? "student") === "student" && finalStatus === "activo") {
        await ensureCourseTables();
        await db.execute({
          sql: `INSERT INTO payments (user_id, cuota, monto, status) VALUES (?, 3, ?, 'aprobado')`,
          args: [newId, PRICE_TOTAL],
        });

        const firstTopic = await db.execute({
          sql: "SELECT topic_order FROM topics ORDER BY topic_order ASC LIMIT 1",
        });
        if (firstTopic.rows.length > 0) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO progress (user_id, topic_order, score, attempts, passed, completed_at)
                  VALUES (?, ?, 0, 0, 0, NULL)`,
            args: [newId, firstTopic.rows[0].topic_order],
          });
        }

        const paymentMax = await getPaymentMaxTopic(newId);
        return NextResponse.json(
          { success: true, id: newId, username: usernameStr, paymentMax },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { success: true, id: newId, username: usernameStr },
        { status: 201 }
      );
    }

    // Ruta clásica: id + email
    if (!id || !email) {
      return NextResponse.json(
        { error: "id y email son requeridos" },
        { status: 400 }
      );
    }
    await db.execute({
      sql: "INSERT INTO users (id, name, email, image, role, status) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, name ?? null, email, image ?? null, role ?? "student", status ?? "pendiente"],
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
