"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, BookOpen, CircleCheck, CircleHelp, GraduationCap, PlayCircle, XCircle, FileText, CreditCard } from "lucide-react";
import { auth } from "@/lib/firebase";
import { LogoutButton } from "@/app/components/LogoutButton";

type TopicDetail = {
  topicOrder: number;
  title: string;
  description: string;
  videoUrl: string;
};

type TopicQuestion = {
  id: number;
  question: string;
  options: string[];
};

type TopicProgress = {
  score: number;
  attempts: number;
  passed: boolean;
  completedAt: string | null;
  blocked?: boolean;
};

type ExamResult = {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
};

type StudentUser = {
  id: string;
  name: string;
  status: string;
};

export default function TopicDetailPage() {
  const params = useParams<{ topicOrder: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [questions, setQuestions] = useState<TopicQuestion[]>([]);
  const [examQuestions, setExamQuestions] = useState<TopicQuestion[]>([]);
  const [progress, setProgress] = useState<TopicProgress | null>(null);
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [showExam, setShowExam] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentRequesting, setPaymentRequesting] = useState(false);
  const [paymentRequested, setPaymentRequested] = useState(false);
  const answeredCount = examQuestions.filter((question) => selectedAnswers[question.id]).length;
  const isExamComplete = examQuestions.length > 0 && answeredCount === examQuestions.length;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email) {
        router.push("/");
        return;
      }

      try {
        const roleRes = await fetch(`/api/user-role?email=${encodeURIComponent(firebaseUser.email)}`);

        if (!roleRes.ok) {
          router.push("/");
          return;
        }

        const roleData = await roleRes.json();

        if (roleData.role === "admin") {
          router.push("/admin");
          return;
        }

        if (roleData.status !== "activo") {
          router.push("/courses");
          return;
        }

        setStudent({
          id: firebaseUser.uid,
          name: roleData.name || firebaseUser.displayName || "Estudiante",
          status: roleData.status,
        });

        const topicRes = await fetch(
          `/api/topics/${params.topicOrder}?userId=${encodeURIComponent(firebaseUser.uid)}&status=${encodeURIComponent(roleData.status)}`
        );

        if (!topicRes.ok) {
          const topicData = await topicRes.json().catch(() => null);
          if (topicRes.status === 403 && topicData?.needsPayment) {
            setNeedsPayment(true);
          }
          setError(topicData?.error ?? "No se pudo cargar este tema.");
          setLoading(false);
          return;
        }

        const topicData = await topicRes.json();
        setTopic(topicData.topic);
        setQuestions(topicData.questions ?? []);
        setProgress(topicData.progress ?? null);
      } catch {
        setError("Ocurrio un error al cargar el tema.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [params.topicOrder, router]);

  const handleSelectAnswer = (questionId: number, selectedAnswer: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const getRandomQuestions = (allQuestions: TopicQuestion[], count: number, avoidIds: number[] = []) => {
    const source = [...allQuestions];
    const avoidSet = new Set(avoidIds);
    let pool = source.filter((question) => !avoidSet.has(question.id));

    if (pool.length < count) {
      pool = source;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  const startExam = (avoidIds: number[] = []) => {
    const selected = getRandomQuestions(questions, 3, avoidIds);
    setExamQuestions(selected);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmitError("");
    setExamResult(null);
    setShowExam(true);
  };

  const getPaymentCuotaForTopic = (order: number) => {
    if (order <= 8) return 1;
    if (order <= 16) return 2;
    return 3;
  };

  const paymentCuota = getPaymentCuotaForTopic(Number(params.topicOrder));
  const paymentAmount = 140;
  const isNotifyEnabled = showQr && Boolean(receiptFile) && !paymentRequested;

  const handleReceiptChange = (event: any) => {
    setReceiptError("");
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setReceiptFile(null);
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setReceiptError("Tipo de archivo no válido. Usa JPG, PNG, WebP o PDF.");
      setReceiptFile(null);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setReceiptError("El comprobante supera 3 MB.");
      setReceiptFile(null);
      return;
    }
    setReceiptFile(file);
  };

  const handleNotifyPayment = async () => {
    if (!student) return;
    if (!isNotifyEnabled) return;

    setPaymentRequesting(true);
    setPaymentNotice("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: student.id, cuota: paymentCuota }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPaymentNotice(data.error ?? "No se pudo notificar el pago.");
      } else {
        setPaymentNotice(data.message ?? "Pago notificado. El administrador revisará tu comprobante.");
        setPaymentRequested(true);
      }
    } catch {
      setPaymentNotice("Error de red. Intenta de nuevo más tarde.");
    } finally {
      setPaymentRequesting(false);
    }
  };

  const handleViewQr = () => {
    setShowQr(true);
  };

  const isTopicPaymentBlocked = needsPayment;

  const handleSubmitExam = async () => {
    if (!student || !topic) {
      return;
    }

    if (examQuestions.length === 0) {
      setSubmitError("Este tema no tiene preguntas registradas.");
      return;
    }

    if (answeredCount !== examQuestions.length) {
      setSubmitError("Debes responder todas las preguntas antes de enviar.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const answers = examQuestions.map((question) => ({
        questionId: question.id,
        selectedAnswer: selectedAnswers[question.id],
      }));

      const response = await fetch(`/api/topics/${topic.topicOrder}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: student.id,
          status: student.status,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "No se pudo enviar el examen.");
        return;
      }

      const isBlocked = Boolean(data.blocked);
      setExamResult({
        score: Number(data.score ?? 0),
        passed: Boolean(data.passed),
        correctAnswers: Number(data.correctAnswers ?? 0),
        totalQuestions: Number(data.totalQuestions ?? examQuestions.length),
      });

      setProgress((prev) => ({
        score: Number(data.score ?? 0),
        attempts: (prev?.attempts ?? 0) + 1,
        passed: Boolean(data.passed || prev?.passed),
        completedAt: data.passed ? new Date().toISOString() : prev?.completedAt ?? null,
        blocked: isBlocked,
      }));
    } catch {
      setSubmitError("Error de red al enviar el examen.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen">
        <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
          <div className="container h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-primary w-8 h-8" />
              <span className="font-bold text-xl">Tema {params.topicOrder}</span>
            </div>
            <LogoutButton />
          </div>
        </nav>

        <main className="container min-h-screen py-16">
          <Link href="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4" />
            Volver a mis cursos
          </Link>

          {needsPayment ? (
            <div className="glass-card max-w-2xl" style={{ borderColor: "rgba(99,102,241,0.3)" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(99,102,241,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <CreditCard size={26} color="#818cf8" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Pago requerido</h1>
              <p className="text-slate-400 mb-4">
                Para acceder al <strong className="text-white">Tema {params.topicOrder}</strong> debes pagar la cuota <strong className="text-white">{paymentCuota}</strong> (140 Bs).
              </p>
              <p className="text-slate-400 mb-6">
                Primero revisa el QR de pago y sube el comprobante. Luego podrás notificar el pago al administrador.
              </p>

              <div className="grid gap-3 md:grid-cols-3 mb-6">
                <button
                  type="button"
                  onClick={handleViewQr}
                  className="btn btn-secondary w-full"
                >
                  Ver QR
                </button>

                <label className="btn btn-secondary w-full cursor-pointer justify-center">
                  Subir comprobante
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleReceiptChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleNotifyPayment}
                  disabled={!isNotifyEnabled || paymentRequesting}
                  className={`btn btn-primary w-full ${(!isNotifyEnabled || paymentRequesting) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {paymentRequesting ? "Notificando..." : paymentRequested ? "Notificado" : "Notificar pago"}
                </button>
              </div>

              {receiptFile && (
                <p className="text-slate-300 mb-2">Archivo seleccionado: {receiptFile.name}</p>
              )}
              {receiptError && (
                <p className="text-sm text-red-400 mb-2">{receiptError}</p>
              )}
              {paymentNotice && (
                <p className="text-sm text-slate-300 mb-4">{paymentNotice}</p>
              )}

              {showQr && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-6">
                  <p className="text-sm uppercase tracking-wide text-slate-400 mb-3">Código QR de pago</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                      <img src="/qr_pago.png" alt="Código QR para pago" className="h-48 w-48 object-contain" />
                    </div>
                    <p className="text-slate-300 text-sm text-center max-w-lg">
                      Escanea el código QR para pagar con Tigo Money, QR Simple o transferencia bancaria. El monto por cuota es <strong className="text-white">Bs. {paymentAmount}</strong>.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-500">
                También puedes enviar tu comprobante por WhatsApp al <strong className="text-white">71539769</strong> si lo prefieres.
              </p>

              <Link href="/courses" className="btn btn-primary inline-flex items-center gap-2 mt-4">
                <ArrowLeft className="w-4 h-4" />
                Ir a mis cursos
              </Link>
            </div>
          ) : (
            <div className="glass-card max-w-2xl">
              <h1 className="text-3xl font-bold mb-3">Tema no disponible</h1>
              <p className="text-slate-400">{error || "No tienes acceso a este tema por ahora."}</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary w-8 h-8" />
            <span className="font-bold text-xl">Tema {topic.topicOrder}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{student?.name ?? "Estudiante"}</p>
              <p className="text-xs text-slate-500">Estudiante</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="container min-h-screen py-16">
        <Link href="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver a mis cursos
        </Link>

        <section className="glass-card mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Tema {topic.topicOrder}
            </span>
            {progress?.passed && (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                <CircleCheck className="w-4 h-4" />
                Aprobado
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
          <p className="text-slate-400 max-w-3xl mb-5">
            {topic.description || "En esta pagina solo se muestra el contenido correspondiente al tema seleccionado."}
          </p>

          <Link href={`/courses/${topic.topicOrder}/docs`} className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20">
            <FileText className="w-4 h-4" />
            Ver Documentación
          </Link>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Intentos</p>
              <p className="text-2xl font-bold">{progress?.attempts ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Puntaje</p>
              <p className="text-2xl font-bold">{progress?.score ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Estado</p>
              <p className="text-2xl font-bold">{progress?.passed ? "Completado" : "En curso"}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-5">
              <PlayCircle className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Contenido del tema</h2>
            </div>

            {topic.videoUrl ? (
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <iframe
                    className="h-full w-full"
                    src={topic.videoUrl}
                    title={topic.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm text-slate-500">
                  Si el enlace no carga correctamente, revisa que `video_url` sea una URL embebible.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-slate-400">
                Este tema aun no tiene video asignado.
              </div>
            )}
          </div>

          <aside className="glass-card">
            <div className="flex items-center gap-3 mb-5">
              <CircleHelp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Examen del tema</h2>
            </div>

            {progress?.blocked ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <XCircle className="mx-auto h-10 w-10 text-red-400 mb-2" />
                  <p className="font-semibold text-red-300">Has reprobado este tema 3 veces</p>
                  <p className="text-sm text-red-400/80 mt-1">
                    Escribe al administrador para que desbloquee tu acceso.
                  </p>
                </div>
                <Link href="/courses" className="btn btn-primary w-full inline-flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver a mis cursos
                </Link>
              </div>
            ) : !showExam ? (
              <div className="space-y-4">
                <p className="text-slate-400">
                  Cuando te sientas preparado, inicia el examen para responder las preguntas de este tema.
                </p>
                <button
                  onClick={() => startExam()}
                  className="btn btn-primary w-full"
                  disabled={questions.length === 0}
                >
                  Ya estoy listo para mi examen
                </button>
                {questions.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Todavia no hay preguntas registradas para este tema.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-slate-400">Todavia no hay preguntas registradas para este tema.</p>
                ) : (
                  <>
                    {examQuestions.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            Pregunta {currentQuestionIndex + 1} de {examQuestions.length}
                          </span>
                          <div className="flex items-center gap-1">
                            {examQuestions.map((question, index) => (
                              <button
                                key={question.id}
                                type="button"
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`h-2 w-6 rounded-full ${
                                  index === currentQuestionIndex ? "bg-primary" : "bg-slate-600"
                                }`}
                                aria-label={`Ir a pregunta ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>

                        {(() => {
                          const question = examQuestions[currentQuestionIndex];
                          return (
                            <div className="w-full">
                              <p className="font-semibold mb-3">{question.question}</p>
                              <div className="space-y-2 text-sm text-slate-300">
                                {question.options.map((option, optionIndex) => {
                                  const optionValue = optionIndex + 1;
                                  const inputId = `q-${question.id}-o-${optionValue}`;
                                  return (
                                    <label key={inputId} htmlFor={inputId} className="flex items-start gap-2 cursor-pointer">
                                      <input
                                        id={inputId}
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={optionValue}
                                        checked={selectedAnswers[question.id] === optionValue}
                                        onChange={() => handleSelectAnswer(question.id, optionValue)}
                                        className="mt-1"
                                      />
                                      <span className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                        {option}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                            disabled={currentQuestionIndex === 0}
                            className="btn flex-1 disabled:opacity-50"
                          >
                            Anterior
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentQuestionIndex((prev) => Math.min(prev + 1, examQuestions.length - 1))
                            }
                            disabled={currentQuestionIndex === examQuestions.length - 1}
                            className="btn flex-1 disabled:opacity-50"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    )}

                    {submitError && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {submitError}
                      </div>
                    )}

                    <button
                      onClick={handleSubmitExam}
                      disabled={submitting || !isExamComplete}
                      className={`btn btn-primary w-full ${submitting || !isExamComplete ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {submitting ? "Enviando..." : "Mandar examen"}
                    </button>

                    {!isExamComplete && (
                      <p className="text-xs text-slate-500 text-center">
                        Responde todas las preguntas para habilitar el envio.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </aside>
        </section>
      </main>

      {/* Modal de Resultados */}
      {examResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <div className="text-center">
              {examResult.passed ? (
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  <CircleCheck className="h-8 w-8" />
                </div>
              ) : (
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <XCircle className="h-8 w-8" />
                </div>
              )}
              
              <h3 className="mb-2 text-2xl font-bold text-white">
                {examResult.passed ? "¡Aprobaste el tema!" : "No aprobaste aún"}
              </h3>
              
              <div className="mb-6 space-y-2 text-slate-300">
                <p className="text-lg">Tu nota: <strong className="text-white">{examResult.score}/100</strong></p>
                <p>Respuestas correctas: {examResult.correctAnswers} de {examResult.totalQuestions}</p>
                {examResult.passed ? (
                  <p className="text-sm text-green-400 mt-2">¡Felicidades! Has desbloqueado el siguiente contenido.</p>
                ) : (
                  <p className="text-sm text-red-400 mt-2">Puedes intentarlo nuevamente con otras preguntas.</p>
                )}
              </div>

              <div className="flex gap-3">
                {examResult.passed ? (
                  <button
                    onClick={() => router.push("/courses")}
                    className="btn w-full bg-green-600 hover:bg-green-500 text-white border-none py-3"
                  >
                    Vamos al siguiente tema
                  </button>
                ) : progress?.blocked ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-400 text-center">
                      Has agotado tus 3 intentos. Escribe al administrador para desbloquear este tema.
                    </p>
                    <button
                      onClick={() => router.push("/courses")}
                      className="btn w-full bg-slate-600 hover:bg-slate-500 text-white border-none py-3"
                    >
                      Volver a cursos
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startExam(examQuestions.map((q) => q.id))}
                    className="btn w-full bg-primary hover:bg-primary/90 text-white border-none py-3"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
