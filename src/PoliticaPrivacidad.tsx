import {
  Shield,
  ArrowLeft,
  Mail,
  MessageCircle,
  Check,
  Lock,
  FileText,
} from "lucide-react";

export default function PoliticaPrivacidad() {
  const sections = [
    {
      number: "01",
      title: "Información general",
      content: (
        <>
          <p>
            La presente Política de Privacidad establece la forma en que
            nuestra plataforma recopila, utiliza, almacena y protege la
            información proporcionada por los usuarios que acceden a nuestros
            cursos y servicios educativos.
          </p>

          <p className="mt-4">
            Al utilizar nuestra plataforma, el usuario acepta las prácticas
            descritas en esta Política de Privacidad.
          </p>
        </>
      ),
    },
    {
      number: "02",
      title: "Información que recopilamos",
      content: (
        <>
          <p className="mb-5">
            Podemos recopilar información necesaria para proporcionar nuestros
            servicios, incluyendo:
          </p>

          <ul className="space-y-3">
            {[
              "Nombre y apellido.",
              "Número de teléfono o WhatsApp.",
              "Dirección de correo electrónico.",
              "Información relacionada con la inscripción al curso.",
              "Información necesaria para procesar pagos.",
              "Información relacionada con el uso de la plataforma.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </span>

                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      number: "03",
      title: "Uso de la información",
      content: (
        <>
          <p className="mb-5">
            La información proporcionada por el usuario puede utilizarse para
            las siguientes finalidades:
          </p>

          <ul className="space-y-3">
            {[
              "Gestionar la inscripción a los cursos.",
              "Proporcionar acceso al contenido adquirido.",
              "Emitir certificados cuando corresponda.",
              "Brindar soporte y atención al usuario.",
              "Informar sobre actualizaciones importantes del curso.",
              "Procesar y verificar pagos.",
              "Mejorar el funcionamiento de la plataforma.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </span>

                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      number: "04",
      title: "Protección de la información",
      content: (
        <>
          <p>
            Adoptamos medidas razonables de seguridad para proteger la
            información de nuestros usuarios frente a accesos no autorizados,
            pérdida, modificación o divulgación indebida.
          </p>

          <p className="mt-4">
            Sin embargo, ningún sistema de almacenamiento o transmisión de
            información por Internet puede garantizar una seguridad absoluta.
          </p>
        </>
      ),
    },
    {
      number: "05",
      title: "Confidencialidad",
      content: (
        <p>
          No vendemos ni comercializamos los datos personales de nuestros
          usuarios. La información será utilizada únicamente para las
          finalidades relacionadas con la prestación de nuestros servicios,
          salvo cuando exista una obligación legal de proporcionar determinada
          información.
        </p>
      ),
    },
    {
      number: "06",
      title: "Servicios de terceros",
      content: (
        <>
          <p>
            Nuestra plataforma puede utilizar servicios externos para
            determinadas funciones, como procesamiento de pagos,
            comunicaciones, almacenamiento o análisis técnico.
          </p>

          <p className="mt-4">
            Estos servicios pueden manejar determinada información de acuerdo
            con sus propias políticas de privacidad y términos de servicio.
          </p>
        </>
      ),
    },
    {
      number: "07",
      title: "Comunicaciones",
      content: (
        <p>
          Podemos comunicarnos con el usuario mediante correo electrónico,
          WhatsApp u otros medios proporcionados durante el proceso de
          inscripción, principalmente para asuntos relacionados con el curso,
          pagos, soporte, acceso y actualizaciones importantes.
        </p>
      ),
    },
    {
      number: "08",
      title: "Derechos del usuario",
      content: (
        <>
          <p>
            El usuario puede solicitar información sobre los datos personales
            que mantenemos, así como solicitar su corrección o actualización
            cuando corresponda.
          </p>

          <p className="mt-4">
            Para realizar una solicitud relacionada con sus datos personales,
            puede ponerse en contacto con nosotros mediante los canales
            indicados al final de esta página.
          </p>
        </>
      ),
    },
    {
      number: "09",
      title: "Cookies y tecnologías similares",
      content: (
        <p>
          Nuestra plataforma puede utilizar cookies y tecnologías similares
          para mantener sesiones, mejorar la experiencia del usuario,
          recordar determinadas preferencias y obtener información técnica
          sobre el funcionamiento del sitio.
        </p>
      ),
    },
    {
      number: "10",
      title: "Cambios en esta Política de Privacidad",
      content: (
        <p>
          Nos reservamos el derecho de actualizar esta Política de Privacidad
          cuando sea necesario. Cuando se realicen cambios relevantes, se
          actualizará la fecha de modificación indicada al inicio del
          documento.
        </p>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#08080c] text-slate-300 overflow-hidden">

      {/* ═══════════════════════════════════════════
          BACKGROUND
      ═══════════════════════════════════════════ */}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[140px] rounded-full" />

        <div className="absolute top-[700px] -left-40 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />

        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-primary/5 blur-[140px] rounded-full" />
      </div>

      {/* ═══════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════ */}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08080c]/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          <a
            href="/"
            className="group inline-flex items-center gap-2.5 text-slate-400 hover:text-white transition-all"
          >
            <span className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.07] transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </span>

            <span className="text-sm font-medium">
              Volver al inicio
            </span>
          </a>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5" />
            Información protegida
          </div>

        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MAIN
      ═══════════════════════════════════════════ */}

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-20">

        {/* HERO */}

        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6">
            <Shield className="w-4 h-4" />
            PRIVACIDAD Y SEGURIDAD
          </div>

          <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
            <Shield className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5">
            Política de{" "}
            <span className="text-primary">
              Privacidad
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Queremos que tengas claridad sobre cómo protegemos, utilizamos y
            tratamos la información que compartes con nuestra plataforma.
          </p>

        </div>

        {/* DOCUMENTO */}

        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl shadow-2xl overflow-hidden">

          {/* Línea superior */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="p-6 md:p-10 lg:p-14">

            {/* Introducción */}

            <div className="flex items-start gap-4 pb-10 mb-10 border-b border-white/[0.08]">

              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h2 className="text-white font-bold text-lg mb-2">
                  Sobre este documento
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed">
                  Esta política describe nuestras prácticas respecto al
                  tratamiento de la información de los usuarios de la
                  plataforma y nuestros servicios educativos.
                </p>
              </div>

            </div>

            {/* SECCIONES */}

            <div className="space-y-12">

              {sections.map((section) => (
                <section
                  key={section.number}
                  className="group"
                >
                  <div className="flex gap-5">

                    {/* Número */}

                    <div className="hidden sm:flex flex-shrink-0 w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {section.number}
                      </span>
                    </div>

                    {/* Contenido */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-3 mb-4">

                        <div className="sm:hidden flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">
                            {section.number}
                          </span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors">
                          {section.title}
                        </h2>

                      </div>

                      <div className="text-slate-400 text-sm md:text-[15px] leading-7">
                        {section.content}
                      </div>

                    </div>

                  </div>
                </section>
              ))}

              {/* ═════════════════════════════════════
                  CONTACTO
              ═════════════════════════════════════ */}

              <section className="pt-4">

                <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] to-transparent p-6 md:p-8">

                  <div className="flex items-start gap-4 mb-6">

                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary">
                          11
                        </span>

                        <h2 className="text-xl md:text-2xl font-bold text-white">
                          Contacto
                        </h2>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed">
                        Si tienes preguntas o solicitudes relacionadas con
                        esta Política de Privacidad, puedes contactarnos.
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* WhatsApp */}

                    <a
                      href="https://wa.me/59171539769"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-green-500/20 bg-green-500/5 p-4 hover:bg-green-500/10 hover:border-green-500/30 transition-all"
                    >

                      <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-green-400" />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          WhatsApp
                        </p>

                        <p className="text-white font-semibold">
                          +591 71539769
                        </p>
                      </div>

                    </a>

                    {/* Email */}

                    <a
                      href="mailto:cepabol@gmail.com"
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/15 transition-all"
                    >

                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Correo electrónico
                        </p>

                        <p className="text-white font-semibold break-all">
                          cepabol@gmail.com
                        </p>
                      </div>

                    </a>

                  </div>

                </div>

              </section>

            </div>

          </div>
        </div>

        {/* Nota inferior */}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">

          <Shield className="w-4 h-4 text-slate-600" />

          <p className="text-xs text-slate-600">
            Tu privacidad y seguridad son importantes para nosotros.
          </p>

        </div>

      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}

      <footer className="relative z-10 border-t border-white/[0.08] bg-[#060609]">

        <div className="max-w-6xl mx-auto px-6 py-8">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <p className="text-xs text-slate-600 text-center md:text-left">
              © {new Date().getFullYear()} Curso de Derecho.
              Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Lock className="w-3.5 h-3.5" />
              Política de Privacidad
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}