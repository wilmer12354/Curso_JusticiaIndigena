import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initDb();
    const { id, name, email, image, phone } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    const existingUser = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });

    const isAdmin = email === process.env.ADMIN_EMAIL;

    if (existingUser.rows.length === 0) {
      // New user: insert with correct role
      const role = isAdmin ? "admin" : "student";
      // Try inserting with phone and status columns
      try {
        await db.execute({
          sql: "INSERT INTO users (id, name, email, image, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [id, name || "", email, image || "", role, phone || "", "pendiente"],
        });
      } catch {
        // Fallback without phone column
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
    } else {
      // Existing user: update phone if provided, and upgrade to admin if needed
      if (phone) {
        await db.execute({
          sql: "UPDATE users SET phone = ? WHERE email = ?",
          args: [phone, email],
        }).catch(() => {}); // Ignore if phone column doesn't exist yet
      }
      if (isAdmin && existingUser.rows[0].role !== "admin") {
        await db.execute({
          sql: "UPDATE users SET role = 'admin' WHERE email = ?",
          args: [email],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync User Error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
