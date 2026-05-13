"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutDashboard, Users, BookOpenCheck, Pencil, Trash2, Plus, X, Search, RefreshCw, Clock, CheckCircle2, UserCheck, CreditCard, ThumbsUp, ThumbsDown, BadgeCheck, XOctagon, FileImage, Bell, Banknote, Lock, Unlock } from "lucide-react";
import { comprobantePublicUrl } from "@/lib/comprobante-public-url";
import { LogoutButton } from "../components/LogoutButton";

type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  status: string;
  created_at: string;
  age?: string;
  job_title?: string;
  education_level?: string;
  address?: string;
  certificate_photo?: string;
};

type Payment = {
  id: number;
  userId: string;
  cuota: number;
  monto: number;
  status: string;
  createdAt: string | null;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  paymentReceipt: string | null;
  registrationReceipt: string | null;
};

type BlockedTopic = {
  userId: string;
  topicOrder: number;
  attempts: number;
  userName: string;
  userEmail: string;
  topicTitle: string;
};

type ModalMode = "create" | "edit" | "delete" | null;

const EMPTY_FORM = { id: "", name: "", email: "", image: "", role: "student" };

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ name: string } | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<"dashboard" | "users" | "pendientes" | "pagos" | "bloqueados">("dashboard");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [blockedTopics, setBlockedTopics] = useState<BlockedTopic[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState<{
    url: string;
    isPdf: boolean;
    studentLabel: string;
    title?: string;
  } | null>(null);

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          const res = await fetch(`/api/user-role?email=${encodeURIComponent(firebaseUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.role === "admin") {
              setAdminUser({ name: data.name || firebaseUser.displayName || "Admin" });
              setLoading(false);
            } else {
              router.push("/courses");
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

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    setUsersLoading(false);
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      if (res.ok) setPayments(await res.json());
    } catch { /* ignore */ }
    setPaymentsLoading(false);
  }, []);

  const handlePaymentAction = async (paymentId: number, status: "aprobado" | "rechazado") => {
    setProcessingPayment(paymentId);
    try {
      await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchPayments();
    } finally {
      setProcessingPayment(null);
    }
  };

  const fetchBlocked = useCallback(async () => {
    setBlockedLoading(true);
    try {
      const res = await fetch("/api/admin/blocked");
      if (res.ok) setBlockedTopics(await res.json());
    } catch { /* ignore */ }
    setBlockedLoading(false);
  }, []);

  const handleUnblock = async (userId: string, topicOrder: number) => {
    const key = `${userId}-${topicOrder}`;
    setUnblocking(key);
    try {
      await fetch("/api/admin/unblock-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, topicOrder }),
      });
      fetchBlocked();
    } finally {
      setUnblocking(null);
    }
  };

  useEffect(() => {
    if (loading) return;
    void Promise.all([fetchUsers(), fetchPayments()]);
  }, [loading, fetchUsers, fetchPayments]);

  useEffect(() => {
    if (loading) return;
    if (activeSection === "users" || activeSection === "pendientes") fetchUsers();
    else if (activeSection === "pagos") fetchPayments();
    else if (activeSection === "bloqueados") fetchBlocked();
  }, [loading, activeSection, fetchUsers, fetchPayments, fetchBlocked]);

  useEffect(() => {
    setNotifOpen(false);
  }, [activeSection]);

  // Filtered users
  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Modal helpers
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError("");
    setModalMode("create");
  };
  const openEdit = (u: User) => {
    setSelectedUser(u);
    setForm({ id: u.id, name: u.name || "", email: u.email, image: u.image || "", role: u.role });
    setError("");
    setModalMode("edit");
  };
  const openDelete = (u: User) => {
    setSelectedUser(u);
    setModalMode("delete");
  };
  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  // CRUD handlers
  const handleCreate = async () => {
    if (!form.id || !form.email) { setError("ID y Email son requeridos."); return; }
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { closeModal(); fetchUsers(); } else { setError("Error al crear usuario."); }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    setSaving(true);
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { closeModal(); fetchUsers(); } else { setError("Error al actualizar."); }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSaving(true);
    await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
    setSaving(false);
    closeModal();
    fetchUsers();
  };

  // Activate user handler
  const handleActivate = async (userId: string) => {
    setActivating(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "activo" }),
      });
      await Promise.all([fetchUsers(), fetchPayments()]);
    } finally {
      setActivating(null);
    }
  };

  if (loading || !adminUser) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin rounded-full" style={{ width: 48, height: 48, border: "3px solid transparent", borderTopColor: "var(--primary)", borderRadius: "9999px" }} />
      </div>
    );
  }

  const pending = users.filter((u) => u.status === "pendiente");
  const pendingPayments = payments.filter((p) => p.status === "pendiente");
  const approvedRevenueBs = payments
    .filter((p) => p.status === "aprobado")
    .reduce((sum, p) => sum + p.monto, 0);
  const notifTotal = pending.length + pendingPayments.length;
  const stats = [
    { label: "Total Estudiantes", value: users.length, icon: Users, variant: "default" as const },
    { label: "Pendientes", value: pending.length, icon: Clock, variant: "warning" as const },
    { label: "Activos", value: users.filter((u) => u.status === "activo").length, icon: CheckCircle2, variant: "default" as const },
    {
      label: "Ingresos aprobados",
      value: `${approvedRevenueBs.toLocaleString("es-BO")} Bs`,
      icon: Banknote,
      variant: "success" as const,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", background: "var(--background)" }}>
      {/* Sidebar */}
      <aside style={{
        width: isMobile ? "100%" : 240,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 16 : 32,
        padding: isMobile ? "1rem" : "2rem 1.25rem",
        background: "rgba(255,255,255,0.02)",
        borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)",
        borderBottom: isMobile ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
          <LayoutDashboard size={22} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: 17 }}>Panel Admin</span>
        </div>

        <nav style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: 6,
          flex: 1,
          overflowX: isMobile ? "auto" : "visible",
          paddingBottom: isMobile ? 2 : 0,
        }}>
          {[
            { id: "dashboard", label: "Dashboard", Icon: BookOpenCheck },
            { id: "users", label: "Estudiantes", Icon: Users },
            { id: "pendientes", label: "Pendientes", Icon: Clock },
            { id: "pagos", label: "Pagos", Icon: CreditCard },
            { id: "bloqueados", label: "Bloqueados", Icon: Lock },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as "dashboard" | "users" | "pendientes" | "pagos")}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 500,
                  background: activeSection === id
                    ? (id === "pendientes" ? "rgba(245,158,11,0.12)" : id === "pagos" ? "rgba(99,102,241,0.15)" : id === "bloqueados" ? "rgba(248,113,113,0.12)" : "rgba(194,65,12,0.15)")
                    : "transparent",
                  color: activeSection === id
                    ? (id === "pendientes" ? "#f59e0b" : id === "pagos" ? "#818cf8" : id === "bloqueados" ? "#f87171" : "var(--primary)")
                    : "#94a3b8",
                transition: "all 0.2s",
                position: "relative",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <Icon size={18} />{label}
              {id === "pendientes" && pending.length > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#f59e0b", color: "#000",
                  fontSize: 11, fontWeight: 800, borderRadius: 999,
                  padding: "1px 7px", lineHeight: 1.6,
                }}>{pending.length}</span>
              )}
              {id === "pagos" && pendingPayments.length > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#818cf8", color: "#fff",
                  fontSize: 11, fontWeight: 800, borderRadius: 999,
                  padding: "1px 7px", lineHeight: 1.6,
                }}>{pendingPayments.length}</span>
              )}
              {id === "bloqueados" && blockedTopics.length > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#f87171", color: "#fff",
                  fontSize: 11, fontWeight: 800, borderRadius: 999,
                  padding: "1px 7px", lineHeight: 1.6,
                }}>{blockedTopics.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ alignSelf: isMobile ? "flex-end" : "stretch" }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: isMobile ? "1rem" : "2.5rem 3rem", overflowY: "auto", position: "relative" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#fff,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>
              {activeSection === "dashboard" ? `Bienvenido, ${adminUser.name}` : activeSection === "pendientes" ? "Activación de Cuentas" : activeSection === "pagos" ? "Gestión de Pagos" : activeSection === "bloqueados" ? "Temas Bloqueados" : "Gestión de Estudiantes"}
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              {activeSection === "dashboard"
                ? "Gestiona los contenidos de Justicia Indígena."
                : activeSection === "pendientes"
                  ? "Activa la cuenta cuando corresponda. En Pagos, aprueba cada mes (140 Bs) solo si el comprobante coincide con ese mes."
                  : activeSection === "pagos"
                    ? "Cada fila es un mes (140 Bs). Aunque el estudiante haya elegido varios meses al inscribirse, aprueba o rechaza uno por uno según lo que veas en el comprobante."
                    : activeSection === "bloqueados"
                      ? "Estudiantes que agotaron sus 3 intentos en un tema. Desbloquéalos para que puedan reintentar."
                      : "Visualiza, crea, edita y elimina estudiantes."}
            </p>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              type="button"
              aria-label="Notificaciones"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((o) => !o)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: notifOpen ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                color: "#cbd5e1",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <Bell size={22} />
              {notifTotal > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                    borderRadius: 999,
                    background: "#f59e0b",
                    color: "#0f172a",
                    fontSize: 11,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {notifTotal > 99 ? "99+" : notifTotal}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div
                  role="presentation"
                  onClick={() => setNotifOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 45 }}
                />
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: isMobile ? "min(calc(100vw - 2rem), 320px)" : 300,
                    zIndex: 46,
                    background: "#141419",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Pendientes
                  </div>
                  {notifTotal === 0 ? (
                    <div style={{ padding: "18px 14px", fontSize: 14, color: "#64748b" }}>No hay elementos nuevos por revisar.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {pending.length > 0 && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveSection("pendientes");
                            setNotifOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            padding: "14px 16px",
                            border: "none",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            background: "transparent",
                            cursor: "pointer",
                            textAlign: "left",
                            color: "#f1f5f9",
                            fontSize: 14,
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Clock size={18} color="#f59e0b" />
                            Cuentas por activar
                          </span>
                          <span style={{ fontWeight: 800, color: "#f59e0b" }}>{pending.length}</span>
                        </button>
                      )}
                      {pendingPayments.length > 0 && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveSection("pagos");
                            setNotifOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            padding: "14px 16px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            textAlign: "left",
                            color: "#f1f5f9",
                            fontSize: 14,
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <CreditCard size={18} color="#818cf8" />
                            Pagos por revisar
                          </span>
                          <span style={{ fontWeight: 800, color: "#818cf8" }}>{pendingPayments.length}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {activeSection === "dashboard" && (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
              {stats.map(({ label, value, icon: Icon, variant }, i) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${variant === "warning"
                    ? "rgba(245,158,11,0.2)"
                    : variant === "success"
                      ? "rgba(34,197,94,0.22)"
                      : "rgba(255,255,255,0.08)"
                    }`,
                  borderRadius: 16, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    background:
                      variant === "warning"
                        ? "rgba(245,158,11,0.12)"
                        : variant === "success"
                          ? "rgba(34,197,94,0.14)"
                          : "rgba(194,65,12,0.15)",
                    borderRadius: 10, padding: 10,
                  }}>
                    <Icon
                      size={20}
                      color={variant === "warning" ? "#f59e0b" : variant === "success" ? "#4ade80" : "var(--primary)"}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: variant === "success" ? "-0.02em" : undefined }}>{value}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pending.length > 0 && (
                <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "1rem 1.25rem", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Clock size={18} color="#f59e0b" />
                    <span style={{ fontSize: 14, color: "#f59e0b", fontWeight: 600 }}>{pending.length} estudiante{pending.length > 1 ? "s" : ""} esperando activación</span>
                  </div>
                  <button onClick={() => setActiveSection("pendientes")} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ver ahora</button>
                </div>
              )}
              {pendingPayments.length > 0 && (
                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 14, padding: "1rem 1.25rem", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CreditCard size={18} color="#818cf8" />
                    <span style={{ fontSize: 14, color: "#a5b4fc", fontWeight: 600 }}>{pendingPayments.length} pago{pendingPayments.length > 1 ? "s" : ""} de cuota esperando revisión</span>
                  </div>
                  <button onClick={() => setActiveSection("pagos")} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", color: "#c7d2fe", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ver ahora</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* PENDIENTES section */}
        {activeSection === "pendientes" && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <button onClick={fetchUsers} title="Recargar" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <RefreshCw size={16} className={usersLoading ? "animate-spin" : ""} />
              </button>
            </div>
            {usersLoading ? (
              <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Cargando...</div>
            ) : pending.length === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "4rem", textAlign: "center" }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "#64748b", fontSize: 14 }}>No hay estudiantes pendientes de activación.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pending.map((u) => (
                  <div key={u.id} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.15)",
                    borderRadius: 14, padding: "1.25rem 1.5rem",
                    display: "flex", alignItems: "center", gap: 16, flexWrap: isMobile ? "wrap" : "nowrap",
                  }}>
                    {(u.certificate_photo || u.image) ? (
                      <img src={u.certificate_photo ? (comprobantePublicUrl(u.certificate_photo) ?? undefined) : String(u.image)} alt={String(u.name ?? "")} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(245,158,11,0.3)", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#f59e0b", flexShrink: 0 }}>
                        {String(u.name ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", marginBottom: 2 }}>{u.name || "—"}</div>
                      <div style={{ fontSize: 13, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "3px 10px", color: "#f59e0b", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                      <Clock size={12} /> Pendiente
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap", marginLeft: isMobile ? "auto" : 0 }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("es-BO") : "—"}
                    </div>
                    <button
                      onClick={() => handleActivate(u.id)}
                      disabled={activating === u.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 18px", borderRadius: 10,
                        background: activating === u.id ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.15)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        color: "#4ade80", fontSize: 13, fontWeight: 700,
                        cursor: activating === u.id ? "not-allowed" : "pointer",
                        opacity: activating === u.id ? 0.6 : 1,
                        whiteSpace: "nowrap", flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                    >
                      <UserCheck size={15} />
                      {activating === u.id ? "Activando..." : "Activar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* PAGOS section */}
        {activeSection === "pagos" && (
          <>
            <div
              style={{
                marginBottom: 20,
                padding: "14px 18px",
                borderRadius: 12,
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.22)",
                color: "#c7d2fe",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: "#e0e7ff" }}>Importante:</strong> un estudiante puede marcar que pagó 3 meses y solo transferir 140 Bs. Por eso cada mes aparece aparte: solo pulsa Aprobar en el mes que el comprobante respalde (140 Bs por mes aprobado).
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <button onClick={fetchPayments} title="Recargar" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <RefreshCw size={16} className={paymentsLoading ? "animate-spin" : ""} />
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                {(["pendiente", "aprobado", "rechazado"] as const).map((s) => (
                  <span key={s} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: s === "aprobado" ? "rgba(34,197,94,0.1)" : s === "rechazado" ? "rgba(248,113,113,0.1)" : "rgba(99,102,241,0.1)",
                    color: s === "aprobado" ? "#4ade80" : s === "rechazado" ? "#f87171" : "#818cf8",
                    border: `1px solid ${s === "aprobado" ? "rgba(34,197,94,0.2)" : s === "rechazado" ? "rgba(248,113,113,0.2)" : "rgba(99,102,241,0.2)"}`,
                  }}>
                    {s === "pendiente" ? `${payments.filter(p => p.status === "pendiente").length} pendientes` : s === "aprobado" ? `${payments.filter(p => p.status === "aprobado").length} aprobados` : `${payments.filter(p => p.status === "rechazado").length} rechazados`}
                  </span>
                ))}
              </div>
            </div>
            {paymentsLoading ? (
              <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Cargando...</div>
            ) : payments.length === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "4rem", textAlign: "center" }}>
                <CreditCard size={48} color="#818cf8" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "#64748b", fontSize: 14 }}>No hay registros de pago aún.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {payments.map((p) => {
                  const receiptHref = comprobantePublicUrl(p.paymentReceipt ?? p.registrationReceipt);
                  const raw = (p.paymentReceipt ?? p.registrationReceipt ?? "").toLowerCase();
                  const showPdf = raw.endsWith(".pdf") || raw.startsWith("data:application/pdf");
                  const studentLabel = p.userName || p.userEmail || "Estudiante";
                  return (
                    <div key={p.id} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${p.status === "aprobado" ? "rgba(34,197,94,0.2)" : p.status === "rechazado" ? "rgba(248,113,113,0.2)" : "rgba(99,102,241,0.15)"}`,
                      borderRadius: 14, padding: "1.1rem 1.4rem",
                      display: "flex", alignItems: "center", gap: 16, flexWrap: isMobile ? "wrap" : "nowrap",
                    }}>
                      {p.userImage ? (
                        <img src={p.userImage} alt={p.userName ?? ""} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(99,102,241,0.3)", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#818cf8", flexShrink: 0 }}>
                          {(p.userName ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", marginBottom: 2 }}>{p.userName || "—"}</div>
                        <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.userEmail}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Mes</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: "#818cf8" }}>{p.cuota}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Monto</span>
                          <span style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{p.monto} Bs</span>
                        </div>
                        {receiptHref ? (
                          <button
                            type="button"
                            title="Ver comprobante"
                            onClick={() =>
                              setReceiptModal({
                                url: receiptHref,
                                isPdf: showPdf,
                                studentLabel,
                              })
                            }
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "8px 12px", borderRadius: 10,
                              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.35)",
                              color: "#a5b4fc", fontSize: 12, fontWeight: 700,
                              cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                            }}
                          >
                            <FileImage size={16} />
                            <span>Comprobante</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "#475569", width: 72, textAlign: "center" }} title="Sin comprobante registrado">—</span>
                        )}
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: p.status === "aprobado" ? "rgba(34,197,94,0.1)" : p.status === "rechazado" ? "rgba(248,113,113,0.1)" : "rgba(99,102,241,0.1)",
                          color: p.status === "aprobado" ? "#4ade80" : p.status === "rechazado" ? "#f87171" : "#818cf8",
                          border: `1px solid ${p.status === "aprobado" ? "rgba(34,197,94,0.2)" : p.status === "rechazado" ? "rgba(248,113,113,0.2)" : "rgba(99,102,241,0.2)"}`,
                        }}>
                          {p.status === "aprobado" ? "Aprobado" : p.status === "rechazado" ? "Rechazado" : "Pendiente"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-BO") : "—"}
                      </div>
                      {p.status === "pendiente" && (
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => handlePaymentAction(p.id, "aprobado")}
                            disabled={processingPayment === p.id}
                            title="Aprobar pago"
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "8px 16px", borderRadius: 10,
                              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                              color: "#4ade80", fontSize: 13, fontWeight: 700,
                              cursor: processingPayment === p.id ? "not-allowed" : "pointer",
                              opacity: processingPayment === p.id ? 0.6 : 1, transition: "all 0.2s",
                            }}
                          >
                            <BadgeCheck size={15} />
                            {processingPayment === p.id ? "..." : "Aprobar"}
                          </button>
                          <button
                            onClick={() => handlePaymentAction(p.id, "rechazado")}
                            disabled={processingPayment === p.id}
                            title="Rechazar pago"
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "8px 16px", borderRadius: 10,
                              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                              color: "#f87171", fontSize: 13, fontWeight: 700,
                              cursor: processingPayment === p.id ? "not-allowed" : "pointer",
                              opacity: processingPayment === p.id ? 0.6 : 1, transition: "all 0.2s",
                            }}
                          >
                            <XOctagon size={15} />
                            {processingPayment === p.id ? "..." : "Rechazar"}
                          </button>
                        </div>
                      )}
                      {p.status !== "pendiente" && (
                        <div style={{ flexShrink: 0 }}>
                          {p.status === "aprobado"
                            ? <ThumbsUp size={18} color="#4ade80" />
                            : <ThumbsDown size={18} color="#f87171" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeSection === "bloqueados" && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <button onClick={fetchBlocked} title="Recargar" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <RefreshCw size={16} className={blockedLoading ? "animate-spin" : ""} />
              </button>
            </div>
            {blockedLoading ? (
              <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Cargando...</div>
            ) : blockedTopics.length === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "4rem", textAlign: "center" }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "#64748b", fontSize: 14 }}>No hay temas bloqueados por 3 intentos fallidos.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {blockedTopics.map((bt) => {
                  const key = `${bt.userId}-${bt.topicOrder}`;
                  return (
                    <div key={key} style={{
                      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(248,113,113,0.15)",
                      borderRadius: 14, padding: "1.25rem 1.5rem",
                      display: "flex", alignItems: "center", gap: 16, flexWrap: isMobile ? "wrap" : "nowrap",
                    }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Lock size={20} color="#f87171" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", marginBottom: 2 }}>{bt.userName || "—"}</div>
                        <div style={{ fontSize: 13, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bt.userEmail}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Tema</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: "#f87171" }}>{bt.topicOrder}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#94a3b8", flexShrink: 0, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Intentos</div>
                        {bt.attempts}
                      </div>
                      <div style={{ fontSize: 13, color: "#94a3b8", flexShrink: 0, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Título</div>
                        {bt.topicTitle}
                      </div>
                      <button
                        onClick={() => handleUnblock(bt.userId, bt.topicOrder)}
                        disabled={unblocking === key}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 18px", borderRadius: 10,
                          background: unblocking === key ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          color: "#4ade80", fontSize: 13, fontWeight: 700,
                          cursor: unblocking === key ? "not-allowed" : "pointer",
                          opacity: unblocking === key ? 0.6 : 1,
                          whiteSpace: "nowrap", flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      >
                        <Unlock size={15} />
                        {unblocking === key ? "Desbloqueando..." : "Desbloquear"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeSection === "users" && (
          <>

            {/* Toolbar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={15} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  style={{
                    width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", fontSize: 14, outline: "none",
                  }}
                />
              </div>
              <button onClick={fetchUsers} title="Recargar" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <RefreshCw size={16} className={usersLoading ? "animate-spin" : ""} />
              </button>
              <button onClick={openCreate} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                borderRadius: 10, background: "var(--primary)", color: "#fff", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: 14,
              }}>
                <Plus size={16} /> Nuevo Usuario
              </button>
            </div>

            {/* Table */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Usuario", "Detalles", "Rol", "Estado", "Creado", "Acciones"].map((h) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Cargando...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 48, color: "#64748b" }}>No se encontraron usuarios.</td></tr>
                  ) : (
                    filtered.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {(u.certificate_photo || u.image) ? (
                              <img
                                src={u.certificate_photo ? (comprobantePublicUrl(u.certificate_photo) ?? undefined) : String(u.image)}
                                alt={String(u.name ?? "")}
                                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)" }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(194,65,12,0.2)", display: (u.certificate_photo || u.image) ? "none" : "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--primary)", flexShrink: 0 }}>
                              {String(u.name ?? "?")[0]?.toUpperCase() || "?"}
                            </div>
                            <span style={{ fontWeight: 500, fontSize: 14 }}>{u.name || "—"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#94a3b8" }}>
                          <div style={{ marginBottom: 4 }}><strong style={{ color: "#cbd5e1" }}>Email:</strong> {u.email}</div>
                          {u.age && <div><strong style={{ color: "#cbd5e1" }}>Edad:</strong> {u.age}</div>}
                          {u.job_title && <div><strong style={{ color: "#cbd5e1" }}>Cargo:</strong> {u.job_title}</div>}
                          {u.education_level && <div><strong style={{ color: "#cbd5e1" }}>Estudios:</strong> {u.education_level}</div>}
                          {u.address && <div><strong style={{ color: "#cbd5e1" }}>Dirección:</strong> {u.address}</div>}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: u.role === "admin" ? "rgba(194,65,12,0.2)" : "rgba(99,102,241,0.15)",
                            color: u.role === "admin" ? "var(--primary)" : "#818cf8",
                            border: `1px solid ${u.role === "admin" ? "rgba(194,65,12,0.3)" : "rgba(99,102,241,0.2)"}`,
                          }}>
                            {u.role === "admin" ? "Admin" : "Estudiante"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: u.status === "activo" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                            color: u.status === "activo" ? "#4ade80" : "#f59e0b",
                            border: `1px solid ${u.status === "activo" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                          }}>
                            {u.status === "activo" ? "Activo" : "Pendiente"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#64748b" }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("es-BO") : "—"}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => openEdit(u)} title="Editar" style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", transition: "all 0.2s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#60a5fa"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(96,165,250,0.4)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => openDelete(u)} title="Eliminar" style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", transition: "all 0.2s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.4)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}>
                              <Trash2 size={14} />
                            </button>
                            {u.certificate_photo && (
                              <button
                                onClick={() => setReceiptModal({
                                  url: comprobantePublicUrl(u.certificate_photo) || "",
                                  isPdf: (u.certificate_photo ?? "").toLowerCase().endsWith(".pdf"),
                                  studentLabel: u.name || u.email,
                                  title: "Foto para Certificado"
                                })}
                                title="Ver foto de certificado"
                                style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", cursor: "pointer", color: "#4ade80", display: "flex", alignItems: "center", transition: "all 0.2s" }}
                              >
                                <FileImage size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      {modalMode && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>

            {/* Delete confirm */}
            {modalMode === "delete" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "rgba(248,113,113,0.15)", borderRadius: 10, padding: 10 }}><Trash2 size={20} color="#f87171" /></div>
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>Eliminar usuario</h2>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
                  ¿Estás seguro de que deseas eliminar a <strong style={{ color: "#fff" }}>{selectedUser?.name || selectedUser?.email}</strong>? Esta acción no se puede deshacer.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={closeModal} style={{ padding: "9px 18px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: 14 }}>Cancelar</button>
                  <button onClick={handleDelete} disabled={saving} style={{ padding: "9px 18px", borderRadius: 10, background: "#dc2626", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, opacity: saving ? 0.6 : 1 }}>
                    {saving ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </>
            )}

            {/* Create / Edit form */}
            {(modalMode === "create" || modalMode === "edit") && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>{modalMode === "create" ? "Nuevo Usuario" : "Editar Usuario"}</h2>
                  <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}><X size={18} /></button>
                </div>

                {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {modalMode === "create" && (
                    <div>
                      <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>ID *</label>
                      <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="ID único del usuario" style={inputStyle} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Nombre</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Email *</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>URL de Imagen</label>
                    <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Rol</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="student">Estudiante</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                  <button onClick={closeModal} style={{ padding: "9px 18px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: 14 }}>Cancelar</button>
                  <button onClick={modalMode === "create" ? handleCreate : handleEdit} disabled={saving} style={{ padding: "9px 20px", borderRadius: 10, background: "var(--primary)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, opacity: saving ? 0.6 : 1 }}>
                    {saving ? "Guardando..." : modalMode === "create" ? "Crear Usuario" : "Guardar Cambios"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {receiptModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-modal-title"
          onClick={() => setReceiptModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111115",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              width: "100%",
              maxWidth: 920,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h2 id="receipt-modal-title" style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                  {receiptModal.title || "Comprobante de pago"}
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {receiptModal.studentLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: 8,
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  flexShrink: 0,
                }}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
              {receiptModal.isPdf ? (
                <iframe
                  title="Comprobante PDF"
                  src={receiptModal.url}
                  style={{
                    width: "100%",
                    minHeight: "70vh",
                    border: "none",
                    borderRadius: 8,
                    background: "#1e293b",
                  }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receiptModal.url}
                  alt="Comprobante de pago"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              )}
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
              <a
                href={receiptModal.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 600 }}
              >
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 14, outline: "none",
};
