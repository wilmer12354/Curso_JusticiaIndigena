"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutDashboard, Users, BookOpenCheck } from "lucide-react";
import { LogoutButton } from "../components/LogoutButton";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          const res = await fetch(`/api/user-role?email=${encodeURIComponent(firebaseUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.role === "admin") {
              setUser({ name: data.name || firebaseUser.displayName || "Admin" });
              setLoading(false);
            } else {
              router.push("/courses");
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass-card rounded-none border-y-0 border-l-0 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <LayoutDashboard className="text-primary" />
          <span className="font-bold text-lg">Panel Admin</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <a href="#" className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary font-medium">
            <BookOpenCheck className="w-5 h-5" />
            Cursos
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-white/5 transition-colors">
            <Users className="w-5 h-5" />
            Estudiantes
          </a>
        </nav>

        <LogoutButton />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        <header className="mb-12">
          <h1 className="!text-3xl mb-2">Bienvenido, {user.name}</h1>
          <p className="text-slate-400">Gestiona los contenidos y estudiantes de Justicia Indígena.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-primary/20">
            <h3 className="text-xl font-bold mb-2">12</h3>
            <p className="text-sm text-slate-400">Cursos Activos</p>
          </div>
          <div className="glass-card p-6 border-primary/20">
            <h3 className="text-xl font-bold mb-2">450</h3>
            <p className="text-sm text-slate-400">Estudiantes Inscritos</p>
          </div>
          <div className="glass-card p-6 border-primary/20">
            <h3 className="text-xl font-bold mb-2">85%</h3>
            <p className="text-sm text-slate-400">Tasa de Finalización</p>
          </div>
        </div>

        <section className="mt-12 glass-card">
          <h2 className="text-xl font-bold mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium">Nuevo estudiante registrado</p>
                    <p className="text-sm text-slate-500">Hace {i * 2} horas</p>
                  </div>
                </div>
                <button className="text-primary text-sm font-medium">Ver perfil</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
