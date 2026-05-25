import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./firebase-admin";
import { db } from "./db";

export async function verifyAdminRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token requerido" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const result = await db.execute({
      sql: "SELECT role FROM users WHERE id = ?",
      args: [uid],
    });

    if (result.rows.length === 0 || String(result.rows[0].role) !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return null;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
