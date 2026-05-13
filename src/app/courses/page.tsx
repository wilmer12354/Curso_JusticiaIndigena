"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Book, GraduationCap, Clock, Shield, Clock3, Lock, PlayCircle, CheckCircle2, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { LogoutButton } from "../components/LogoutButton";

type StudentUser = {
  id: string;
  name: string;
};

type Topic = {
  id: number;
  topicOrder: number;
  title: string;
  description: string;
  videoUrl: string;
  unlocked: boolean;
  locked: boolean;
  paymentBlocked: boolean;
  isCurrent: boolean;
  score: number;
  attempts: number;
  passed: boolean;
  blocked: boolean;
  completedAt: string | null;
};

type Payment = {
  id: number;
  cuota: number;
  monto: number;
  status: string;
};

const CUOTA_LABELS: Record<number, string> = {
  1: "1ª cuota (Temas 1–8)",
  2: "2ª cuota (Temas 9–16)",
  3: "3ª cuota (Temas 17–21)",
};

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [status, setStatus] = useState<string>("activo");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [nextCuotaNeeded, setNextCuotaNeeded] = useState<number | null>(null);
  const [paymentMaxTopic, setPaymentMaxTopic] = useState<number>(0);
  const [requestingCuota, setRequestingCuota] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          const res = await fetch(`/api/user-role?email=${encodeURIComponent(firebaseUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.role === "admin") {
              router.push("/admin");
            } else {
              const nextStatus = data.status ?? "activo";
              setUser({ id: firebaseUser.uid, name: data.name || firebaseUser.displayName || "Estudiante" });
              setStatus(nextStatus);

              if (nextStatus === "activo") {
                const [topicsRes, paymentsRes] = await Promise.all([
                  fetch(`/api/course-topics?userId=${encodeURIComponent(firebaseUser.uid)}&status=${encodeURIComponent(nextStatus)}`),
                  fetch(`/api/payments?userId=${encodeURIComponent(firebaseUser.uid)}`),
                ]);

                if (topicsRes.ok) {
                  const topicsData = await topicsRes.json();
                  setTopics(topicsData.topics ?? []);
                  setCurrentTopic(topicsData.currentTopic ?? null);
                  setNextCuotaNeeded(topicsData.nextCuotaNeeded ?? null);
                  setPaymentMaxTopic(topicsData.paymentMaxTopic ?? 0);
                }
                if (paymentsRes.ok) {
                  const paymentsData = await paymentsRes.json();
                  setPayments(paymentsData.payments ?? []);
                }
              } else {
                setTopics([]);
                setCurrentTopic(null);
              }

              setLoading(false);
            }
          } else {
            router.push("/");
          }
        } catch {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleRequestPayment = async (cuota: number) => {
    if (!user) return;
    setRequestingCuota(true);
    setPaymentMessage("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, cuota }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentMessage(data.message ?? "Solicitud enviada. El administrador revisará tu pago.");
        // Refresh payments
        const pr = await fetch(`/api/payments?userId=${encodeURIComponent(user.id)}`);
        if (pr.ok) {
          const pd = await pr.json();
          setPayments(pd.payments ?? []);
        }
      } else {
        setPaymentMessage(data.error ?? "Error al enviar la solicitud.");
      }
    } catch {
      setPaymentMessage("Error de red. Intenta de nuevo.");
    } finally {
      setRequestingCuota(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // PENDING STATUS: show waiting screen
  if (status === "pendiente") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{
        background: "radial-gradient(circle at 30% 20%, rgba(194,65,12,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(245,158,11,0.05) 0%, transparent 50%)"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: "3rem 2.5rem",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(245,158,11,0.12)",
            border: "2px solid rgba(245,158,11,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Clock3 size={36} color="#f59e0b" />
          </div>

          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 999, padding: "4px 14px", marginBottom: "1rem",
              color: "#f59e0b", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "ping 1.5s ease-in-out infinite" }} />
              VERIFICACIÓN PENDIENTE
            </div>
            <h1 style={{
              fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem",
              background: "linear-gradient(135deg,#fff,#94a3b8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Espere por favor
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
              El administrador está verificando tu pago. Una vez confirmado, tu cuenta será activada y podrás acceder a todos los cursos.
            </p>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "1rem 1.5rem",
            width: "100%", textAlign: "left",
          }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tu cuenta</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Shield size={16} color="#f59e0b" />
              <span style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 500 }}>{user.name}</span>
            </div>
          </div>

          <LogoutButton />

          <p style={{ fontSize: 12, color: "#475569" }}>
            ¿Tienes dudas? Contacta al administrador.
          </p>
        </div>

        <style>{`
          @keyframes ping {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.5); }
          }
        `}</style>
      </div>
    );
  }

  const handleContinue = (topicOrder: number) => {
    router.push(`/courses/${topicOrder}`);
  };

  // Determine the status of nextCuota payment
  const nextCuotaPayment = nextCuotaNeeded != null
    ? payments.find((p) => p.cuota === nextCuotaNeeded)
    : null;
  const nextCuotaStatus = nextCuotaPayment?.status ?? null;

  // Payment banner: show when user has completed all unlocked topics and needs next cuota
  const allUnlockedPassed = paymentMaxTopic > 0 && topics
    .filter((t) => t.topicOrder <= paymentMaxTopic)
    .every((t) => t.passed);

  const showPaymentBanner = nextCuotaNeeded != null && (allUnlockedPassed || paymentMaxTopic === 0);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary w-8 h-8" />
            <span className="font-bold text-xl">Mis Cursos</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-500">Estudiante</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="container py-12">
        <header className="mb-8">
          <h1 className="!text-4xl">Tus Cursos de Formación</h1>
          <p className="text-slate-400 mt-2">Continúa tu aprendizaje sobre los sistemas de justicia comunitaria.</p>
        </header>

        {/* Payment progress bar */}
        {status === "activo" && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "1rem 1.5rem",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <CreditCard size={20} color="#818cf8" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>
                Progreso de pagos — {Math.min(payments.filter(p => p.status === "aprobado").length, 3)} de 3 cuotas aprobadas
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3].map((c) => {
                  const pay = payments.find(p => p.cuota === c);
                  const s = pay?.status;
                  return (
                    <div key={c} style={{
                      flex: 1, height: 8, borderRadius: 999,
                      background: s === "aprobado" ? "#4ade80" : s === "pendiente" ? "#f59e0b" : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }} title={`Cuota ${c}: ${s ?? "no solicitada"}`} />
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                {[1, 2, 3].map((c) => {
                  const pay = payments.find(p => p.cuota === c);
                  const s = pay?.status;
                  return (
                    <span key={c} style={{ fontSize: 11, color: s === "aprobado" ? "#4ade80" : s === "pendiente" ? "#f59e0b" : "#475569" }}>
                      Cuota {c}: {s === "aprobado" ? "Aprobada" : s === "pendiente" ? "En revisión" : "No pagada"}
                    </span>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#64748b", flexShrink: 0 }}>
              Total: <strong style={{ color: "#f1f5f9" }}>{payments.filter(p => p.status === "aprobado").length * 140} / 420 Bs</strong>
            </div>
          </div>
        )}

        {/* Payment banner when cuota needed */}
        {showPaymentBanner && (
          <div style={{
            background: nextCuotaStatus === "pendiente" ? "rgba(245,158,11,0.06)" : "rgba(99,102,241,0.06)",
            border: `1px solid ${nextCuotaStatus === "pendiente" ? "rgba(245,158,11,0.25)" : "rgba(99,102,241,0.25)"}`,
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: nextCuotaStatus === "pendiente" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {nextCuotaStatus === "pendiente"
                ? <Clock size={22} color="#f59e0b" />
                : <CreditCard size={22} color="#818cf8" />}
            </div>
            <div style={{ flex: 1 }}>
              {nextCuotaStatus === "pendiente" ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f59e0b", marginBottom: 2 }}>Pago en revisión</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Tu solicitud de la {CUOTA_LABELS[nextCuotaNeeded!]} está siendo verificada por el administrador. Te avisaremos cuando sea aprobada.
                  </div>
                </>
              ) : nextCuotaStatus === "rechazado" ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f87171", marginBottom: 2 }}>Pago rechazado</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Tu pago de la {CUOTA_LABELS[nextCuotaNeeded!]} fue rechazado. Contacta al administrador y vuelve a enviar el comprobante.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#818cf8", marginBottom: 2 }}>
                    {paymentMaxTopic === 0 ? "Paga tu primera cuota para comenzar" : `¡Completaste el bloque! Paga la siguiente cuota`}
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    {CUOTA_LABELS[nextCuotaNeeded!]} — 140 Bs. Envía el comprobante de pago al número <strong style={{ color: "#f1f5f9" }}>71539769</strong> y luego haz clic en el botón.
                  </div>
                </>
              )}
              {paymentMessage && (
                <div style={{ marginTop: 8, fontSize: 13, color: nextCuotaStatus === "rechazado" ? "#f87171" : "#4ade80" }}>
                  {paymentMessage}
                </div>
              )}
            </div>
            {(nextCuotaStatus == null || nextCuotaStatus === "rechazado") && (
              <button
                onClick={() => handleRequestPayment(nextCuotaNeeded!)}
                disabled={requestingCuota}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", borderRadius: 10,
                  background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)",
                  color: "#818cf8", fontSize: 14, fontWeight: 700,
                  cursor: requestingCuota ? "not-allowed" : "pointer",
                  opacity: requestingCuota ? 0.7 : 1,
                  transition: "all 0.2s", flexShrink: 0,
                }}
              >
                {requestingCuota ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={16} />}
                {requestingCuota ? "Enviando..." : "Ya pagué — Notificar"}
              </button>
            )}
          </div>
        )}

        {/* Also show "Pay all at once" button if no payments yet */}
        {status === "activo" && payments.length === 0 && (
          <div style={{
            background: "rgba(99,102,241,0.04)",
            border: "1px dashed rgba(99,102,241,0.2)",
            borderRadius: 16, padding: "1rem 1.5rem",
            marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <AlertCircle size={16} color="#818cf8" />
            <span style={{ fontSize: 13, color: "#94a3b8", flex: 1 }}>
              ¿Quieres pagar el curso completo (420 Bs)? Envía el comprobante al <strong style={{ color: "#f1f5f9" }}>71539769</strong> y haz clic en:
            </span>
            <button
              onClick={() => handleRequestPayment(0)}
              disabled={requestingCuota}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 10,
                background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                color: "#818cf8", fontSize: 13, fontWeight: 700,
                cursor: requestingCuota ? "not-allowed" : "pointer",
                opacity: requestingCuota ? 0.7 : 1, transition: "all 0.2s",
              }}
            >
              <CreditCard size={15} />
              Pago completo (420 Bs)
            </button>
          </div>
        )}

        {status === "activo" && topics.length === 0 ? (
          <div className="glass-card max-w-2xl">
            <h2 className="text-2xl font-bold mb-3">Aun no hay temas cargados</h2>
            <p className="text-slate-400">
              Tu cuenta ya fue activada, pero todavia no hay contenido disponible en la tabla `topics`.
            </p>
          </div>
        ) : (
          <>
            {currentTopic && (
              <div className="glass-card mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Tema disponible ahora</p>
                  <h2 className="text-2xl font-bold">
                    Tema {currentTopic.topicOrder}: {currentTopic.title}
                  </h2>
                  <p className="text-slate-400 mt-2 max-w-2xl">
                    {currentTopic.description || "Ingresa al tema para ver el video, la explicacion y las preguntas relacionadas."}
                  </p>
                </div>

                <button
                  onClick={() => handleContinue(currentTopic.topicOrder)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Continuar con el curso
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`glass-card flex flex-col gap-6 transition-all ${
                    topic.unlocked ? "group hover:border-primary/40" : "opacity-80 border-white/5"
                  }`}
                >
                  <div className="aspect-video rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden relative">
                    {topic.paymentBlocked ? (
                      <CreditCard className="w-12 h-12 text-indigo-400/60" />
                    ) : topic.locked ? (
                      <Lock className="w-12 h-12 text-slate-500" />
                    ) : topic.passed ? (
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    ) : (
                      <Book className="w-12 h-12 text-slate-700" />
                    )}
                    <div className="absolute top-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                      Tema {topic.topicOrder}
                    </div>
                    {topic.paymentBlocked && (
                      <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs text-indigo-300 text-center font-semibold">
                        Requiere pago
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                      <span className={`px-2 py-0.5 rounded ${
                        topic.blocked
                          ? "bg-red-500/10 text-red-400"
                          : topic.unlocked
                            ? "bg-primary/10 text-primary"
                            : topic.paymentBlocked
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "bg-slate-700/50 text-slate-300"
                      }`}>
                        {topic.blocked
                          ? "Bloqueado"
                          : topic.unlocked
                            ? (topic.passed ? "Completado" : "Disponible")
                            : topic.paymentBlocked
                              ? "Requiere pago"
                              : "Bloqueado"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">{topic.title}</h3>

                    <div className="flex flex-col gap-2 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Intentos: {topic.attempts}
                      </div>
                      <div className="flex items-center gap-1">
                        <Book className="w-4 h-4" />
                        Puntaje: {topic.score}
                      </div>
                    </div>

                    {topic.description && (
                      <p className="mt-4 text-sm text-slate-400 line-clamp-3">{topic.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => (topic.unlocked && !topic.blocked) ? handleContinue(topic.topicOrder) : undefined}
                    disabled={!topic.unlocked || topic.blocked}
                    className={`w-full mt-auto ${(topic.unlocked && !topic.blocked) ? "btn btn-primary" : "btn opacity-60 cursor-not-allowed"}`}
                  >
                    {topic.blocked
                      ? "Contacta al administrador"
                      : topic.unlocked
                        ? "Continuar con el curso"
                        : topic.paymentBlocked
                          ? "Requiere pago de cuota"
                          : "Tema bloqueado"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
