import { NextRequest, NextResponse } from "next/server";
import { db, ensureCourseTables, initDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await initDb();
    await ensureCourseTables();

    const userId = request.nextUrl.searchParams.get("userId");
    const status = request.nextUrl.searchParams.get("status");

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    const topicsResult = await db.execute(`
      SELECT topic_order, title, description, video_url
      FROM topics
      ORDER BY topic_order ASC
    `);

    const progressResult = await db.execute({
      sql: `
        SELECT topic_order, score, attempts, passed, completed_at
        FROM progress
        WHERE user_id = ?
      `,
      args: [userId],
    });

    const progressMap = new Map(
      progressResult.rows.map((row) => [Number(row.topic_order), row])
    );

    let unlockedUntil = status === "activo" ? 1 : 0;

    for (const row of progressResult.rows) {
      if (Number(row.passed) === 1) {
        unlockedUntil = Math.max(unlockedUntil, Number(row.topic_order) + 1);
      }
    }

    const topics = topicsResult.rows.map((row, index) => {
      const topicOrder = Number(row.topic_order);
      const progress = progressMap.get(topicOrder);
      const unlocked = status === "activo" && topicOrder <= unlockedUntil;

      return {
        id: topicOrder,
        topicOrder,
        title: String(row.title),
        description: row.description ? String(row.description) : "",
        videoUrl: row.video_url ? String(row.video_url) : "",
        unlocked,
        locked: !unlocked,
        isCurrent: unlocked && topicOrder === unlockedUntil,
        score: progress ? Number(progress.score ?? 0) : 0,
        attempts: progress ? Number(progress.attempts ?? 0) : 0,
        passed: progress ? Number(progress.passed ?? 0) === 1 : false,
        completedAt: progress?.completed_at ? String(progress.completed_at) : null,
        lessons: index + 1,
      };
    });

    const currentTopic = topics.find((topic) => topic.isCurrent) ?? topics.find((topic) => topic.unlocked) ?? null;

    return NextResponse.json({
      topics,
      currentTopic,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudieron obtener los temas del curso" },
      { status: 500 }
    );
  }
}
