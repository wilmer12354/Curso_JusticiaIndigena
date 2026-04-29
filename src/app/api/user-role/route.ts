import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await db.execute({
      sql: "SELECT name, role, status FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ role: null }, { status: 404 });
    }

    return NextResponse.json({ 
      name: result.rows[0].name,
      role: result.rows[0].role,
      status: result.rows[0].status ?? "activo",
    });
  } catch (error) {
    console.error("Fetch User Role Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
