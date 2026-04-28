import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, name, email, image } = await request.json();

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
      await db.execute({
        sql: "INSERT INTO users (id, name, email, image, role) VALUES (?, ?, ?, ?, ?)",
        args: [id, name || "", email, image || "", role],
      });
    } else if (isAdmin && existingUser.rows[0].role !== "admin") {
      // Existing user that matches ADMIN_EMAIL but was saved as student: upgrade to admin
      await db.execute({
        sql: "UPDATE users SET role = 'admin' WHERE email = ?",
        args: [email],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync User Error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
