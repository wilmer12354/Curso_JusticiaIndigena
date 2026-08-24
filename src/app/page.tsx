"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  Shield,
  BookOpen,
  Scale,
  Users,
  ChevronDown,
  Star,
  Clock,
  Award,
  X,
  HelpCircle,
  WifiOff,
  Globe,
  Package,
  Video,
  Gift
} from "lucide-react";
import { AuthButtons } from "./components/AuthButtons";
import { getAuthCache, setAuthCache, getTrialSession } from "@/lib/auth-cache";
import anime from "animejs";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelp2, setShowHelp2] = useState(false);
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
        const trial = getTrialSession();
        if (trial && trial.id) {
          router.push("/courses");
          return;
        }
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

              <div className="flex flex-col">
                <a
                  href="https://cepabol.noticias.bo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-3xl md:text-4xl font-bold tracking-tight text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  CEPABOL
                </a>

                <span className="text-xs md:text-xl text-slate-100">
                  NIT: 2448391013
                </span>

                <span className="text-xs md:text-xl text-slate-100">
                  Matrícula de Comercio: 00413355
                </span>
              </div>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="fixed top-24 md:top-36 right-5 z-50 flex flex-col items-end gap-2">
                <span className="hidden md:inline text-2xl text-amber-300 font-medium whitespace-nowrap bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg  shadow-lg">
                  ¿Tienes problemas con la conectividad de internet? 👇
                </span>
                <button
                  onClick={() => setShowHelp(true)}
                  className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/40 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/50 active:scale-95 transition-all duration-300 flex items-center justify-center"
                >
                  <WifiOff className="w-8 h-8 text-white drop-shadow-sm" />

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
            <div className="relative max-w-4xl">
              <div className="fixed top-24 md:top-36 left-5 z-50 flex flex-col items-start gap-2">
                <span className="hidden md:inline text-2xl text-amber-300 font-medium whitespace-nowrap bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                  👇¿Lo que obtienes de regalo?
                </span>
                <button
                  onClick={() => setShowHelp2(true)}
                  className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/40 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/50 active:scale-95 transition-all duration-300 flex items-center justify-center"
                >
                  <Gift className="w-8 h-8 text-white drop-shadow-sm" />

                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
                </button>
              </div>

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

            {/* OFERTA */}
            <a
              href="/modalidades/a-distancia"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white font-bold text-lg md:text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95 shadow-[0_0_30px_rgba(249,115,22,0.5)] animate-pulse ring-2 ring-orange-400/50 mb-8 max-w-4xl mx-auto"
            >
              <span className="text-2xl">🔥</span>
              <span>OFERTA HASTA FIN DE MES — 350 Bs</span>
              <span className="text-2xl">🔥</span>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { href: "/modalidades/en-linea", icon: Globe, label: "En Línea", desc: "Prueba gratis y examen en plataforma" },
                { href: "/modalidades/a-distancia", icon: Package, label: "A Distancia", desc: "USB con todo el contenido" },
                { icon: Video, label: "Video Promocional", desc: "Video de presentación del curso", modal: true },
              ].map((item) => {
                if (item.modal) {
                  return (
                    <button
                      key="video-promocional"
                      onClick={() => setShowVideoModal(true)}
                      className="group relative bg-white/10 backdrop-blur-xl border-2 border-orange-500/60 rounded-2xl py-6 px-5 hover:bg-white/15 hover:border-orange-500 transition-all duration-500 hover:-translate-y-1 hover:scale-105 text-center shadow-lg shadow-primary/20 shadow-[0_0_20px_rgba(249,115,22,0.3)] w-full"
                    >
                      <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-primary/10 to-transparent" />
                      <div className="relative inline-flex p-4 rounded-xl mb-4 bg-primary/20 text-orange-400">
                        <Video className="w-8 h-8" />
                      </div>
                      <h3 className="relative text-white font-bold text-xl mb-2">{item.label}</h3>
                      <p className="relative text-slate-300 text-sm font-medium">{item.desc}</p>
                    </button>
                  );
                }
                const { href, icon: Icon, label, desc } = item as { href: string; icon: any; label: string; desc: string };
                return (
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
                );
              })}
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
                "Autoridades originarias, territorialidad, principios  de la democracia comunitaria y su reconstitución",
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
                "Conflicto de competencias jurisdiccionales",
                "Inclusión y dignidad indígena",
                "Historia de las naciones indígenas"
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
                      src="https://www.youtube.com/embed/f4cpkTbtHjo"
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
      <footer className="relative z-10 border-t border-white/10 bg-[#0b0b0f]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

            {/* Logo / Nombre */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>

                <h3 className="text-white font-bold text-lg">
                  Curso de Derecho
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                Formación jurídica especializada para fortalecer tus
                conocimientos y preparación profesional.
              </p>
            </div>

            {/* Información */}
            <div className="text-center">
              <h4 className="text-white font-semibold mb-4">
                Información
              </h4>

              <div className="space-y-2">
                <p className="text-slate-500 text-sm">
                  Acceso de por vida
                </p>

                <p className="text-slate-500 text-sm">
                  Certificado digital
                </p>

                <p className="text-slate-500 text-sm">
                  Material didáctico incluido
                </p>
                <a
                  href="/politica-privacidad"
                  className="text-slate-500 hover:text-white text-sm transition-colors"
                >
                  Política de Privacidad
                </a>
              </div>
            </div>

            {/* Contacto */}
            <div className="text-center md:text-right">
              <h4 className="text-white font-semibold mb-4">
                ¿Necesitas ayuda?
              </h4>

              <a
                href="https://wa.me/59171539769"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition-all"
              >
                <span>💬</span>
                <span className="text-sm font-semibold">
                  WhatsApp
                </span>
              </a>
            </div>

          </div>

          {/* Línea inferior */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">


            <p className="text-slate-600 text-xs">
              Hecho con dedicación para estudiantes que quieran aprender sobre la Justicia Indígena.
            </p>

          </div>

        </div>
      </footer>

      {/* ── INTERNET HELP MODAL ── */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111115] p-6 md:p-8 shadow-2xl"
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-7 pr-8">
              <div className="flex-shrink-0 p-3 rounded-2xl bg-primary/10 text-primary border border-primary/10">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  ¿Tienes problemas de conexión?
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                  Tenemos una alternativa para ti
                </p>
              </div>
            </div>

            {/* Mensaje principal */}
            <div className="space-y-5 text-slate-300 text-sm leading-relaxed">

              <p>
                Si tienes dificultades para mantener una conexión estable a
                Internet o no puedes acceder a la plataforma de forma virtual,
                <strong className="text-white"> no te preocupes.</strong>
              </p>

              {/* Solución USB */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">
                    💾
                  </div>

                  <h4 className="text-white font-bold">
                    También puedes estudiar sin Internet
                  </h4>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed">
                  Podemos enviarte el contenido completo del curso mediante
                  <strong className="text-white"> USB</strong>, utilizando un
                  servicio de transporte (flota), para que puedas estudiar sin
                  necesidad de estar conectado.
                </p>
              </div>

              {/* Soporte */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-xl">
                  💬
                </div>

                <p>
                  Si tienes alguna duda sobre el curso, el proceso de inscripción
                  o la modalidad de estudio, también puedes consultarnos.
                  <strong className="text-white"> Estamos para ayudarte.</strong>
                </p>
              </div>

              {/* Contacto */}
              <div className="pt-5 border-t border-white/10">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">
                  ¿Necesitas más información?
                </p>

                <a
                  href="https://wa.me/59171539769"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-2xl bg-green-500/10 border border-green-500/20 px-4 py-3 hover:bg-green-500/15 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        WhatsApp
                      </p>

                      <p className="text-white font-semibold">
                        +591 71539769
                      </p>
                    </div>
                  </div>

                  <span className="text-green-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    Contactar →
                  </span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-7 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERNET HELP MODAL ── */}
      {showHelp2 && (
        <div
          onClick={() => setShowHelp2(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 md:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111115] p-6 md:p-10 shadow-2xl"
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowHelp2(false)}
              className="absolute top-4 right-4 z-10 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-10 pr-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Lo que obtienes incluido
              </h2>

              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Acceso completo a todos estos recursos desde el primer día.
                Sin costos ocultos.
              </p>
            </div>

            {/* Grid de beneficios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                {
                  icon: "📜",
                  title: "Sentencias Constitucionales",
                  desc: "Acceso a todas las resoluciones judiciales incluidas en el curso",
                },
                {
                  icon: "👨‍🏫",
                  title: "Apoyo Didáctico Incluido",
                  desc: "Tutor especializado disponible para resolver tus dudas",
                },
                {
                  icon: "🎓",
                  title: "Certificado Digital",
                  desc: "Documento oficial reconocido y verificable en línea",
                },
                {
                  icon: "♾️",
                  title: "Acceso de Por Vida",
                  desc: "Estudia sin límite de tiempo + acceso a futuras actualizaciones",
                },
              ].map(({ icon, title, desc }, idx) => (
                <div
                  key={idx}
                  className="hero-card group relative bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 hover:bg-white/8 hover:border-white/15 transition-all duration-500 hover:-translate-y-1 text-center"
                >
                  <div className="text-4xl mb-4">{icon}</div>

                  <h3 className="text-white font-bold text-base mb-2">
                    {title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Badge */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl py-4 px-6 text-center mb-6">
              <p className="text-white font-semibold text-sm md:text-base">
                ✓ Todo esto está incluido en tu suscripción. Comienza hoy.
              </p>
            </div>

            {/* Botón cerrar */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowHelp2(false)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEO PROMOCIONAL MODAL ── */}
      {showVideoModal && (
        <div
          onClick={() => setShowVideoModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl xl:max-w-7xl rounded-2xl border border-white/10 bg-[#111115] p-8 shadow-2xl"
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Video Promocional
              </h3>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <video
                className="w-full h-full"
                src="/video-promocional.mp4"
                controls
                autoPlay
                muted
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}