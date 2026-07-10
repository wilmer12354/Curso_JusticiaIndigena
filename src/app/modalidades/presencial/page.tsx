"use client";

import Link from "next/link";
import { ArrowLeft, Building2, MapPin } from "lucide-react";

export default function PresencialPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-accent/8 rounded-full blur-[120px]" />
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
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500">Modalidad Presencial</h1>
            <p className="text-slate-400 mt-1">Clases en el Edificio Rojas</p>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 mb-10">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
            <p className="text-slate-300 text-xl leading-relaxed">
              Las clases se llevarán a cabo en el <strong className="text-orange-500">Edificio Rojas N°12</strong>,
              entre la <strong className="text-orange-500">calle 1 y 2, 3er piso</strong>.
            </p>
          </div>
          <p className="text-slate-400 ml-9 text-lg">
            Aquí podrás asistir personalmente a las sesiones y participar en tiempo real con el instructor.
          </p>
        </div>

        {/* Imágenes de referencia */}
        <h2 className="text-2xl font-semibold text-orange-500 mb-6">Ubicación de referencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <img src="/ubi1.jpg" alt="Vista del Edificio Rojas" className="w-full" />
            <div className="p-4">
              <p className="text-slate-400 text-base text-center">Vista del Edificio Rojas — Calle 1 y 2</p>
            </div>
          </div>
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <img src="/ubi2.jpg" alt="Ingreso al Edificio Rojas" className="w-full" />
            <div className="p-4">
              <p className="text-slate-400 text-base text-center">Ingreso al Edificio Rojas — 3er Piso</p>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-semibold text-orange-500 mb-4">¿Cómo llegar?</h3>
          <p className="text-slate-400 text-lg mb-6">
            Haz clic en el botón de abajo para abrir Google Maps y obtener indicaciones precisas.
          </p>
          <a
            href="https://maps.app.goo.gl/45BXYYaf3Am1Ye5E8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 text-white font-bold text-lg transition-all duration-300 scale-110 shadow-[0_0_40px_rgba(194,65,12,0.5)] animate-pulse ring-2 ring-orange-400/50"
          >
            <MapPin className="w-5 h-5" />
            Abrir en Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
