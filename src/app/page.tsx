"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Shield, BookOpen } from "lucide-react";
import { AuthButtons } from "./components/AuthButtons";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        // Fetch role from Turso
        try {
          const res = await fetch(`/api/user-role?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.role === "admin") {
              router.push("/admin");
            } else {
              router.push("/courses");
            }
          } else {
            setLoading(false);
          }
        } catch (e) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container min-h-screen flex flex-col justify-center items-center text-center">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url("/indigenous_justice_hero.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Shield className="w-10 h-10 text-primary" />
          <span className="text-xl font-bold tracking-tight text-slate-400">CEPABOL JUSTICE</span>
        </div>
        <h1 className="max-w-4xl mx-auto">
          Justicia Indígena Originaria Campesina
        </h1>
        <p className="mx-auto text-slate-400">
          Explora y fortalece los conocimientos sobre la pluralidad jurídica y los sistemas de justicia comunitaria en Bolivia.
        </p>
      </header>

      <AuthButtons />
      {/*
      <footer className="mt-24 text-slate-500 text-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex gap-8 justify-center items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Cursos Certificados</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Respaldo Institucional</span>
          </div>
        </div>
      </footer>*/}
    </main>
  );
}
