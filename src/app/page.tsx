"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Shield, BookOpen, Scale, Users, ChevronDown, Star, Clock, Award, X, HelpCircle, WifiOff, Building2, Monitor, Globe, Package } from "lucide-react";
import { AuthButtons } from "./components/AuthButtons";
import { getAuthCache, setAuthCache } from "@/lib/auth-cache";
import anime from "animejs";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const aboutRef = useRef<HTMLElement>(null);
  const heroBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cached = getAuthCache();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        // If cache matches, redirect immediately without API call
        if (cached && cached.email === user.email) {
          if (cached.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/courses");
          }
          return;
        }
        try {
          const res = await fetch(`/api/user-role?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (!data.exists) {
              setLoading(false);
              return;
            }
            setAuthCache({ email: user.email!, role: data.role, name: data.name ?? "", status: data.status });
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
    <div className="flex flex-col min-h-screen bg-background">

      {/* ═══════════════════════════════════════════
          HERO SECTION — Header con login + Body con info
      ═══════════════════════════════════════════ */}
      <main className="relative min-h-[80vh] md:min-h-screen flex flex-col">

        {/* Fondo decorativo global del hero */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{
              backgroundImage: 'url("/indigenous_justice_hero.webp")',
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
            <div className="flex items-center justify-center gap-3 -mt-[2rem] md:-mt-[4rem] lg:-mt-[6rem]">
              <img
                src="/logo-cepabol.png"
                alt="Logo CEPABOL"
                className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full bg-white/10 p-1 backdrop-blur-sm"
              />
              <span className="text-3xl md:text-4xl font-bold tracking-tight text-slate-400">CEPABOL</span>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="fixed top-24 md:top-36 right-5 z-50 flex flex-col items-end gap-2">
                <span className="hidden md:inline text-ms text-amber-300 font-medium whitespace-nowrap bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-lg">
                  ¿Tienes problemas con la conectividad de internet? 👇
                </span>
                <button
                  onClick={() => setShowHelp(true)}
                  className="relative p-3 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/40 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/50 active:scale-95 transition-all duration-300"
                >
                  <WifiOff className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-sm" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
                </button>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-1 p-4 md:p-7 mt-[4rem] md:mt-[8rem] lg:mt-[11rem]">
                <span className="text-white">Escuela de Jueces Naturales</span>
                <br />
                <span className="text-white">Curso: Justicia Indígena</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent">
                  Originaria Campesina
                </span>
              </h1>
            </div>
            <p className="text-lime-50 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed px-2 font-semibold text-center">
              <span className="font-bold text-yellow-300 drop-shadow-lg">CONTACTOS:</span>{" "}
              <span className="text-white font-bold text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                71539769
              </span>
              <span className="mx-3 text-yellow-300">•</span>
              <span className="text-white font-bold text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                76517230
              </span>
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-white mt-10 mb-8">
              Modalidades
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { href: "/modalidades/presencial", icon: Building2, label: "Presencial", desc: "Clases en el Edificio Rojas" },
                { href: "/modalidades/virtual", icon: Monitor, label: "Virtual", desc: "En vivo con acceso a internet" },
                { href: "/modalidades/en-linea", icon: Globe, label: "En Línea", desc: "Prueba gratis y examen en plataforma" },
                { href: "/modalidades/a-distancia", icon: Package, label: "A Distancia", desc: "USB con todo el contenido" },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative bg-white/10 backdrop-blur-xl border border-primary/30 rounded-2xl py-6 px-5 hover:bg-white/15 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 hover:scale-105 text-center shadow-lg shadow-primary/20"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-primary/10 to-transparent" />
                  <div className="relative inline-flex p-4 rounded-xl mb-4 bg-primary/20 text-orange-400">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="relative text-white font-bold text-xl mb-2">{label}</h3>
                  <p className="relative text-slate-300 text-sm font-medium">{desc}</p>
                </Link>
              ))}
            </div>

            {/* Stats rápidas */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-10">
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
              title: "Módulo 1",
              icon: Scale,
              color: "primary",
              topics: [
                "Ley N° 073 de Deslinde Jurisdiccional.",
                "Sistema Judicial Indígena.",
                "Declaración de Naciones Unidas sobre los Derechos de los Pueblos Indígenas.",
                "Protocolo de Actuación intercultural de los jueces y juezas en el marco del pluralismo jurídico igualitario.",
                "Justicia Constitucional Plural",
                "Lineamientos para la Coordinacion y Cooperación entre la Justicia Ordinaria y la Justicia Indígena Originaria Campesina",
                "La Cosa Juzgada y Mecanismos de Ejecución de la Sentencia de la JIOC (Parte 1)",
              ],
            },

            {
              title: "Módulo 2",
              icon: Shield,
              color: "accent",
              topics: [
                "La Cosa Juzgada y mecanismos de ejecución de la sentencia de la JIOC (Parte 2)",
                "Pluralismo Jurídico y Marco Constitucional.",
                "Tribunal Constitucional y la Justicia Indígena Originaria Campesina", ,
                "Fuentes del Derecho Indígena Normas, Uso, Prácticas y Costumbres",
                "Estudio de Casos Reales",
                "Procedimientos de la Justicia Indígena.",
                "Litigio Estratégico en el Ámbito Internacional."

              ],
            },

            {
              title: "Módulo 3",
              icon: BookOpen,
              color: "primary",
              topics: [
                "La minería y los pueblos originarios.",
                "Catastro Rural - INRA",
                "Más proximamente...",
              ],
            },
          ].map(({ icon: Icon, color, title, topics }) => (

            <div
              key={title}
              className="hero-card group relative bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-7 hover:bg-white/8 hover:border-white/15 transition-all duration-500 hover:-translate-y-1"
            >

              {/* Glow */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color === "primary"
                  ? "from-primary/5 to-transparent"
                  : "from-accent/5 to-transparent"
                  }`}
              />

              {/* Icono */}
              <div
                className={`relative inline-flex p-3 rounded-xl mb-5 ${color === "primary"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent"
                  }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Titulo */}
              <h3 className="relative text-white font-bold text-xl mb-5">
                {title}
              </h3>

              {/* Lista */}
              <ul className="relative space-y-3">
                {topics.map((topic) => (
                  <li
                    key={topic}
                    className="flex items-start gap-3 text-slate-300 text-sm"
                  >
                    <span className="mt-1 w-2 h-2 rounded-full bg-primary" />
                    {topic}
                  </li>
                ))}
              </ul>

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
                Lic. Claudia Ticona Mallea
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
                    alt="Lic. Wilmer Rafael Apaza Mallea"
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

      {/* ── INTERNET HELP MODAL ── */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111115] p-8 shadow-2xl"
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                ¿Problemas de conexión?
              </h3>
            </div>

            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <p>
                si tiene dificultad para mantener una conexión estable a internet o no puedes acceder a la plataforma en forma virtual, no te preocupes!
              </p>
              <p>
                Podemos enviarte el contenido del curso mediante <strong className="text-white">USB</strong>
                por un medio de transporte (flota), para que puedas estudiar sin la necesidad de estar conectado.

              </p>
              <p>
                También puedes consultar cualquier duda que tengas sobre el curso
                o el proceso de inscripción. Estamos para ayudarte.
              </p>
              <div className="pt-2 border-t border-white/10">
                <p className="text-slate-400 text-xs">
                  Contáctanos para más información:
                </p>
                <p className="text-slate-300 text-sm font-medium mt-1">
                  WhatsApp: +591 71539769
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}