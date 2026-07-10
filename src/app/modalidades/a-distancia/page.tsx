"use client";

import Link from "next/link";
import { ArrowLeft, Package, Smartphone, Usb, Download } from "lucide-react";

export default function ADistanciaPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-[5%] right-[10%] w-[35%] h-[35%] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[15%] left-[5%] w-[30%] h-[30%] bg-accent/8 rounded-full blur-[120px]" />
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
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500">Modalidad a Distancia</h1>
            <p className="text-slate-400 mt-1">USB con todo el contenido del curso</p>
          </div>
        </div>

        {/* Descripción principal */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 mb-8">
          <p className="text-slate-300 text-xl leading-relaxed">
            Te enviaremos un <strong className="text-orange-500">USB</strong> a través de un medio de transporte
            (flota) con todos los temas del curso incluidos. Podrás estudiar sin necesidad de
            estar conectado a internet.
          </p>
        </div>

        {/* Pasos */}
        <div className="space-y-6 mb-8">
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-start gap-4">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Usb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-orange-500 font-bold text-xl mb-2">1. Recibe el USB</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  El USB llegará a tu domicilio con todo el contenido del curso precargado.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-start gap-4">
              <div className="inline-flex p-3 rounded-xl bg-accent/10 text-accent shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-orange-500 font-bold text-xl mb-2">2. Conecta a tu Celular</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  Conecta el USB a tu celular usando un adaptador OTG (si es necesario).
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-start gap-4">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-orange-500 font-bold text-xl mb-2">3. Instala la App</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  Dentro del USB encontrarás la aplicación{" "}
                  <strong className="text-orange-500">EJIOC.apk</strong>. Instálala en tu celular
                  y podrás acceder a todos los temas del curso.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota final */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-slate-300 text-xl leading-relaxed">
            Esta modalidad es ideal si tienes problemas de conectividad o prefieres estudiar
            sin depender de internet. Todo el contenido estará disponible en tu dispositivo
            en todo momento.
          </p>
        </div>
      </div>
    </div>
  );
}
