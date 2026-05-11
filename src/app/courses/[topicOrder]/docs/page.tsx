"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { LogoutButton } from "@/app/components/LogoutButton";

export default function TopicDocsPage() {
  const params = useParams<{ topicOrder: string }>();
  
  // Asumimos que los PDFs están guardados como "tema-1.pdf", "tema-2.pdf" en la carpeta public/docs
  const pdfUrl = `/docs/tema-${params.topicOrder}.pdf`;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-primary w-8 h-8" />
            <span className="font-bold text-xl">Documentación - Tema {params.topicOrder}</span>
          </div>

          <div className="flex items-center gap-6">
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="container min-h-screen py-10">
        <div className="flex items-center justify-between mb-8">
          <Link href={`/courses/${params.topicOrder}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Volver al tema
          </Link>
          
          <a 
            href={pdfUrl} 
            download={`tema-${params.topicOrder}.pdf`} 
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </a>
        </div>

        <section className="glass-card flex flex-col items-center justify-center p-2">
          <iframe 
            src={pdfUrl} 
            className="w-full h-[75vh] rounded-lg border-0 bg-white"
            title={`Documentación del Tema ${params.topicOrder}`}
          />
          <p className="mt-4 text-sm text-slate-400">
            Si no puedes visualizar el documento, intenta usar el botón de descarga en la parte superior.
          </p>
        </section>
      </main>
    </div>
  );
}
