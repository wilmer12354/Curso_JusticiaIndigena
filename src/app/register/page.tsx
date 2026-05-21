"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Shield, User, CreditCard, CheckCircle, ArrowLeft, X, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;
const RECEIPT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const PRICE_PER_MONTH = 140;

type PaymentMonths = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [address, setAddress] = useState("");

  const [step, setStep] = useState<"form" | "loading">("form");
  const [error, setError] = useState<string | null>(null);

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [jobTitleError, setJobTitleError] = useState("");
  const [educationLevelError, setEducationLevelError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState("");

  const [certificatePhotoFile, setCertificatePhotoFile] = useState<File | null>(null);
  const [certificatePhotoPreviewUrl, setCertificatePhotoPreviewUrl] = useState<string | null>(null);
  const [certificatePhotoError, setCertificatePhotoError] = useState("");
  const [paymentMonths, setPaymentMonths] = useState<PaymentMonths>(1);
  const [accessCheck, setAccessCheck] = useState<"loading" | "allowed" | "trial_blocked" | "no_account">("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email) {
        setAccessCheck("allowed");
        return;
      }

      try {
        const res = await fetch(`/api/user-role?email=${encodeURIComponent(firebaseUser.email)}`);
        if (!res.ok) {
          setAccessCheck("allowed");
          return;
        }
        const data = await res.json();
        if (!data.exists) {
          setAccessCheck("no_account");
          return;
        }
        if (data.role === "admin") {
          router.push("/admin");
          return;
        }
        if (data.status === "prueba" && !data.trialExamDone) {
          setAccessCheck("trial_blocked");
          return;
        }
        if (data.status === "activo") {
          router.push("/courses");
          return;
        }
        setAccessCheck("allowed");
      } catch {
        setAccessCheck("allowed");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const selectPaymentPlan = (m: PaymentMonths) => {
    if (m !== paymentMonths) {
      setReceiptFile(null);
      setReceiptError("");
      setReceiptPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
    setPaymentMonths(m);
  };

  const totalBs = paymentMonths * PRICE_PER_MONTH;

  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
      if (certificatePhotoPreviewUrl) URL.revokeObjectURL(certificatePhotoPreviewUrl);
    };
  }, [receiptPreviewUrl, certificatePhotoPreviewUrl]);

  const onReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setReceiptError("");
    if (receiptPreviewUrl) {
      URL.revokeObjectURL(receiptPreviewUrl);
      setReceiptPreviewUrl(null);
    }
    if (!file) {
      setReceiptFile(null);
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setReceiptFile(null);
      setReceiptError("El archivo supera 3 MB. Elige una imagen más pequeña o comprime el PDF.");
      e.target.value = "";
      return;
    }
    const okMime =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      file.type === "application/pdf";
    if (!okMime) {
      setReceiptFile(null);
      setReceiptError("Formato no admitido. Usa JPG, PNG, WebP o PDF.");
      e.target.value = "";
      return;
    }
    setReceiptFile(file);
    if (file.type.startsWith("image/")) {
      setReceiptPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onCertificatePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCertificatePhotoError("");
    if (certificatePhotoPreviewUrl) {
      URL.revokeObjectURL(certificatePhotoPreviewUrl);
      setCertificatePhotoPreviewUrl(null);
    }
    if (!file) {
      setCertificatePhotoFile(null);
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setCertificatePhotoFile(null);
      setCertificatePhotoError("El archivo supera 3 MB. Elige una foto más pequeña.");
      e.target.value = "";
      return;
    }
    const okMime =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";
    if (!okMime) {
      setCertificatePhotoFile(null);
      setCertificatePhotoError("Formato no admitido. Usa JPG, PNG o WebP.");
      e.target.value = "";
      return;
    }
    setCertificatePhotoFile(file);
    setCertificatePhotoPreviewUrl(URL.createObjectURL(file));
  };

  const validate = () => {
    let valid = true;
    if (!name.trim()) { setNameError("Por favor ingresa tu nombre completo."); valid = false; } else { setNameError(""); }
    if (!phone.trim() || !/^\d{7,15}$/.test(phone.trim())) { setPhoneError("Ingresa un celular válido (7-15 dígitos)."); valid = false; } else { setPhoneError(""); }
    if (!age.trim() || isNaN(Number(age))) { setAgeError("Ingresa una edad válida."); valid = false; } else { setAgeError(""); }
    if (!jobTitle.trim()) { setJobTitleError("Ingresa tu cargo o autoridad."); valid = false; } else { setJobTitleError(""); }
    if (!educationLevel.trim()) { setEducationLevelError("Ingresa tu nivel de estudio."); valid = false; } else { setEducationLevelError(""); }
    if (!address.trim()) { setAddressError("Ingresa tu dirección."); valid = false; } else { setAddressError(""); }
    return valid;
  };

  const handleGoogleSignUp = async () => {
    if (!validate()) return;
    if (!receiptFile) {
      setError("Debes adjuntar el comprobante de pago antes de continuar.");
      return;
    }
    if (!certificatePhotoFile) {
      setError("Debes subir la foto para tu certificado.");
      return;
    }
    setError(null);
    setStep("loading");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const formData = new FormData();
      formData.append("id", user.uid);
      formData.append("name", (name.trim() || user.displayName) ?? "");
      formData.append("email", user.email ?? "");
      formData.append("image", user.photoURL ?? "");
      formData.append("phone", phone.trim());
      formData.append("age", age.trim());
      formData.append("jobTitle", jobTitle.trim());
      formData.append("educationLevel", educationLevel.trim());
      formData.append("address", address.trim());
      formData.append("enrollmentMonths", String(paymentMonths));
      formData.append("receipt", receiptFile);
      formData.append("certificatePhoto", certificatePhotoFile);

      const res = await fetch("/api/sync-user", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          typeof errData.error === "string" ? errData.error : "Error al guardar los datos.";
        throw new Error(msg);
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
    } catch (err: unknown) {
      setStep("form");
      const code = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : "";
      if (code === "auth/popup-closed-by-user") return;
      const message = err instanceof Error ? err.message : "Ocurrió un error al crear la cuenta. Inténtalo de nuevo.";
      setError(message);
    }
  };

  if (accessCheck === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center register-page">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (accessCheck === "no_account") {
    return (
      <main className="register-page">
        <div className="register-container" style={{ maxWidth: 480, margin: "4rem auto", textAlign: "center" }}>
          <h1 className="register-title mb-4">Primero prueba el curso</h1>
          <p className="register-subtitle mb-6">
            Usa «Probar gratis» en la página principal para conocer el Tema 1. Después del examen podrás inscribirte aquí.
          </p>
          <Link href="/" className="btn btn-primary">Ir a la página principal</Link>
        </div>
      </main>
    );
  }

  if (accessCheck === "trial_blocked") {
    return (
      <main className="register-page">
        <div className="register-container" style={{ maxWidth: 480, margin: "4rem auto", textAlign: "center" }}>
          <h1 className="register-title mb-4">Completa la prueba primero</h1>
          <p className="register-subtitle mb-6">
            Debes ver el Tema 1 y rendir su examen antes de inscribirte y pagar.
          </p>
          <Link href="/courses/1" className="btn btn-primary">Ir al Tema 1</Link>
        </div>
      </main>
    );
  }

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
            <img
              src="/logo-cepabol.png"
              alt="Logo CEPABOL"
              className="w-12 h-12 object-contain rounded-full bg-white/10 p-1 backdrop-blur-sm"
            />
            <span className="register-logo-text">CEPABOL</span>
          </div>
        </div>

        {/* Card */}
        <div className="register-card">
          <div className="register-card-header">
            <h1 className="register-title">Inscribirme al curso</h1>
            <p className="register-subtitle">
              Completaste la prueba del Tema 1. Ahora completa tus datos y elige tu plan de pago (1, 2 o 3 meses de 140 Bs).
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="register-field">
                <label htmlFor="reg-age" className="register-label">
                  Edad *
                </label>
                <input
                  id="reg-age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ej: 30"
                  className={`register-input ${ageError ? "input-error" : ""}`}
                  disabled={step === "loading"}
                  min={1}
                />
                {ageError && <p className="register-field-error">{ageError}</p>}
              </div>

              <div className="register-field">
                <label htmlFor="reg-jobTitle" className="register-label">
                  Cargo / Autoridad *
                </label>
                <input
                  id="reg-jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ej: Juez, Dirigente, Estudiante..."
                  className={`register-input ${jobTitleError ? "input-error" : ""}`}
                  disabled={step === "loading"}
                />
                {jobTitleError && <p className="register-field-error">{jobTitleError}</p>}
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="reg-education" className="register-label">
                Nivel de estudio *
              </label>
              <input
                id="reg-education"
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="Ej: Bachiller, Licenciatura, Maestría..."
                className={`register-input ${educationLevelError ? "input-error" : ""}`}
                disabled={step === "loading"}
              />
              {educationLevelError && <p className="register-field-error">{educationLevelError}</p>}
            </div>

            <div className="register-field">
              <label htmlFor="reg-address" className="register-label">
                Dirección *
              </label>
              <input
                id="reg-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Calle 123, Zona Sur, Ciudad..."
                className={`register-input ${addressError ? "input-error" : ""}`}
                disabled={step === "loading"}
              />
              {addressError && <p className="register-field-error">{addressError}</p>}
            </div>

            <div className="register-field">
              <label className="register-label">
                Foto para tu Certificado *
              </label>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Esta foto aparecerá en tu certificado. Debe ser formal, preferiblemente con fondo claro y de frente (JPG, PNG o WebP, máx 3MB).
              </p>
              <label className="register-receipt-label">
                <Upload className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="register-receipt-label-text">
                  <span className="font-semibold text-slate-200">Subir foto (Selfie o formal)</span>
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onCertificatePhotoChange}
                  disabled={step === "loading"}
                  className="register-receipt-input"
                />
              </label>
              {certificatePhotoFile && (
                <div className="mt-3 text-sm text-slate-300 flex flex-col gap-2">
                  <span className="font-medium text-emerald-400">✓ Foto lista: {certificatePhotoFile.name}</span>
                  {certificatePhotoPreviewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={certificatePhotoPreviewUrl}
                      alt="Vista previa de foto"
                      className="max-h-40 rounded-lg border border-slate-600 object-cover w-32 h-32"
                    />
                  )}
                </div>
              )}
              {certificatePhotoError && <p className="register-field-error mt-2">{certificatePhotoError}</p>}
            </div>
          </section>

          {/* SECCIÓN 2: Pago con QR */}
          <section className="register-section">
            <h2 className="register-section-title">
              <CreditCard className="w-5 h-5" />
              Pago del Curso
            </h2>

            <p className="register-label" style={{ marginBottom: 8 }}>
              ¿Cuántos meses estás pagando en este comprobante?
            </p>
            <p className="register-google-desc" style={{ marginBottom: 14 }}>
              Cada mes cuesta <strong className="text-slate-200">{PRICE_PER_MONTH} Bs</strong>. El administrador revisará el comprobante y{" "}
              <strong className="text-slate-200">aprobará cada mes por separado</strong> para evitar errores si el monto no coincide.
            </p>

            <div className="register-plan-grid">
              {(
                [
                  { m: 1 as const, title: "1 mes", hint: "Solo primer bloque del curso" },
                  { m: 2 as const, title: "2 meses", hint: "Dos bloques (280 Bs en total)" },
                  { m: 3 as const, title: "3 meses (completo)", hint: "Curso completo (420 Bs en total)" },
                ] as const
              ).map(({ m, title, hint }) => (
                <button
                  key={m}
                  type="button"
                  disabled={step === "loading"}
                  onClick={() => selectPaymentPlan(m)}
                  className={`register-plan-option ${paymentMonths === m ? "register-plan-option-active" : ""}`}
                >
                  <span className="register-plan-title">{title}</span>
                  <span className="register-plan-price">{m * PRICE_PER_MONTH} Bs</span>
                  <span className="register-plan-hint">{hint}</span>
                </button>
              ))}
            </div>

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
                  src="/qr.png"
                  alt="Código QR para pago"
                  width={220}
                  height={220}
                  priority
                  className="register-qr-image"
                />
              </div>
              <div className="register-qr-amount">
                <span className="amount-label">Monto a pagar (según tu elección)</span>
                {/*<span className="amount-value">Bs. {totalBs}</span>*/}
              </div>
              <p className="register-qr-note">
                Transfiere exactamente <strong className="text-slate-300">{totalBs} Bs</strong>{" "}
                ({paymentMonths === 1 ? "1 mes" : `${paymentMonths} meses`}). Guarda el comprobante para adjuntarlo abajo.
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
                onClick={() => {
                  setHasPaid(true);
                  setReceiptError("");
                }}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${hasPaid ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {hasPaid ? "✓ Pago confirmado" : "Sí, ya pagué"}
              </button>
            </div>

            {hasPaid && (
              <div className="mb-4 space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm font-medium border border-green-200 dark:border-green-800">
                  Adjunta el comprobante que respalde <strong className="text-green-900 dark:text-green-100">{totalBs} Bs</strong> ({paymentMonths === 1 ? "1 mes" : `${paymentMonths} meses`}). Opcionalmente también puedes enviarlo por WhatsApp al{" "}
                  <strong className="text-green-900 dark:text-green-100 font-bold">71539769</strong>.
                </div>
                <label className="register-receipt-label">
                  <Upload className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="register-receipt-label-text">
                    <span className="font-semibold text-slate-200">Comprobante de pago</span>
                    <span className="text-xs text-slate-400 block mt-0.5">JPG, PNG, WebP o PDF · máx. 3 MB</span>
                  </span>
                  <input
                    type="file"
                    accept={RECEIPT_ACCEPT}
                    onChange={onReceiptChange}
                    disabled={step === "loading"}
                    className="register-receipt-input"
                  />
                </label>
                {receiptFile && (
                  <div className="text-sm text-slate-300 flex flex-col gap-2">
                    <span className="font-medium text-emerald-400">✓ Archivo listo: {receiptFile.name}</span>
                    {receiptPreviewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={receiptPreviewUrl}
                        alt="Vista previa del comprobante"
                        className="max-h-40 rounded-lg border border-slate-600 object-contain w-auto"
                      />
                    )}
                    {receiptFile.type === "application/pdf" && (
                      <span className="text-slate-400">Vista previa no disponible para PDF.</span>
                    )}
                  </div>
                )}
                {receiptError && <p className="register-field-error text-sm">{receiptError}</p>}
                {!receiptFile && (
                  <p className="text-sm text-amber-200/90">Sube tu comprobante para habilitar &quot;Continuar con Google&quot;.</p>
                )}
              </div>
            )}

            <button
              id="btn-google-signup"
              onClick={handleGoogleSignUp}
              disabled={step === "loading" || !hasPaid || !receiptFile}
              className="register-google-btn"
              style={!hasPaid || !receiptFile ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
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
