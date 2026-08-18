"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { UserPlus, LogIn, X, Sparkles, Menu } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import { setAuthCache, setTrialSession } from "@/lib/auth-cache";

export function AuthButtons() {
  const router = useRouter();
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTryFree = async () => {
    try {
      setError(null);

      const { value: formValues, isConfirmed } = await Swal.fire({
        icon: "info",
        title: "Prueba gratis",
        html: `
          <div style="text-align:left">
            <p style="font-size:14px;color:#94a3b8;margin-bottom:16px;line-height:1.5">
              Accede al Tema 1 sin necesidad de cuenta. Solo dinos tu nombre y tu celular.
            </p>
            <label for="swal-name" style="display:block;font-size:13px;color:#cbd5e1;margin-bottom:6px;font-weight:600">Nombre completo</label>
            <input id="swal-name" type="text" placeholder="Ej: Juan Carlos Mamani" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:14px;margin-bottom:14px;outline:none"/>
            <label for="swal-phone" style="display:block;font-size:13px;color:#cbd5e1;margin-bottom:6px;font-weight:600">Número de celular</label>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:10px 12px;font-size:14px;color:#cbd5e1;white-space:nowrap">🇧🇴 +591</span>
              <input id="swal-phone" type="tel" placeholder="Ej: 79123456" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:14px;outline:none"/>
            </div>
          </div>
        `,
        confirmButtonText: "Comenzar prueba",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#ea580c",
        cancelButtonColor: "#6b7280",
        allowOutsideClick: false,
        preConfirm: () => {
          const nameEl = document.getElementById("swal-name") as HTMLInputElement | null;
          const phoneEl = document.getElementById("swal-phone") as HTMLInputElement | null;
          const name = (nameEl?.value ?? "").trim();
          const phone = (phoneEl?.value ?? "").replace(/\D/g, "");
          if (!name) {
            Swal.showValidationMessage("Por favor ingresa tu nombre completo.");
            return false;
          }
          if (!/^\d{7,15}$/.test(phone)) {
            Swal.showValidationMessage("Ingresa un celular válido (7-15 dígitos).");
            return false;
          }
          return { name, phone };
        },
      });

      if (!isConfirmed || !formValues) return;

      setLoadingTrial(true);

      const res = await fetch("/api/sync-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name,
          phone: formValues.phone,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo iniciar la prueba. Inténtalo de nuevo.");
        return;
      }

      const data = await res.json();

      if (data.existingRegistered) {
        const { isConfirmed } = await Swal.fire({
          icon: "warning",
          title: "Este número ya está inscrito",
          text: "Ya tienes una cuenta registrada con este celular. Inicia sesión con Google para continuar.",
          showCancelButton: true,
          confirmButtonText: "Iniciar sesión",
          cancelButtonText: "Ahora no",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
        });
        if (isConfirmed) {
          await handleSignIn();
        }
        return;
      }

      setTrialSession({
        id: data.id,
        name: data.name,
        phone: formValues.phone,
        email: `${data.id}@prueba.local`,
        status: "prueba",
      });

      if (data.isNew === false) {
        await Swal.fire({
          icon: "success",
          title: "¡Bienvenido de nuevo!",
          text: "Vimos que ya nos visitaste, vuelve a ver.",
          confirmButtonText: "Continuar",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#ea580c",
        });
      }

      router.push("/courses");
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code !== "auth/popup-closed-by-user") {
        setError("Ocurrió un error al iniciar la prueba.");
      }
    } finally {
      setLoadingTrial(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setError(null);
      setLoadingSignIn(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await fetch(
        `/api/user-role?email=${encodeURIComponent(user.email!)}`
      );

      if (!res.ok) {
        setError("Error al verificar tu cuenta. Inténtalo nuevamente.");
        return;
      }

      const data = await res.json();

      if (!data.exists) {
        await auth.signOut();

        const result = await Swal.fire({
          icon: "info",
          title: "Aún no tienes cuenta",
          text: "Usa «Probar gratis» para conocer el Tema 1. Después del examen podrás inscribirte.",
          confirmButtonText: "Entendido",
          showDenyButton: true,
          denyButtonText: "Probar gratis",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#2563eb",
          denyButtonColor: "#ea580c",
        });

        if (result.isDenied) {
          handleTryFree();
        }

        return;
      }

      setAuthCache({ email: user.email!, role: data.role, name: user.displayName ?? "", status: data.status });
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/courses");
      }
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code !== "auth/popup-closed-by-user") {
        setError("Ocurrió un error al iniciar sesión.");
      }
    } finally {
      setLoadingSignIn(false);
    }
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  const busy = loadingSignIn || loadingTrial;

  const menuActions = [
    {
      id: "btn-try-free",
      label: loadingTrial ? "Iniciando..." : "Probar gratis",
      onClick: handleTryFree,
      icon: Sparkles,
      primary: true,
      fullWidth: true,
    },
    {
      id: "btn-signup",
      label: "Inscribirme",
      onClick: handleSignUp,
      icon: UserPlus,
      primary: false,
      fullWidth: true,
    },
    {
      id: "btn-signin",
      label: loadingSignIn ? "Verificando..." : "Iniciar sesión",
      onClick: handleSignIn,
      icon: LogIn,
      primary: false,
      fullWidth: true,
    },
  ];

  const renderActionButton = (action: {
    id: string;
    label: string;
    onClick: () => void;
    icon: typeof Sparkles;
    primary: boolean;
    fullWidth: boolean;
  }) => {
    const Icon = action.icon;

    return (
      <button
        key={action.id}
        id={action.id}
        type="button"
        onClick={() => {
          action.onClick();
          setMobileMenuOpen(false);
        }}
        disabled={busy}
        className={[
          "group relative overflow-hidden",
          "flex items-center justify-center gap-3",
          action.fullWidth ? "w-full" : "w-auto",
          "px-5 py-3 rounded-2xl font-semibold text-base md:text-lg transition-all duration-300",
          action.primary
            ? "bg-orange-500 text-white shadow-lg shadow-primary/30 hover:scale-[1.02] hover:shadow-primary/50 active:scale-95 disabled:opacity-60"
            : "border border-white/15 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:scale-[1.02] hover:border-primary/40 active:scale-95 disabled:opacity-60",
        ].join(" ")}
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <Icon className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
        <span className="relative z-10">{action.label}</span>
      </button>
    );
  };

  return (
    <div
      className="flex flex-col items-center gap-4 animate-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md w-full backdrop-blur-xl">
          <X className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="w-full flex justify-end md:hidden">
        <button
          type="button"
          aria-label="Abrir menú de autenticación"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white shadow-lg shadow-black/20 transition hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="hidden md:flex md:flex-row md:items-center md:justify-center md:gap-4 md:w-auto w-full">
        {menuActions.map(renderActionButton)}
      </div>

      {mobileMenuOpen && (
        <div className="flex w-full flex-col gap-3 md:hidden">
          {menuActions.map(renderActionButton)}
        </div>
      )}
    </div>
  );
}
