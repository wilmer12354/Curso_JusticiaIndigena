"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { UserPlus, LogIn, X, Sparkles } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

export function AuthButtons() {
  const router = useRouter();
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryFree = async () => {
    try {
      setError(null);
      setLoadingTrial(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await fetch("/api/sync-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo iniciar la prueba. Inténtalo de nuevo.");
        return;
      }

      const data = await res.json();
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/courses");
      }
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

        Swal.fire({
          icon: "info",
          title: "Aún no tienes cuenta",
          text: "Usa «Probar gratis» para conocer el Tema 1. Después del examen podrás inscribirte.",
          confirmButtonText: "Entendido",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#2563eb",
        });

        return;
      }

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

  return (
    <div
      className="flex flex-col items-center gap-6 animate-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md w-full backdrop-blur-xl">
          <X className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
        <button
          id="btn-try-free"
          onClick={handleTryFree}
          disabled={busy}
          className="
            group relative overflow-hidden
            flex items-center justify-center gap-3
            w-full sm:w-auto px-8 py-4 rounded-2xl
            bg-orange-500 text-white font-semibold text-lg
            shadow-lg shadow-primary/30 transition-all duration-300
            hover:scale-105 hover:shadow-primary/50 active:scale-95
            disabled:opacity-60
          "
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <Sparkles className="w-6 h-6 relative z-10" />
          <span className="relative z-10">
            {loadingTrial ? "Iniciando..." : "Probar gratis"}
          </span>
        </button>

        <button
          id="btn-signin"
          onClick={handleSignIn}
          disabled={busy}
          className="
            group relative overflow-hidden
            flex items-center justify-center gap-3
            w-full sm:w-auto px-8 py-4 rounded-2xl
            border border-white/15 bg-white/5 backdrop-blur-xl
            text-white font-semibold text-lg transition-all duration-300
            hover:bg-white/10 hover:scale-105 hover:border-primary/40 active:scale-95
            disabled:opacity-60
          "
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <LogIn className="w-6 h-6 relative z-10" />
          <span className="relative z-10">
            {loadingSignIn ? "Verificando..." : "Iniciar sesión"}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleSignUp}
        disabled={busy}
        className="text-sm text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline disabled:opacity-60"
      >
        Ya completé la prueba — inscribirme y pagar
      </button>
    </div>
  );
}
