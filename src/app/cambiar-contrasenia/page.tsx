"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, X } from "lucide-react";
import { getPasswordSession, setPasswordSession } from "@/lib/auth-cache";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      await Promise.resolve();
      if (cancelled) return;

      const pw = getPasswordSession();
      if (!pw || !pw.id) {
        router.push("/");
        return;
      }
      if (!pw.mustChangePassword) {
        router.push(pw.role === "admin" ? "/admin" : "/courses");
        return;
      }
      setUsername(pw.username);
      setReady(true);
    };

    void validate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const pw = getPasswordSession();
    if (!pw || !pw.id) {
      router.push("/");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pw.id, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "No se pudo cambiar la contraseña.");
        return;
      }

      setPasswordSession({ ...pw, mustChangePassword: false });
      router.push("/courses");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Cambia tu contraseña</h1>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Por seguridad, debes crear tu propia contraseña antes de continuar.
            La que te dio el administrador es temporal.
          </p>

          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <span className="text-slate-500">Usuario:</span>{" "}
            <strong className="text-white">{username}</strong>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
              >
                Nueva contraseña
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primary/50"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary mt-2 flex items-center justify-center gap-2"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              <ShieldCheck className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
