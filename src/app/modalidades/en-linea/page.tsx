"use client";

import Link from "next/link";
import { ArrowLeft, Globe, FileCheck, FileText, ClipboardCheck } from "lucide-react";

export default function EnLineaPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-[15%] left-[10%] w-[35%] h-[35%] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[25%] h-[25%] bg-accent/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500">Modalidad En Línea</h1>
            <p className="text-slate-400 mt-1">Prueba gratis y examen en la plataforma</p>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 mb-8">
          <p className="text-slate-300 text-xl leading-relaxed">
            En esta modalidad puedes realizar todo el curso directamente desde nuestra plataforma.
            No necesitas asistir a ninguna clase presencial ni virtual programada.
          </p>
        </div>

        {/* Paso a paso */}
        <div className="space-y-6 mb-8">
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-start gap-4">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-orange-500 font-bold text-xl mb-2">Prueba Gratis</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  Accede a una prueba gratuita del contenido para que conozcas la plataforma y
                  el material del curso sin compromiso.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-start gap-4">
              <div className="inline-flex p-3 rounded-xl bg-accent/10 text-accent shrink-0">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-orange-500 font-bold text-xl mb-2">Rinde tu Examen</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  Al finalizar los temas, podrás rendir tu examen directamente en la plataforma
                  para evaluar tus conocimientos.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-start gap-4">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-orange-500 font-bold text-xl mb-2">Inscríbete</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  Puedes inscribirte <strong className="text-orange-500">directamente</strong> desde el inicio
                  o esperar a terminar la prueba gratis para decidirte.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-slate-300 text-xl mb-6">
            ¿Listo para empezar? Regístrate y comienza tu prueba gratis ahora.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 text-white font-bold text-lg transition-all duration-300 scale-110 shadow-[0_0_40px_rgba(194,65,12,0.5)] animate-pulse ring-2 ring-orange-400/50"
          >
            Inscribirme ahora
          </Link>
        </div>
      </div>
    </div>
  );
}
