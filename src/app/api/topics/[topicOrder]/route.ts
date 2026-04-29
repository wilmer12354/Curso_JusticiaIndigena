import { NextRequest, NextResponse } from "next/server";
import { db, ensureCourseTables, initDb } from "@/lib/db";

type RouteContext = {
  params: Promise<{ topicOrder: string }>;
};

const PASSING_SCORE = 70;

async function getUnlockedUntil(userId: string, status: string | null) {
  const progressResult = await db.execute({
    sql: `
      SELECT topic_order, passed
      FROM progress
      WHERE user_id = ?
    `,
    args: [userId],
  });

  let unlockedUntil = status === "activo" ? 1 : 0;

  for (const row of progressResult.rows) {
    if (Number(row.passed) === 1) {
      unlockedUntil = Math.max(unlockedUntil, Number(row.topic_order) + 1);
    }
  }

  return { unlockedUntil, progressRows: progressResult.rows };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await initDb();
    await ensureCourseTables();

    const { topicOrder } = await params;
    const topicOrderNumber = Number(topicOrder);
    const userId = request.nextUrl.searchParams.get("userId");
    const status = request.nextUrl.searchParams.get("status");

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    if (!Number.isInteger(topicOrderNumber)) {
      return NextResponse.json({ error: "Tema inválido" }, { status: 400 });
    }

    const topicResult = await db.execute({
      sql: `
        SELECT topic_order, title, description, video_url
        FROM topics
        WHERE topic_order = ?
        LIMIT 1
      `,
      args: [topicOrderNumber],
    });

    if (topicResult.rows.length === 0) {
      return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });
    }

    const { unlockedUntil, progressRows } = await getUnlockedUntil(userId, status);

    if (status !== "activo" || topicOrderNumber > unlockedUntil) {
      return NextResponse.json({ error: "Tema bloqueado" }, { status: 403 });
    }

    const questionResult = await db.execute({
      sql: `
        SELECT id, question, answer1, answer2, answer3, answer4, correct_answer
        FROM questions
        WHERE topic_order = ?
        ORDER BY id ASC
      `,
      args: [topicOrderNumber],
    });

    const topic = topicResult.rows[0];
    const topicProgress = progressRows.find(
      (row) => Number(row.topic_order) === topicOrderNumber
    );

    return NextResponse.json({
      topic: {
        topicOrder: Number(topic.topic_order),
        title: String(topic.title),
        description: topic.description ? String(topic.description) : "",
        videoUrl: topic.video_url ? String(topic.video_url) : "",
      },
      progress: {
        score: topicProgress ? Number(topicProgress.score ?? 0) : 0,
        attempts: topicProgress ? Number(topicProgress.attempts ?? 0) : 0,
        passed: topicProgress ? Number(topicProgress.passed ?? 0) === 1 : false,
        completedAt: topicProgress?.completed_at ? String(topicProgress.completed_at) : null,
      },
      questions: questionResult.rows.map((row) => ({
        id: Number(row.id),
        question: String(row.question),
        options: [
          String(row.answer1),
          String(row.answer2),
          String(row.answer3),
          String(row.answer4),
        ],
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo obtener el tema" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await initDb();
    await ensureCourseTables();

    const { topicOrder } = await params;
    const topicOrderNumber = Number(topicOrder);

    if (!Number.isInteger(topicOrderNumber)) {
      return NextResponse.json({ error: "Tema inválido" }, { status: 400 });
    }

    const body = await request.json();
    const userId = String(body.userId ?? "");
    const status = String(body.status ?? "");
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    const { unlockedUntil } = await getUnlockedUntil(userId, status);
    if (status !== "activo" || topicOrderNumber > unlockedUntil) {
      return NextResponse.json({ error: "Tema bloqueado" }, { status: 403 });
    }

    const questionResult = await db.execute({
      sql: `
        SELECT id, correct_answer
        FROM questions
        WHERE topic_order = ?
        ORDER BY id ASC
      `,
      args: [topicOrderNumber],
    });

    const allTopicQuestions = questionResult.rows.map((row) => ({
      id: Number(row.id),
      correctAnswer: Number(row.correct_answer),
    }));

    if (allTopicQuestions.length === 0) {
      return NextResponse.json(
        { error: "Este tema no tiene preguntas para evaluar." },
        { status: 400 }
      );
    }

    if (answers.length !== 3) {
      return NextResponse.json(
        { error: "Debes enviar exactamente 3 respuestas por intento." },
        { status: 400 }
      );
    }

    const answersMap = new Map<number, number>();
    const validQuestionIds = new Set(allTopicQuestions.map((question) => question.id));

    for (const answer of answers) {
      const questionId = Number(answer?.questionId);
      const selectedAnswer = Number(answer?.selectedAnswer);
      if (
        Number.isInteger(questionId) &&
        validQuestionIds.has(questionId) &&
        selectedAnswer >= 1 &&
        selectedAnswer <= 4
      ) {
        answersMap.set(questionId, selectedAnswer);
      }
    }

    if (answersMap.size !== 3) {
      return NextResponse.json(
        { error: "Las respuestas enviadas no son válidas para este tema." },
        { status: 400 }
      );
    }

    let correctAnswers = 0;

    for (const [questionId, selected] of answersMap.entries()) {
      const question = allTopicQuestions.find((item) => item.id === questionId);
      if (!question) {
        continue;
      }

      if (selected === question.correctAnswer) {
        correctAnswers += 1;
      }
    }

    const totalQuestions = answersMap.size;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= PASSING_SCORE;
    const completedAt = passed ? new Date().toISOString() : null;

    await db.execute({
      sql: `
        INSERT INTO progress (user_id, topic_order, score, attempts, passed, completed_at)
        VALUES (?, ?, ?, 1, ?, ?)
        ON CONFLICT(user_id, topic_order) DO UPDATE SET
          score = excluded.score,
          attempts = progress.attempts + 1,
          passed = CASE WHEN excluded.passed = 1 THEN 1 ELSE progress.passed END,
          completed_at = CASE WHEN excluded.passed = 1 THEN excluded.completed_at ELSE progress.completed_at END
      `,
      args: [userId, topicOrderNumber, score, passed ? 1 : 0, completedAt],
    });

    return NextResponse.json({
      score,
      passed,
      correctAnswers,
      totalQuestions,
      progress: {
        score,
        passed,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo enviar el examen" },
      { status: 500 }
    );
  }
}
