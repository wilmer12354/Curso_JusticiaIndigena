"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Shield, User, Phone, CreditCard, CheckCircle, ArrowLeft, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "loading">("form");
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [hasPaid, setHasPaid] = useState(false);

  const validate = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Por favor ingresa tu nombre completo.");
      valid = false;
    } else {
      setNameError("");
    }
    if (!phone.trim() || !/^\d{7,15}$/.test(phone.trim())) {
      setPhoneError("Ingresa un número de celular válido (7–15 dígitos).");
      valid = false;
    } else {
      setPhoneError("");
    }
    return valid;
  };

  const handleGoogleSignUp = async () => {
    if (!validate()) return;
    setError(null);
    setStep("loading");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Guardar en Turso con nombre, teléfono y datos de Google
      const res = await fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.uid,
          name: name.trim() || user.displayName,
          email: user.email,
          image: user.photoURL,
          phone: phone.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar los datos.");
      }

      // Verificar rol y redirigir
      const roleRes = await fetch(`/api/user-role?email=${encodeURIComponent(user.email!)}`);
      if (roleRes.ok) {
        const data = await roleRes.json();
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/courses");
        }
      } else {
        router.push("/courses");
      }
    } catch (err: any) {
      setStep("form");
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Ocurrió un error al crear la cuenta. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <main className="register-page">
      {/* Background */}
      <div className="register-bg">
        <div className="register-bg-orb orb-1" />
        <div className="register-bg-orb orb-2" />
        <div className="register-bg-orb orb-3" />
      </div>

      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          <Link href="/" className="register-back-btn">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="register-logo">
            <Shield className="w-8 h-8 text-primary" />
            <span className="register-logo-text">CEPABOL</span>
          </div>
        </div>

        {/* Card */}
        <div className="register-card">
          <div className="register-card-header">
            <h1 className="register-title">Crear Cuenta</h1>
            <p className="register-subtitle">
              Completa tus datos y realiza el pago para acceder a los cursos.
            </p>
          </div>

          {/* Steps indicator */}
          <div className="register-steps">
            <div className="register-step active">
              <span className="step-num">1</span>
              <span className="step-label">Tus datos</span>
            </div>
            <div className="register-step-line" />
            <div className="register-step active">
              <span className="step-num">2</span>
              <span className="step-label">Pago</span>
            </div>
            <div className="register-step-line" />
            <div className="register-step">
              <span className="step-num">3</span>
              <span className="step-label">Cuenta</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="register-error">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECCIÓN 1: Datos personales */}
          <section className="register-section">
            <h2 className="register-section-title">
              <User className="w-5 h-5" />
              Datos Personales
            </h2>

            <div className="register-field">
              <label htmlFor="reg-name" className="register-label">
                Nombre completo *
              </label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Carlos Mamani"
                className={`register-input ${nameError ? "input-error" : ""}`}
                disabled={step === "loading"}
              />
              {nameError && <p className="register-field-error">{nameError}</p>}
            </div>

            <div className="register-field">
              <label htmlFor="reg-phone" className="register-label">
                Número de celular *
              </label>
              <div className="register-phone-wrapper">
                <span className="register-phone-prefix">🇧🇴 +591</span>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ej: 79123456"
                  className={`register-input phone-input ${phoneError ? "input-error" : ""}`}
                  disabled={step === "loading"}
                  maxLength={15}
                />
              </div>
              {phoneError && <p className="register-field-error">{phoneError}</p>}
            </div>
          </section>

          {/* SECCIÓN 2: Pago con QR */}
          <section className="register-section">
            <h2 className="register-section-title">
              <CreditCard className="w-5 h-5" />
              Pago del Curso
            </h2>

            <div className="register-qr-box">
              <div className="register-qr-badge">
                <CheckCircle className="w-4 h-4" />
                Pago Seguro
              </div>
              <p className="register-qr-instruction">
                Escanea el código QR para realizar tu pago por <strong>Tigo Money, QR Simple o transferencia bancaria</strong>.
              </p>
              <div className="register-qr-image-wrapper">
                <Image
                  src="/qr_pago.png"
                  alt="Código QR para pago"
                  width={220}
                  height={220}
                  className="register-qr-image"
                />
              </div>
              <div className="register-qr-amount">
                <span className="amount-label">Monto a pagar</span>
                <span className="amount-value">Bs. 150</span>
              </div>
              <p className="register-qr-note">
                💡 Guarda el comprobante de pago. Puedes enviarlo por WhatsApp al administrador.
              </p>
            </div>
          </section>

          {/* SECCIÓN 3: Crear cuenta con Google */}
          <section className="register-section">
            <h2 className="register-section-title">
              <Shield className="w-5 h-5" />
              Crear cuenta con Google
            </h2>
            <p className="register-google-desc">
              Al continuar con Google, tu correo electrónico se vinculará a tu cuenta de forma segura.
              Asegúrate de haber realizado el pago antes de continuar.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">¿Ya realizó el pago?</span>
              <button
                type="button"
                onClick={() => setHasPaid(true)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${hasPaid ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {hasPaid ? "✓ Pago confirmado" : "Sí, ya pagué"}
              </button>
            </div>

            {hasPaid && (
              <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm font-medium border border-green-200 dark:border-green-800">
                Si es así, mande el comprobante al <strong className="text-green-900 dark:text-green-100 font-bold">71539769</strong> e ingrese a continuación con su correo de Google.
              </div>
            )}

            <button
              id="btn-google-signup"
              onClick={handleGoogleSignUp}
              disabled={step === "loading" || !hasPaid}
              className="register-google-btn"
              style={!hasPaid ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              {step === "loading" ? (
                <>
                  <div className="register-spinner" />
                  Creando tu cuenta...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
