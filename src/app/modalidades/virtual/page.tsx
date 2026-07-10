"use client";

import Link from "next/link";
import { ArrowLeft, Monitor, Wifi, Video, Save } from "lucide-react";

export default function VirtualPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-[10%] right-[5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-accent/8 rounded-full blur-[120px]" />
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
            <Monitor className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Modalidad Virtual</h1>
            <p className="text-slate-400 mt-1">Clases en vivo con acceso a internet</p>
          </div>
        </div>

        {/* Requisitos */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-3 mb-6">
            <Wifi className="w-6 h-6 text-primary shrink-0 mt-1" />
            <p className="text-slate-300 text-lg leading-relaxed">
              Necesitarás <strong className="text-white">acceso a internet</strong> para conectarte a las
              sesiones en vivo. Las clases se transmiten en el <strong className="text-white">mismo horario</strong>{" "}
              que la modalidad presencial.
            </p>
          </div>
        </div>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="inline-flex p-3 rounded-xl mb-4 bg-primary/10 text-primary">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Clases en Vivo</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Recibirás un enlace para unirte a la clase en vivo. Podrás hacer preguntas en tiempo real
              y participar como si estuvieras en el aula.
            </p>
          </div>
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="inline-flex p-3 rounded-xl mb-4 bg-accent/10 text-accent">
              <Save className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Clases Grabadas</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Todas las sesiones quedan <strong className="text-white">grabadas</strong> para que puedas
              repasarlas cuando lo necesites. No pierdas ningún detalle.
            </p>
          </div>
        </div>

        {/* Nota importante */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-slate-300 text-lg leading-relaxed">
            El horario es el mismo que el de la modalidad presencial. Solo necesitas un dispositivo
            con internet y el enlace de acceso que te proporcionaremos.
          </p>
        </div>
      </div>
    </div>
  );
}
