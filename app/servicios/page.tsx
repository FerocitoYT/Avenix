import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Bot,
  Globe,
  Server,
  Cpu,
  Check,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Zap,
  Layers,
  Code,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "Servicios Tecnológicos Especializados",
  description:
    "Bots de Discord a medida, desarrollo web y aplicaciones Next.js, hosting cloud europeo y automatizaciones con APIs.",
};

export default function ServicesPage() {
  const serviceCategories = [
    {
      id: "discord-bots",
      title: "Desarrollo de Bots de Discord",
      subtitle: "Arquitectura moderna con TypeScript, Discord.js v14 y bases de datos dedicadas.",
      icon: Bot,
      priceFrom: "79,00 €",
      description:
        "Creamos soluciones completas para servidores y marcas que necesitan automatizar su comunidad, monetizar con roles o brindar herramientas interactivas a sus usuarios.",
      features: [
        "Comandos Slash (/) con autocompletado y validación de permisos en servidor",
        "Modales emergentes, menús desplegables y botones con retroalimentación instantánea",
        "Sistema de tickets privado con transcript HTML descargable",
        "Integración de pagos con asignación automática de rangos mediante Stripe/PayPal",
        "Conexión con bases de datos PostgreSQL o Redis para persistencia inquebrantable",
        "Panel web de administración opcional conectado a Avenix Control",
      ],
      deliverables: [
        "Código fuente completo y documentado",
        "Despliegue inicial y configuración en servidores",
        "Garantía de corrección de bugs de 60 días",
        "Guía de administración para moderadores",
      ],
      faqs: [
        {
          q: "¿Puedo alojar el bot en mis propios servidores?",
          a: "Sí. Te entregamos el código listo con variables de entorno y soporte para Docker. Si lo prefieres, también podemos alojarlo en nuestros servidores dedicados con Avenix Cloud.",
        },
        {
          q: "¿Qué sucede si Discord actualiza su API?",
          a: "Nuestros bots están diseñados con arquitectura modular. Las suscripciones activas y los planes de mantenimiento incluyen adaptaciones a los cambios que Discord introduzca.",
        },
      ],
      ctaLink: "/presupuesto?servicio=discord_bot",
      ctaText: "Pedir presupuesto para Bot",
    },
    {
      id: "desarrollo-web",
      title: "Desarrollo Web & Aplicaciones",
      subtitle: "Next.js App Router, TypeScript, Tailwind CSS y bases de datos PostgreSQL.",
      icon: Globe,
      priceFrom: "249,00 €",
      description:
        "Desarrollamos páginas corporativas, plataformas SaaS y paneles de administración de alto rendimiento. Ponemos el foco en la velocidad, el SEO técnico y una experiencia de usuario memorable.",
      features: [
        "Arquitectura Next.js moderna con Server Components para máxima velocidad",
        "Diseño a medida, fluido y 100% responsive para teléfonos, tablets y monitores",
        "Optimización de Core Web Vitals y metadatos SEO para indexación en Google",
        "Seguridad con cookies HTTP-only, protección CSRF y rate limiting",
        "Integración de pasarelas de pago (Stripe, PayPal, Bizum) con confirmación segura",
        "Paneles administrativos a medida para gestionar clientes, pedidos o contenidos",
      ],
      deliverables: [
        "Página web completa en producción",
        "Certificado SSL gratuito y CDN global",
        "Cumplimiento normativo RGPD y aviso de cookies",
        "Formación de uso para tu equipo",
      ],
      faqs: [
        {
          q: "¿Tendré control sobre los contenidos de mi página web?",
          a: "Por supuesto. Incluimos paneles de control sencillos e intuitivos para que puedas modificar textos, precios, productos o proyectos sin tocar una línea de código.",
        },
        {
          q: "¿Cuánto tiempo toma el desarrollo de una web corporativa?",
          a: "Una web corporativa estándar suele estar lista entre 5 y 10 días laborables, dependiendo de la agilidad en la entrega de textos e imágenes.",
        },
      ],
      ctaLink: "/presupuesto?servicio=desarrollo_web",
      ctaText: "Pedir presupuesto Web",
    },
    {
      id: "hosting-cloud",
      title: "Hosting & Cloud Dedicado",
      subtitle: "Alojamiento europeo de alta disponibilidad optimizado para bots y aplicaciones.",
      icon: Server,
      priceFrom: "5,99 €/mes",
      description:
        "Infraestructura cloud con aislamiento por contenedor, monitorización constante y protección Anti-DDoS de grado empresarial para que tus bots y webs nunca se queden fuera de servicio.",
      features: [
        "Aislamiento total mediante contenedores Docker dedicados",
        "Monitorización activa de uso de memoria RAM, CPU y ping",
        "Consola de logs en tiempo real accesible desde Avenix Control",
        "Reinicio automático inmediato en caso de interrupción del proceso",
        "Copias de seguridad diarias automatizadas en nodos secundarios",
        "Protección contra ataques volumétricos L4 y L7",
      ],
      deliverables: [
        "Acceso directo a Avenix Control para reiniciar o apagar tus instancias",
        "SLA de disponibilidad del 99.9%",
        "Soporte técnico prioritario en caso de incidencias",
      ],
      faqs: [
        {
          q: "¿Dónde están situados los servidores de Avenix?",
          a: "Nuestros nodos residen en centros de datos Tier III en Frankfurt (Alemania) y Madrid (España), garantizando la latencia más baja posible para Europa y España.",
        },
        {
          q: "¿Hay permanencia en las suscripciones de hosting?",
          a: "No. Puedes cancelar tu suscripción en cualquier momento desde tu panel de facturación de Stripe sin penalizaciones.",
        },
      ],
      ctaLink: "/precios#hosting",
      ctaText: "Ver planes de Hosting",
    },
    {
      id: "automatizaciones",
      title: "Automatizaciones & APIs",
      subtitle: "Conexión integral entre plataformas, pasarelas de pago y servicios de mensajería.",
      icon: Cpu,
      priceFrom: "149,00 €",
      description:
        "Elimina las gestiones repetitivas. Diseñamos automatizaciones que enlazan tus ventas con la asignación de permisos, alertas inmediatas, sincronización de hojas de cálculo y bases de datos.",
      features: [
        "Procesamiento y validación criptográfica de Webhooks de pago",
        "Gestión de roles y suscripciones en servidores de Discord en tiempo real",
        "Integraciones con Notion, Google Sheets, Airtable, Telegram y CRMs",
        "Envío de notificaciones automáticas transaccionales por email",
        "Scripts de sincronización programada con control de excepciones y reintentos",
        "Registro de auditoría exhaustivo para rastrear cada operación realizada",
      ],
      deliverables: [
        "Flujos de automatización desplegados y probados",
        "Documentación técnica de endpoints y esquemas de datos",
        "Monitorización de alertas ante fallos de conexión",
      ],
      faqs: [
        {
          q: "¿Qué sucede si una API de terceros falla temporalmente?",
          a: "Nuestros scripts implementan colas de reintento automático y alertas que nos notifican de inmediato para que ninguna orden o evento se pierda.",
        },
        {
          q: "¿Podemos conectar un sistema existente que ya esté en producción?",
          a: "Sí. Analizamos tu arquitectura actual y creamos capas de conexión sin interrumpir tu operativa diaria.",
        },
      ],
      ctaLink: "/presupuesto?servicio=automatizaciones",
      ctaText: "Solicitar Automatización",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-tech-grid relative border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Catálogo de Servicios
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mt-4 font-display">
            Servicios Tecnológicos Avenix
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Soluciones integrales de software desarrolladas bajo especificaciones técnicas exigentes. 
            Elige la categoría que mejor se adapte a tu necesidad.
          </p>

          {/* Quick jump navigation */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {serviceCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/40 transition-all flex items-center gap-2"
              >
                <cat.icon className="w-3.5 h-3.5 text-blue-400" />
                <span>{cat.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
        {serviceCategories.map((service, index) => {
          const Icon = service.icon;
          return (
            <section
              key={service.id}
              id={service.id}
              className="scroll-mt-28 p-8 md:p-12 rounded-3xl bg-[#111827] border border-slate-800 relative overflow-hidden"
            >
              {/* Top gradient stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Info & Pricing */}
                <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      {service.title}
                    </h2>
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-1">
                      {service.subtitle}
                    </p>
                    <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-6 p-4 rounded-xl bg-[#0B1220] border border-slate-800">
                      <span className="text-xs text-slate-400 block">Tarifa orientativa:</span>
                      <span className="text-2xl font-extrabold text-white font-display">
                        {service.priceFrom}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        IVA del 21% incluido
                      </span>
                    </div>
                  </div>

                  <div>
                    <Link
                      href={service.ctaLink}
                      className="w-full text-center py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <span>{service.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Right: Features, Deliverables, FAQs */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Features */}
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-display">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span>Funcionalidades Principales</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-3.5 rounded-xl bg-[#0B1220]/70 border border-slate-800/80 flex items-start gap-3"
                        >
                          <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-display">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>Qué incluye la entrega</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.deliverables.map((item, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center gap-2.5 text-xs text-slate-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini FAQs */}
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 font-display">
                      Preguntas sobre este servicio
                    </h3>
                    <div className="space-y-3">
                      {service.faqs.map((faq, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-4 rounded-xl bg-[#0B1220] border border-slate-800/80"
                        >
                          <p className="text-xs font-semibold text-white mb-1">
                            {faq.q}
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
