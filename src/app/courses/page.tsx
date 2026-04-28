"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Book, GraduationCap, Clock } from "lucide-react";
import { LogoutButton } from "../components/LogoutButton";

export default function CoursesPage() {
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
              router.push("/admin");
            } else {
              setUser({ name: data.name || firebaseUser.displayName || "Estudiante" });
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
