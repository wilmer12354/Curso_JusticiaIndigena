"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Shield, BookOpen, Scale, Users, ChevronDown, Star, Clock, Award } from "lucide-react";
import { AuthButtons } from "./components/AuthButtons";
import anime from "animejs";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const aboutRef = useRef<HTMLElement>(null);
  const heroBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
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
    // About section animation
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
              duration: 1200,
            });
          } else {
            anime.set('.about-animate', { translateY: 50, opacity: 0 });
          }
        });
      },
      { threshold: 0.15 }
    );
    if (aboutRef.current) observer.observe(aboutRef.current);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    // Hero body cards animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.hero-card',
              translateY: [60, 0],
              opacity: [0, 1],
              delay: anime.stagger(150),
              easing: 'easeOutExpo',
              duration: 1000,
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (heroBodyRef.current) observer.observe(heroBodyRef.current);
    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="text-slate-400 text-sm tracking-widest uppercase">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-background">

      {/* ═══════════════════════════════════════════
          HERO SECTION — Header con login + Body con info
      ═══════════════════════════════════════════ */}
      <main className="relative min-h-screen flex flex-col">

        {/* Fondo decorativo global del hero */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{
              backgroundImage: 'url("/indigenous_justice_hero.png")',
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
          <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-primary/15 rounded-full blur-[160px]" />
          <div className="absolute top-[30%] right-[0%] w-[35%] h-[40%] bg-accent/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[30%] bg-primary/8 rounded-full blur-[120px]" />
        </div>

        {/* ── CABECERA: Logo + Título + Login ── */}
        <header className="relative z-20 w-full">
          {/* Barra de navegación — pill flotante centrada */}
          <div className="flex justify-between items-center px-6 md:px-10 pt-5 pb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>

            {/* Logo + nombre */}
            <div className="flex items-center gap-2.5">

              <div className="flex flex-col leading-none">

                <h2>

                  <span className="text-base text-slate-400 tracking-widest uppercase font-medium">PLATAFORMA VIRTUAL</span>
                </h2>
              </div>
            </div>

            {/* Auth pill — compacta y refinada */}
            <div

            >
              {/* Sobreescribimos estilos del componente hijo via CSS cascade */}
              <style>{`
                .auth-pill-wrap button,
                .auth-pill-wrap a {
                  font-size: 0.75rem !important;
                  padding: 0.3rem 0.85rem !important;
                  height: auto !important;
                  min-height: 0 !important;
                  border-radius: 9999px !important;
                  line-height: 1.4 !important;
                }
              `}</style>
              <div className="">
                <AuthButtons />
              </div>
            </div>
          </div>

          {/* Título hero centrado */}
          <div className="text-center px-6 pt-16 pb-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {/* Badge */}
            <div className="flex items-center justify-center gap-3">
              <img
                src="/logo-cepabol.png"
                alt="Logo CEPABOL"
                className="w-20 h-20 object-contain rounded-full bg-white/10 p-1 backdrop-blur-sm"
              />
              <span className="text-4xl font-bold tracking-tight text-slate-400">CEPABOL</span>
            </div>

            <h1 className="max-w-4xl mx-auto text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-1 p-7">
              <span className="text-white">Curso: Justicia Indígena</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent p-10">
                Originaria Campesina
              </span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Explora y fortalece los conocimientos sobre la pluralidad jurídica
              y los sistemas de justicia comunitaria en Bolivia.
            </p>

            {/* Stats rápidas */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              {[
                { icon: Star, value: "4.9", label: "Calificación" },
                { icon: Users, value: "50+", label: "Estudiantes" },
                { icon: Clock, value: "40+", label: "Contenido" },
                { icon: Award, value: "Certificado", label: "Incluido" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-white font-bold text-lg">{value}</span>
                  </div>
                  <span className="text-slate-500 text-xs tracking-wider uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator hacia el cuerpo */}
          <div className="flex justify-center pb-15 pt-5">
            <button
              onClick={() => document.getElementById('curso-info')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-bounce text-slate-500 hover:text-primary transition-colors flex flex-col items-center gap-5 group"
            >
              <span className="text-base tracking-widest uppercase font-medium">Más información</span>
              <ChevronDown className="w-15 h-15 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>


      </main>
      {/* ── BODY DEL HERO: Información del curso ── */}
      <section
        id="curso-info"
        ref={heroBodyRef}
        className="relative z-10 px-6 md:px-12 pb-12 pt-10"
      >
        {/* Divider decorativo */}
        <div className="flex items-center gap-4 max-w-6xl mx-auto mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-slate-400 text-sm tracking-widest uppercase font-medium">
            ¿Qué aprenderás?
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Grid de módulos / características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {[
            {
              icon: Scale,
              color: "primary",
              title: "Marcos Normativos",
              desc: "Comprende la Constitución Política del Estado y las leyes que reconocen y protegen la Justicia Indígena Originaria Campesina en Bolivia.",
            },
            {
              icon: Shield,
              color: "accent",
              title: "Jurisdicción y Competencia",
              desc: "Aprende los límites territoriales, personales y materiales de la jurisdicción comunitaria y su relación con el sistema jurídico nacional.",
            },
            {
              icon: Users,
              color: "primary",
              title: "Procedimientos Comunitarios",
              desc: "Estudia los mecanismos de resolución de conflictos desde la perspectiva ancestral, incluyendo la toma de decisiones colectiva.",
            },
            {
              icon: BookOpen,
              color: "accent",
              title: "Pluralismo Jurídico",
              desc: "Explora cómo coexisten múltiples sistemas legales en Bolivia y la importancia del diálogo intercultural en la justicia.",
            },
            {
              icon: Award,
              color: "primary",
              title: "Saberes Ancestrales",
              desc: "Reconoce el valor de los conocimientos y prácticas tradicionales como fuente de derecho y forma de vida en las comunidades.",
            },
            {
              icon: Star,
              color: "accent",
              title: "Casos Prácticos",
              desc: "Analiza situaciones reales y aprende cómo se aplica la justicia comunitaria en contextos contemporáneos bolivianos.",
            },
          ].map(({ icon: Icon, color, title, desc }, i) => (
            <div
              key={title}
              className="hero-card opacity-0 group relative bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-7 hover:bg-white/8 hover:border-white/15 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Glow en hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color === 'primary' ? 'from-primary/5 to-transparent' : 'from-accent/5 to-transparent'}`} />

              <div className={`relative inline-flex p-3 rounded-xl mb-5 ${color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="relative text-white font-bold text-lg mb-3 leading-tight">{title}</h3>
              <p className="relative text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Bloque de CTA / inscripción */}
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background/80 to-accent/5 backdrop-blur-xl p-10 md:p-14 text-center">
            {/* Decoración interior */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative grid lg:grid-cols-[0.8fr_1.5fr] gap-16 items-center">

              {/* IZQUIERDA */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-sm font-medium mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Inscripciones abiertas
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Comienza tu aprendizaje hoy
                </h2>

                <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed text-center">
                  Únete a los varios estudiantes que ya están fortaleciendo sus conocimientos sobre la justicia indígena. Puedes pasar a cualquier hora y desde cualquier lugar. Y reforzaras tus conocimientos con un examen en cada tema, así asegurando tu aprendizaje.
                </p>

                {/* BOTONES */}
                <div className="flex justify-center lg:justify-start">
                  <AuthButtons />
                </div>

                {/* GARANTÍAS */}
                <div className="flex flex-wrap gap-6 mt-8 text-sm text-slate-500">
                  {[
                    "✓ Acceso inmediato",
                    "✓ Certificado digital",
                    "✓ Contenido en español",
                    "✓ Actualizaciones incluidas",
                  ].map((g) => (
                    <span key={g} className="text-slate-400">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* DERECHA - VIDEO */}
              {/* DERECHA - VIDEO */}
              <div className="relative flex flex-col items-center w-full">

                {/* TÍTULO */}
                <div className="mb-6 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    ¿Cómo me puedo inscribir?
                  </h3>

                  <p className="text-slate-400 mt-2 text-base">
                    Observa el siguiente video para conocer el proceso de inscripción y los requisitos necesarios para acceder al curso. Es rápido, fácil y seguro. ¡Te esperamos dentro!
                  </p>
                </div>

                {/* Glow */}
                <div className="absolute -inset-10 bg-gradient-to-r from-orange-500/20 via-amber-400/10 to-yellow-300/20 blur-3xl rounded-full" />

                <div
                  className="
      relative

      w-full
      lg:w-[625px]

      overflow-hidden

      rounded-[40px]

      border border-white/10

      bg-white/5
      backdrop-blur-2xl

      shadow-[0_25px_120px_rgba(249,115,22,0.30)]
    "
                >
                  {/* Overlay glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-400/10 pointer-events-none z-10" />

                  {/* VIDEO */}
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/Ay_NvZORZvo"
                      title="Presentación del curso"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hacia Sobre Nosotros */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => document.getElementById('sobre-nosotros')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-slate-600 hover:text-slate-400 transition-colors flex flex-col items-center gap-2.5 group"
          >
            <span className="text-base tracking-widest uppercase">Sobre nosotros</span>
            <ChevronDown className="w-8 h-8 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ABOUT SECTION — Sin cambios estructurales
      ═══════════════════════════════════════════ */}
      <section ref={aboutRef} id="sobre-nosotros" className="py-5 px-4 relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[25%] h-[25%] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-5 about-animate opacity-0">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              CEPABOL
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Bloque de pregunta — ancho completo */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl about-animate opacity-0 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl mb-5">
              <h3 className="text-2xl font-bold mb-1 text-white text-center">MISIÓN</h3>
              <p className="text-slate-400 leading-relaxed text-lg text-center">
                Brindar una plataforma educativa accesible que difunda el conocimiento de la Justicia Indígena Originaria Campesina en Bolivia, integrando saberes ancestrales con herramientas digitales modernas.

              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl about-animate opacity-0 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl mb-5">
              <h3 className="text-2xl font-bold mb-1 text-white text-center">VISIÓN</h3>
              <p className="text-slate-400 leading-relaxed text-lg text-center">
                Ser la plataforma de referencia para el aprendizaje y fortalecimiento de la Justicia Indígena Originaria Campesina en Bolivia, promoviendo el respeto, la interculturalidad y el acceso a la educación en comunidades rurales y urbanas.
              </p>
            </div>
          </div>

          {/* Grid de autores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* AUTOR 1 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center about-animate opacity-0 group hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
              <div className="relative w-40 h-40 mx-auto mb-6 rounded-full p-1 bg-gradient-to-br from-orange-500 via-amber-400 to-transparent shadow-[0_0_40px_rgba(249,115,22,0.35)] group-hover:rotate-180 transition-transform duration-700">
                <div className="w-full h-full rounded-full overflow-hidden bg-background p-[0.1px] group-hover:-rotate-180 transition-transform duration-700">
                  <img
                    src="/author1.jpg"
                    alt="Autor 1"
                    className="w-full h-full object-cover rounded-full bg-slate-800"
                  />
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Dr. David Ticona Balboa
              </h4>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                Gerente General CEPABOL
              </div>
              <p className="text-slate-400">
                Perito especializado en cuestiones indígenas.
              </p>
            </div>

            {/* AUTOR 2 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center about-animate opacity-0 group hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
              <div className="relative w-40 h-40 mx-auto mb-6 rounded-full p-1 bg-gradient-to-br from-orange-500 via-amber-400 to-transparent shadow-[0_0_40px_rgba(249,115,22,0.35)] group-hover:rotate-180 transition-transform duration-700">
                <div className="w-full h-full rounded-full overflow-hidden bg-background p-[0.1px] group-hover:-rotate-180 transition-transform duration-700">
                  <img
                    src="/author2.jpg"
                    alt="Autora 2"
                    className="w-full h-full object-cover rounded-full bg-slate-800"
                  />
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Lic. Claudia Flores Choque
              </h4>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                Directora Académica
              </div>
              <p className="text-slate-400">
                Especialista en gestión de proyectos educativos.
              </p>
            </div>

            {/* AUTOR 3 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center about-animate opacity-0 group hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
              <div className="relative w-40 h-40 mx-auto mb-6 rounded-full p-1 bg-gradient-to-br from-orange-500 via-amber-400 to-transparent shadow-[0_0_40px_rgba(249,115,22,0.35)] group-hover:rotate-180 transition-transform duration-700">
                <div className="w-full h-full rounded-full overflow-hidden bg-background p-[0.1px] group-hover:-rotate-180 transition-transform duration-700">
                  <img
                    src="/author3.jpg"
                    alt=""
                    className="w-full h-full object-cover rounded-full bg-slate-800"
                  />
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Lic. Wilmer Rafael Apaza Mallea
              </h4>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                Licenciado en Informática
              </div>
              <p className="text-slate-400">
                Encargado del desarrollo tecnológico de la plataforma.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}