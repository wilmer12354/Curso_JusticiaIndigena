"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAuthCache, setAuthCache } from "@/lib/auth-cache";

import { Book, GraduationCap, Clock, Shield, Clock3, Lock, PlayCircle, CheckCircle2, CreditCard, AlertCircle, Loader2, Sparkles, Download } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "../components/LogoutButton";
import { MODULOS, MAX_TOPIC } from "@/lib/modulos";
import { PRICE_TOTAL } from "@/lib/pricing";

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
  trialLocked?: boolean;
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
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [hasViewedPaymentMethods, setHasViewedPaymentMethods] = useState(false);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [trialMode, setTrialMode] = useState(false);
  const [trialExamDone, setTrialExamDone] = useState(false);
  const [canEnroll, setCanEnroll] = useState(false);

  useEffect(() => {
    const cached = getAuthCache();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        // Cache hit with same email → redirect immediately (no API)
        if (cached && cached.email === firebaseUser.email && cached.status === "activo") {
          if (cached.role === "admin") {
            router.push("/admin");
          } else {
            setUser({ id: firebaseUser.uid, name: cached.name || "Estudiante" });
            setStatus("activo");
            setLoading(false);
            fetchTopics(firebaseUser.uid, "activo");
          }
          return;
        }

        try {
          const res = await fetch(`/api/user-role?email=${encodeURIComponent(firebaseUser.email)}`);
          if (!res.ok) { router.push("/"); return; }

          const data = await res.json();
          if (!data.exists) { router.push("/"); return; }
          if (data.role === "admin") {
            setAuthCache({ email: firebaseUser.email!, role: "admin", name: data.name ?? "", status: data.status });
            router.push("/admin");
            return;
          }

          setAuthCache({ email: firebaseUser.email!, role: "student", name: data.name ?? "", status: data.status });
          const nextStatus = data.status ?? "activo";
          setUser({ id: firebaseUser.uid, name: data.name || firebaseUser.displayName || "Estudiante" });
          setStatus(nextStatus);

          if (nextStatus === "activo" || nextStatus === "prueba") {
            fetchTopics(firebaseUser.uid, nextStatus);
          } else {
            setTopics([]);
            setCurrentTopic(null);
            setTrialMode(false);
            setTrialExamDone(false);
            setCanEnroll(false);
            setPayments([]);
            setLoading(false);
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

  async function fetchTopics(userId: string, status: string) {
    const [topicsRes, paymentsRes] = await Promise.all([
      fetch(`/api/course-topics?userId=${encodeURIComponent(userId)}&status=${encodeURIComponent(status)}`),
      status === "activo"
        ? fetch(`/api/payments?userId=${encodeURIComponent(userId)}`)
        : Promise.resolve(null),
    ]);

    if (topicsRes.ok) {
      const topicsData = await topicsRes.json();
      setTopics(topicsData.topics ?? []);
      setCurrentTopic(topicsData.currentTopic ?? null);
      setNextCuotaNeeded(topicsData.nextCuotaNeeded ?? null);
      setPaymentMaxTopic(topicsData.paymentMaxTopic ?? 0);
      setTrialMode(Boolean(topicsData.trialMode));
      setTrialExamDone(Boolean(topicsData.trialExamDone));
      setCanEnroll(Boolean(topicsData.canEnroll));
    }

    if (paymentsRes) {
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData.payments ?? []);
    }

    setLoading(false);
  }

  const handlePayRemaining = async () => {
    if (!user || !receiptFile) return;
    setRequestingCuota(true);
    setPaymentMessage("");
    setReceiptError("");
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("cuota", "2");
      formData.append("monto", "240");
      formData.append("receipt", receiptFile);

      const res = await fetch("/api/payments", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setPaymentMessage(data.message ?? "Solicitud enviada. El administrador revisará tu pago.");
        setReceiptFile(null);
        setShowPaymentMethods(false);
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

  const handleViewPaymentMethods = () => {
    setShowPaymentMethods((v) => !v);
    if (!showPaymentMethods) setHasViewedPaymentMethods(true);
  };

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

    if (file.size > 5.5 * 1024 * 1024) {
      setReceiptError("El comprobante supera 5.5 MB.");
      setReceiptFile(null);
      return;
    }

    setReceiptFile(file);
  };

  const canNotifyPayment = hasViewedPaymentMethods && Boolean(receiptFile) && !requestingCuota;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }



  const handleContinue = (topicOrder: number) => {
    router.push(`/courses/${topicOrder}`);
  };

  const showPaymentBanner = payments.length > 0 && (payments[0].status === "pendiente" || payments[0].status === "rechazado");

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
          <p className="text-slate-400 mt-2">
            {trialMode
              ? "Modo prueba: explora el Tema 1 gratis. Tras el examen podrás inscribirte."
              : "Continúa tu aprendizaje sobre los sistemas de justicia comunitaria."}
          </p>
        </header>

        {trialMode && (
          <div style={{
            background: canEnroll ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.06)",
            border: `1px solid ${canEnroll ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: canEnroll ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sparkles size={22} color={canEnroll ? "#4ade80" : "#f59e0b"} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
                {canEnroll ? "¡Prueba completada!" : "Estás en modo prueba — solo el Tema 1"}
              </p>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
                {canEnroll
                  ? `Ya puedes inscribirte con el pago único del curso completo (${PRICE_TOTAL} Bs).`
                  : "Inscríbete ahora con el pago único del curso completo (300 Bs). También puedes ver el video y rendir el examen del Tema 1 gratis antes de inscribirte."}
              </p>
            </div>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              Inscribirme y pagar
            </Link>
          </div>
        )}

        {/* Payment status */}
        {status === "activo" && payments.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${payments[0]?.status === "aprobado" ? "rgba(34,197,94,0.25)" : payments[0]?.status === "pendiente" ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 16,
            padding: "1rem 1.5rem",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <CreditCard size={20} color={payments[0]?.status === "aprobado" ? "#4ade80" : "#818cf8"} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
                {paymentMaxTopic >= MAX_TOPIC ? "Pago del curso completo" : `Pago parcial — Módulo I disponible`}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                {payments[0]?.status === "aprobado"
                  ? paymentMaxTopic >= MAX_TOPIC
                    ? "✓ Pago aprobado — tienes acceso a todo el curso"
                    : "✓ Primer pago aprobado — completa el resto para acceder a todos los módulos"
                  : payments[0]?.status === "pendiente"
                    ? "⏳ Pago en revisión por el administrador"
                    : "✗ Pago rechazado — contacta al administrador"}
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: payments[0]?.status === "aprobado" ? "#4ade80" : "#f1f5f9", flexShrink: 0 }}>
              {payments[0]?.monto ?? PRICE_TOTAL} Bs
            </div>
          </div>
        )}

        {/* Pay remaining banner: user has partial access (old system cuota) */}
        {status === "activo" && paymentMaxTopic > 0 && paymentMaxTopic < MAX_TOPIC && payments[0]?.status === "aprobado" && (
          <div style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            marginBottom: 28,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: showPaymentMethods ? 16 : 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CreditCard size={22} color="#818cf8" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#a5b4fc", marginBottom: 2 }}>Te falta pagar 240 Bs para completar el curso</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  Ya pagaste el Módulo I (100 Bs). Paga los 240 Bs restantes para acceder a todos los módulos.
                </div>
                {paymentMessage && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#4ade80" }}>{paymentMessage}</div>
                )}
                {receiptError && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#f87171" }}>{receiptError}</div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleViewPaymentMethods}
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                {showPaymentMethods ? "Ocultar métodos de pago" : "Ver métodos de pago"}
              </button>

              <label
                htmlFor="receipt-upload-remaining"
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                Subir comprobante
                <input
                  id="receipt-upload-remaining"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleReceiptChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handlePayRemaining}
                disabled={!hasViewedPaymentMethods || !receiptFile || requestingCuota}
                className="btn btn-primary"
                style={{ opacity: (!hasViewedPaymentMethods || !receiptFile || requestingCuota) ? 0.55 : 1, cursor: (!hasViewedPaymentMethods || !receiptFile || requestingCuota) ? "not-allowed" : "pointer" }}
              >
                {requestingCuota ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {requestingCuota ? "Enviando..." : "Ya pagué — Notificar"}
              </button>

              {receiptFile && (
                <span style={{ fontSize: 12, color: "#cbd5e1" }}>Archivo: {receiptFile.name}</span>
              )}
            </div>

            {showPaymentMethods && (
              <div style={{ marginTop: 16, padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,23,42,0.75)", display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Elige el método de pago que prefieras para los 240 Bs restantes:</p>
                <div className="payment-options">
                  <div className="payment-option">
                    <h3 className="payment-option-title">Opción 1 · Pago con QR</h3>
                    <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                      Escanea el código QR para pagar por <strong style={{ color: "#e2e8f0" }}>Tigo Money o QR Simple</strong>.
                    </p>
                    <div style={{ width: 180, height: 180, borderRadius: 18, overflow: "hidden", background: "white", padding: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/qr_yala2.png" alt="Código QR para pago de 240 Bs" loading="eager" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    </div>
                    <a
                      href="/qr_yala2.png"
                      download="qr-pago-restante-240.png"
                      className="btn btn-secondary flex items-center justify-center gap-2"
                      style={{ display: "inline-flex", padding: "8px 16px", fontSize: 13, borderRadius: 12 }}
                    >
                      <Download size={14} />
                      Descargar QR
                    </a>
                  </div>

                  <div className="payment-option">
                    <h3 className="payment-option-title">Opción 2 · Transferencia bancaria</h3>
                    <div className="bank-card bank-card--dark">
                      <div className="bank-row">
                        <span className="bank-label">Banco</span>
                        <span className="bank-value">Banco Unión</span>
                      </div>
                      <div className="bank-row">
                        <span className="bank-label">Nº de cuenta</span>
                        {/*<span className="bank-value">30362060</span>*/}
                        <span className="bank-value">10000033137957</span>
                      </div>
                      <div className="bank-row">
                        <span className="bank-label">Titular</span>
                        <span className="bank-value">DAVID TICONA BALBOA</span>
                      </div>
                      <div className="bank-row">
                        <span className="bank-label">CI</span>
                        <span className="bank-value">2448391</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment banner when payment is pending or rejected */}
        {showPaymentBanner && payments.length > 0 && (
          <div style={{
            background: payments[0]?.status === "pendiente" ? "rgba(245,158,11,0.06)" : "rgba(248,113,113,0.06)",
            border: `1px solid ${payments[0]?.status === "pendiente" ? "rgba(245,158,11,0.25)" : "rgba(248,113,113,0.25)"}`,
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
              background: payments[0]?.status === "pendiente" ? "rgba(245,158,11,0.15)" : "rgba(248,113,113,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {payments[0]?.status === "pendiente"
                ? <Clock size={22} color="#f59e0b" />
                : <AlertCircle size={22} color="#f87171" />}
            </div>
            <div style={{ flex: 1 }}>
              {payments[0]?.status === "pendiente" ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f59e0b", marginBottom: 2 }}>Pago en revisión</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Tu pago está siendo verificado por el administrador. Te avisaremos cuando sea aprobado.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f87171", marginBottom: 2 }}>Pago rechazado</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Tu pago fue rechazado. Contacta al administrador.
                  </div>
                </>
              )}
              {paymentMessage && (
                <div style={{ marginTop: 8, fontSize: 13, color: payments[0]?.status === "rechazado" ? "#f87171" : "#4ade80" }}>
                  {paymentMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PENDING STATUS: banner instead of full page */}
        {status === "pendiente" && (
          <div style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(245,158,11,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Clock3 size={22} color="#f59e0b" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f59e0b", marginBottom: 2 }}>Se está verificando su pago</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                El administrador está verificando tu pago. Una vez confirmado, tu cuenta será activada y podrás acceder a todos los cursos.
              </div>
            </div>
            <LogoutButton />
          </div>
        )}

        {/* ACTIVE WELCOME: shown when user has no topics yet */}
        {status === "activo" && topics.length === 0 && (
          <div style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 16,
            padding: "1.5rem 2rem",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <GraduationCap size={32} color="#4ade80" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#4ade80", marginBottom: 2 }}>¡Bienvenido al curso!</div>
              <div style={{ fontSize: 14, color: "#94a3b8" }}>Es hora de aprender. Explora los temas disponibles.</div>
            </div>
          </div>
        )}

        {/* Topics */}
        {(status === "activo" && topics.length > 0) || status === "prueba" ? (
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

            {MODULOS.map((month) => {
              const monthTopics = topics.filter((t) => t.topicOrder >= month.min && t.topicOrder <= month.max);
              if (monthTopics.length === 0) return null;
              return (
                <div key={month.label} className="mb-14">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-white/5" />
                    <h2 className="text-2xl font-bold text-primary">{month.label}</h2>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {monthTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`glass-card flex flex-col gap-6 transition-all ${topic.unlocked ? "group hover:border-primary/40" : "opacity-80 border-white/5"
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
                          {(topic.paymentBlocked || topic.trialLocked) && (
                            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs text-indigo-300 text-center font-semibold">
                              {topic.trialLocked ? "Inscríbete para desbloquear" : "Requiere pago"}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className={`px-2 py-0.5 rounded ${topic.blocked
                                ? "bg-red-500/10 text-red-400"
                                : topic.unlocked
                                  ? "bg-primary/10 text-primary"
                                  : topic.paymentBlocked || topic.trialLocked
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "bg-slate-700/50 text-slate-300"
                              }`}>
                              {topic.blocked
                                ? "Bloqueado"
                                : topic.unlocked
                                  ? (topic.passed ? "Completado" : "Disponible")
                                  : topic.trialLocked
                                    ? "Tras inscripción"
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
                              : topic.trialLocked
                                ? canEnroll ? "Inscríbete para continuar" : "Completa el examen del Tema 1"
                                : topic.paymentBlocked
                                  ? "Requiere pago de cuota"
                                  : "Tema bloqueado"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
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
