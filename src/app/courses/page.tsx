"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Book, GraduationCap, Clock, Shield, Clock3 } from "lucide-react";
import { LogoutButton } from "../components/LogoutButton";

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [status, setStatus] = useState<string>("activo");

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
              setUser({ name: data.name || firebaseUser.displayName || "Estudiante" });
              setStatus(data.status ?? "activo");
              setLoading(false);
            }
          } else {
            router.push("/");
          }
        } catch (e) {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

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
          {/* Animated clock icon */}
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

  const courses = [
    { id: 1, title: "Introducción a la Justicia Indígena", duration: "10h", level: "Básico" },
    { id: 2, title: "Pluralismo Jurídico en Bolivia", duration: "15h", level: "Intermedio" },
    { id: 3, title: "Derechos de los Pueblos Indígenas", duration: "12h", level: "Avanzado" },
  ];

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
        <header className="mb-12">
          <h1 className="!text-4xl">Tus Cursos de Formación</h1>
          <p className="text-slate-400 mt-2">Continúa tu aprendizaje sobre los sistemas de justicia comunitaria.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="glass-card flex flex-col gap-6 group hover:border-primary/40 transition-all">
              <div className="aspect-video rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden relative">
                <Book className="w-12 h-12 text-slate-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="px-2 py-0.5 rounded bg-primary/10">{course.level}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{course.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    12 Módulos
                  </div>
                </div>
              </div>

              <button className="btn btn-primary w-full mt-auto">
                Continuar Curso
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

