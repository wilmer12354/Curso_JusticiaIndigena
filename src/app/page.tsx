"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Shield, BookOpen } from "lucide-react";
import { AuthButtons } from "./components/AuthButtons";
import anime from "animejs";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const aboutRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    // Setup Intersection Observer for the About Us animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.about-animate',
              translateY: [50, 0],
              opacity: [0, 1],
              delay: anime.stagger(200),
              easing: 'easeOutExpo',
              duration: 1200
            });
          } else {
            // Reset state when out of view so it animates again when coming back
            anime.set('.about-animate', {
              translateY: 50,
              opacity: 0
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pb-24 md:pb-0 after:absolute after:bottom-0 after:left-0 after:w-full after:h-40 after:bg-gradient-to-b after:from-transparent after:to-background after:z-10">
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: 'url("/indigenous_justice_hero.png")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>
        </div>

        <header className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/logo-cepabol.png"
              alt="Logo CEPABOL"
              className="w-20 h-20 object-contain rounded-full bg-white/10 p-1 backdrop-blur-sm"
            />
            <span className="text-4xl font-bold tracking-tight text-slate-400">CEPABOL</span>
          </div>
          <h1 className="max-w-4xl mx-auto leading-[1.2] pb-4 text-6xl md:text-7xl font-bold">
            Curso: Justicia Indígena Originaria Campesina
          </h1>
          <p className="mx-auto text-slate-400 text-lg md:text-xl max-w-2xl mt-8">
            Explora y fortalece los conocimientos sobre la pluralidad jurídica y los sistemas de justicia comunitaria en Bolivia.
          </p>
        </header>

        <AuthButtons />

        {/* Scroll Indicator — flujo normal en móvil, absoluto en md+ */}
        <div
          className="mt-10 z-20 md:absolute md:bottom-10 md:mt-0 animate-bounce cursor-pointer text-slate-500 hover:text-white transition-colors flex flex-col items-center gap-2"
          onClick={() => {
            document.getElementById('sobre-nosotros')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>
          <span className="text-sm font-medium tracking-wider uppercase">Sobre nosotros</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </main>

      {/* About Us Section */}
      <section ref={aboutRef} id="sobre-nosotros" className="py-32 px-4 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[25%] h-[25%] bg-accent/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 about-animate opacity-0">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Sobre Nosotros
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side: Questions */}
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl about-animate opacity-0 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 text-primary rounded-2xl shrink-0">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-white">¿Por qué es importante este curso?</h3>
                    <p className="text-slate-400 leading-relaxed text-lg">
                      La Justicia Indígena Originaria Campesina es un pilar fundamental de la pluralidad en Bolivia. Comprenderla es esencial para promover la equidad y el respeto a nuestros saberes ancestrales en un contexto moderno.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl about-animate opacity-0 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 text-accent rounded-2xl shrink-0">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-white">¿Qué se aprenderá?</h3>
                    <p className="text-slate-400 leading-relaxed text-lg">
                      Aprenderás sobre los marcos normativos, la jurisdicción y competencia, los procedimientos y resoluciones de conflictos desde la perspectiva comunitaria, respaldados por nuestra constitución.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Authors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Author 1 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center about-animate opacity-0 group hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
                <div className="relative w-40 h-40 mx-auto mb-6 rounded-full p-1 bg-gradient-to-br from-primary to-transparent group-hover:rotate-180 transition-transform duration-700">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background p-1 group-hover:-rotate-180 transition-transform duration-700">
                    <img src="/author1.jpg" alt="Autor 1" className="w-full h-full object-cover rounded-full bg-slate-800" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Dr. David Ticona Balboa</h4>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Gerente General CEPABOL
                </div>
                <p className="text-slate-400">
                  Perito especializado en cuestiones indígenas.
                </p>
              </div>

              {/* Author 2 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center about-animate opacity-0 group hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl sm:mt-12">
                <div className="relative w-40 h-40 mx-auto mb-6 rounded-full p-1 bg-gradient-to-br from-accent to-transparent group-hover:rotate-180 transition-transform duration-700">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background p-1 group-hover:-rotate-180 transition-transform duration-700">
                    <img src="/author2.jpg" alt="Autora 2" className="w-full h-full object-cover rounded-full bg-slate-800" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Lic. Claudia Ticona Mallea</h4>
                <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                  Directora Académica
                </div>
                <p className="text-slate-400">
                  Especialista en gestión de proyectos educativos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
