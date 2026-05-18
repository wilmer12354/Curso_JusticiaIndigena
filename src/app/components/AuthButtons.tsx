"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { UserPlus, LogIn, X } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

export function AuthButtons() {
  const router = useRouter();
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = async (email: string) => {
    const res = await fetch(`/api/user-role?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.role;
  };

  // CREAR CUENTA
  const handleSignUp = () => {
    router.push("/register");
  };

  // INICIAR SESIÓN
  const handleSignIn = async () => {
    try {
      setError(null);
      setLoadingSignIn(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Verificar si existe en la BD
      const res = await fetch(
        `/api/user-role?email=${encodeURIComponent(user.email!)}`
      );

      if (res.status === 404) {
        await auth.signOut();

        Swal.fire({
          icon: "error",
          title: "Cuenta no encontrada",
          text: "No tienes una cuenta registrada. Usa 'Crear Cuenta' primero.",
          confirmButtonText: "Entendido",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#2563eb",
        });

        return;
      }

      if (!res.ok) {
        setError("Error al verificar tu cuenta. Inténtalo nuevamente.");
        return;
      }

      const data = await res.json();

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/courses");
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Ocurrió un error al iniciar sesión.");
      }
    } finally {
      setLoadingSignIn(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-6 animate-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md w-full backdrop-blur-xl">
          <X className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
        
        {/* INSCRIBIRSE */}
        <button
          id="btn-signup"
          onClick={handleSignUp}
          disabled={loadingSignIn}
          className="
            group
            relative
            overflow-hidden
            flex items-center justify-center gap-3
            w-full sm:w-auto
            px-8 py-4
            rounded-2xl
            bg-orange-500
            text-white
            font-semibold
            text-lg
            shadow-lg shadow-primary/30
            transition-all duration-300
            hover:scale-105
            hover:shadow-primary/50
            active:scale-95
            disabled:opacity-60
          "
        >
          {/* EFECTO BRILLO */}
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* SHINE */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <UserPlus className="w-6 h-6 relative z-10" />

          <span className="relative z-10">
            Inscribirse
          </span>
        </button>

        {/* INICIAR SESIÓN */}
        <button
          id="btn-signin"
          onClick={handleSignIn}
          disabled={loadingSignIn}
          className="
            group
            relative
            overflow-hidden
            flex items-center justify-center gap-3
            w-full sm:w-auto
            px-8 py-4
            rounded-2xl
            border border-white/15
            bg-white/5
            backdrop-blur-xl
            text-white
            font-semibold
            text-lg
            transition-all duration-300
            hover:bg-white/10
            hover:scale-105
            hover:border-primary/40
            active:scale-95
            disabled:opacity-60
          "
        >
          {/* SHINE EFFECT */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <LogIn className="w-6 h-6 relative z-10" />

          <span className="relative z-10">
            {loadingSignIn ? "Verificando..." : "Iniciar Sesión"}
          </span>
        </button>
      </div>
    </div>
  );
}