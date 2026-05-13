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

  // CREAR CUENTA: redirige a la página de registro
  const handleSignUp = () => {
    router.push("/register");
  };

  // INICIAR SESIÓN: Abre Google, verifica si existe en Turso ANTES de dejar pasar
  const handleSignIn = async () => {
    try {
      setError(null);
      setLoadingSignIn(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Verificar si el usuario existe en Turso
      const res = await fetch(`/api/user-role?email=${encodeURIComponent(user.email!)}`);

      if (res.status === 404) {
        // No existe en la BD: cerrar sesión de Firebase y mostrar error
        await auth.signOut();
        //setError("No tienes una cuenta registrada. Por favor usa \"Crear Cuenta\" primero.");
        Swal.fire({
          icon: "error",
          title: "Cuenta no encontrada",
          text: "No tienes una cuenta registrada. Usa 'Crear Cuenta' primero.",
          confirmButtonText: "Entendido"
        });
        return;
      }

      if (!res.ok) {
        setError("Error al verificar tu cuenta. Inténtalo de nuevo.");
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
        setError("Ocurrió un error al iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setLoadingSignIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md w-full">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-card flex flex-col sm:flex-row gap-4">
        {/* INSCRIBIRSE */}
        <button
          id="btn-signup"
          onClick={handleSignUp}
          disabled={loadingSignIn}
          className="btn btn-primary w-full sm:w-auto"
        >
          <UserPlus className="w-10 h-10" />
          Inscribirse
        </button>

        {/* INICIAR SESIÓN */}
        <button
          id="btn-signin"
          onClick={handleSignIn}
          disabled={loadingSignIn}
          className="btn btn-secondary w-full sm:w-auto"
        >
          <LogIn className="w-10 h-10" />
          {loadingSignIn ? "Verificando..." : "Iniciar Sesión"}
        </button>

      </div>
    </div>
  );
}
