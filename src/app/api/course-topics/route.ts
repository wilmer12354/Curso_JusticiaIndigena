import { NextRequest, NextResponse } from "next/server";
import { db, ensureCourseTables, initDb, getPaymentMaxTopic, hasCompletedTrial } from "@/lib/db";

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
        SELECT topic_order, score, attempts, passed, completed_at, blocked
        FROM progress
        WHERE user_id = ?
      `,
      args: [userId],
    });

    const progressMap = new Map(
      progressResult.rows.map((row) => [Number(row.topic_order), row])
    );

    const paymentMaxTopic = await getPaymentMaxTopic(userId);
    const isTrial = status === "prueba";
    const trialExamDone = isTrial ? await hasCompletedTrial(userId) : false;

    let unlockedUntil = 0;
    if (isTrial) {
      unlockedUntil = 1;
    } else if (status === "activo" && paymentMaxTopic >= 1) {
      unlockedUntil = 1;
      for (const row of progressResult.rows) {
        if (Number(row.passed) === 1) {
          const nextTopic = Number(row.topic_order) + 1;
          if (nextTopic <= paymentMaxTopic) {
            unlockedUntil = Math.max(unlockedUntil, nextTopic);
          } else {
            unlockedUntil = Math.max(unlockedUntil, Number(row.topic_order));
          }
        }
      }
    }

    const topics = topicsResult.rows.map((row, index) => {
      const topicOrder = Number(row.topic_order);
      const progress = progressMap.get(topicOrder);

      if (isTrial) {
        const unlocked = topicOrder === 1;
        return {
          id: topicOrder,
          topicOrder,
          title: String(row.title),
          description: row.description ? String(row.description) : "",
          videoUrl: row.video_url ? String(row.video_url) : "",
          unlocked,
          locked: !unlocked,
          paymentBlocked: false,
          trialLocked: topicOrder > 1,
          isCurrent: topicOrder === 1,
          score: progress ? Number(progress.score ?? 0) : 0,
          attempts: progress ? Number(progress.attempts ?? 0) : 0,
          passed: progress ? Number(progress.passed ?? 0) === 1 : false,
          blocked: progress ? Number(progress.blocked ?? 0) === 1 : false,
          completedAt: progress?.completed_at ? String(progress.completed_at) : null,
          lessons: index + 1,
        };
      }

      const withinPayment = topicOrder <= paymentMaxTopic;
      const unlocked = status === "activo" && withinPayment && topicOrder <= unlockedUntil;
      const paymentBlocked = status === "activo" && !withinPayment;

      return {
        id: topicOrder,
        topicOrder,
        title: String(row.title),
        description: row.description ? String(row.description) : "",
        videoUrl: row.video_url ? String(row.video_url) : "",
        unlocked,
        locked: !unlocked,
        paymentBlocked,
        trialLocked: false,
        isCurrent: unlocked && topicOrder === unlockedUntil,
        score: progress ? Number(progress.score ?? 0) : 0,
        attempts: progress ? Number(progress.attempts ?? 0) : 0,
        passed: progress ? Number(progress.passed ?? 0) === 1 : false,
        blocked: progress ? Number(progress.blocked ?? 0) === 1 : false,
        completedAt: progress?.completed_at ? String(progress.completed_at) : null,
        lessons: index + 1,
      };
    });

    const currentTopic = topics.find((topic) => topic.isCurrent) ?? topics.find((topic) => topic.unlocked) ?? null;

    const nextCuotaNeeded = isTrial
      ? null
      : paymentMaxTopic === 0
        ? 1
        : paymentMaxTopic === 8
          ? 2
          : paymentMaxTopic === 16
            ? 3
            : null;

    return NextResponse.json({
      topics,
      currentTopic,
      paymentMaxTopic: isTrial ? 0 : paymentMaxTopic,
      nextCuotaNeeded,
      trialMode: isTrial,
      trialExamDone,
      canEnroll: isTrial && trialExamDone,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudieron obtener los temas del curso" },
      { status: 500 }
    );
  }
}
