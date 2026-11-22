import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { OFFICIAL_CATALOG } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Globe,
  Server,
  Cpu,
  ShieldCheck,
  Zap,
  Code2,
  Terminal,
  Clock,
  Layers,
  ChevronDown,
  CheckCircle2,
  Lock,
  Headphones,
  Check,
} from "lucide-react";

export default function HomePage() {
  const featuredProducts = OFFICIAL_CATALOG.filter((p) => p.isFeatured && p.isAvailable);

  const competitiveAdvantages = [
    {
      icon: Code2,
      title: "Código Propio & Modular",
      description:
        "No utilizamos plantillas prefabricadas ni bots genéricos de código abierto sin soporte. Cada solución se programa con estándares limpios en TypeScript y Next.js.",
    },
    {
      icon: ShieldCheck,
      title: "Seguridad y Cumplimiento",
      description:
        "Validación exhaustiva de datos, sesiones cifradas, protección contra inyecciones y pleno respeto a las políticas para desarrolladores de Discord y la normativa RGPD.",
    },
    {
      icon: Zap,
      title: "Rendimiento y Baja Latencia",
      description:
        "Infraestructura alojada en centros de datos europeos de alta conectividad con monitorización continua, garantizando respuestas rápidas y tiempos de carga óptimos.",
    },
    {
      icon: Terminal,
      title: "Panel Avenix Control Unificado",
      description:
        "Un único ecosistema privado para gestionar el ciclo de vida de tus productos, consultar logs, estados de servicios, pedidos, facturas y tickets de soporte.",
    },
    {
      icon: Clock,
      title: "Despliegues y Entregas Transparentes",
      description:
        "Presupuestos claros y cerrados sin cargos ocultos. Seguimiento etapa por etapa del avance del desarrollo desde tu panel de cliente.",
    },
    {
      icon: Headphones,
      title: "Soporte Técnico Especializado",
      description:
        "Atención técnica directa por parte de los mismos desarrolladores de tu software, garantizando resolución rápida ante cualquier incidencia.",
    },
  ];

  const contractingSteps = [
    {
      step: "01",
      title: "Definición y Presupuesto",
      description:
        "Nos cuentas los requerimientos de tu proyecto o seleccionas uno de nuestros planes. Evaluamos la viabilidad y emitimos un presupuesto cerrado y detallado.",
    },
    {
      step: "02",
      title: "Desarrollo y Pruebas",
      description:
        "Iniciamos el desarrollo en entornos de pruebas aislados. Puedes seguir el estado y progreso en tiempo real desde Avenix Control.",
    },
    {
      step: "03",
      title: "Revisión y Aprobación",
      description:
        "Te presentamos la solución en un entorno de staging para que verifiques todas las funciones y comandos acordados antes del lanzamiento definitivo.",
    },
    {
      step: "04",
      title: "Despliegue y Mantenimiento",
      description:
        "Publicamos la web o conectamos el bot a tu servidor. Te entregamos acceso a la consola, métricas y soporte continuo con actualizaciones incluidas.",
    },
  ];

  const faqs = [
    {
      question: "¿Qué tecnologías utilizáis para desarrollar los bots de Discord?",
      answer:
        "Utilizamos Node.js y TypeScript con las últimas versiones oficiales de Discord.js y la API REST v10 de Discord. Empleamos PostgreSQL o Redis para el almacenamiento de datos, asegurando que tu bot responda en milisegundos y pueda escalar a miles de servidores.",
    },
    {
      question: "¿Los precios mostrados en la web incluyen IVA?",
      answer:
        "Sí, todos nuestros precios se indican de forma transparente con el 21% de IVA español incluido, para que no encuentres cargos imprevistos en el checkout o en tus presupuestos.",
    },
    {
      question: "¿Puedo solicitar funciones personalizadas que no estén en los paquetes estándar?",
      answer:
        "Totalmente. El núcleo de Avenix Development es el software a medida. A través de nuestro configurador de presupuesto puedes detallar cualquier integración, comando o flujo específico que requiera tu negocio o comunidad.",
    },
    {
      question: "¿Dónde se alojan los bots y qué ocurre si hay un fallo?",
      answer:
        "Nuestros servidores dedicados están ubicados en centros de datos europeos (Alemania y España). Disponemos de sistemas de orquestación que reinician automáticamente cualquier proceso en caso de caída imprevista y registran los eventos en logs accesibles desde tu panel.",
    },
    {
      question: "¿Qué métodos de pago aceptáis y cómo se gestiona la facturación?",
      answer:
        "Procesamos los pagos mediante Stripe con soporte para tarjeta de crédito/débito, Apple Pay y Google Pay con cifrado TLS bancario. Cada pago genera automáticamente una factura oficial emitida con numeración correlativa disponible para su descarga en PDF desde Avenix Control.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-tech-grid">
        {/* Glow ambient gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-400/10 blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Avenix Development — Build beyond limits</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] font-display">
            Transformamos tus ideas en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-300">
              soluciones digitales
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Plataforma tecnológica especializada en desarrollo de bots de Discord de alto rendimiento, 
            webs corporativas a medida, automatizaciones avanzadas e infraestructura cloud gestionada.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/servicios"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Explorar servicios</span>
              <ArrowRight className="w-4 h-4 text-blue-200" />
            </Link>

            <Link
              href="/presupuesto"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Solicitar presupuesto</span>
            </Link>
          </div>

          {/* Trust points bar */}
          <div className="mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Código 100% propio</p>
                <p className="text-xs text-slate-400">Sin plantillas genéricas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pagos Verificados</p>
                <p className="text-xs text-slate-400">Checkout Stripe con IVA</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Cloud Europeo</p>
                <p className="text-xs text-slate-400">Alta disponibilidad 99.9%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Avenix Control</p>
                <p className="text-xs text-slate-400">Gestión de bots y logs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS PRINCIPALES */}
      <section className="py-24 bg-[#0d1627] relative border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Nuestras Especialidades
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              Ingeniería de software adaptada a tus objetivos
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Diseñamos, programamos e implementamos soluciones digitales con un estándar estricto de calidad, estabilidad y seguridad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Servicio 1: Bots de Discord */}
            <div className="group glass-panel rounded-2xl p-7 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 bg-[#111827]/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">
                  Bots de Discord
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Sistemas personalizados con comandos slash, modales, verificación segura, tickets, economía y roles automatizados.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Desde 79 € (Tarifa Básica)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Base de datos PostgreSQL propia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Panel web Avenix Control</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/servicios#discord-bots"
                className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5 pt-4 border-t border-slate-800/80"
              >
                <span>Ver detalles y tarifas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Servicio 2: Desarrollo Web */}
            <div className="group glass-panel rounded-2xl p-7 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 bg-[#111827]/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">
                  Desarrollo Web & Apps
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Webs corporativas, plataformas SaaS y tiendas online ultrarrápidas con Next.js, optimización SEO y diseño responsive exclusivo.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Desde 249 € (Web Corporativa)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Arquitectura Next.js & TypeScript</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Panel administrativo a medida</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/servicios#desarrollo-web"
                className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5 pt-4 border-t border-slate-800/80"
              >
                <span>Ver detalles y tarifas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Servicio 3: Hosting y Cloud */}
            <div className="group glass-panel rounded-2xl p-7 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 bg-[#111827]/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">
                  Hosting & Cloud
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Alojamiento gestionado y optimizado específicamente para bots y servidores de aplicaciones en centros de datos europeos con Anti-DDoS.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Hosting de bots desde 5,99 €/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Reinicio automático y logs en vivo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Copias de seguridad diarias</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/servicios#hosting-cloud"
                className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5 pt-4 border-t border-slate-800/80"
              >
                <span>Ver planes cloud</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Servicio 4: Automatizaciones */}
            <div className="group glass-panel rounded-2xl p-7 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 bg-[#111827]/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">
                  Automatizaciones & APIs
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Integraciones bidireccionales entre Discord, Stripe, plataformas de comercio y bases de datos para automatizar tus procesos de negocio.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Gestión automática de roles y pagos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Webhooks sincronizados al instante</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Alertas y auditoría en tiempo real</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/servicios#automatizaciones"
                className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5 pt-4 border-t border-slate-800/80"
              >
                <span>Explorar integraciones</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VENTAJAS COMPETITIVAS */}
      <section className="py-24 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Por Qué Elegirnos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              Un enfoque profesional orientado al resultado técnico
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Aportamos seriedad, código mantenible y soporte continuado para que tu comunidad o empresa opere con total tranquilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competitiveAdvantages.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#111827]/60 border border-slate-800/80 hover:border-slate-700 transition-all hover:bg-[#111827]"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-display">
                    {adv.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESO DE CONTRATACIÓN */}
      <section className="py-24 bg-[#0e172a] border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Metodología de Trabajo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              ¿Cómo trabajamos tu proyecto?
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Un flujo transparente en cuatro etapas para que tengas el control absoluto en todo momento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contractingSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-extrabold text-blue-500/30 font-display mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-display">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/presupuesto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Comenzar etapa 1: Solicitar presupuesto</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCTOS & PRECIOS DESTACADOS */}
      <section className="py-24 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Tarifas & Catálogo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              Precios claros, sin letra pequeña
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Todos los importes incluyen el 21% de IVA correspondiente y soporte técnico garantizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Destacado 1: Bot de Discord Avanzado */}
            <div className="relative p-8 rounded-2xl bg-[#111827] border-2 border-blue-500/50 shadow-xl shadow-blue-500/10 flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Más Solicitado
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Bot de Discord
                </p>
                <h3 className="text-2xl font-bold text-white mt-1 font-display">
                  Desarrollo Avanzado
                </h3>
                <div className="mt-4 mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-display">
                    199,00 €
                  </span>
                  <span className="text-xs text-slate-400">pago único (IVA inc.)</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Para comunidades que necesitan un bot completo con múltiples módulos, base de datos y comandos complejos.
                </p>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Hasta 15 comandos interactivos o modales</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Sistema de tickets con transcripciones</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Conexión a base de datos PostgreSQL</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>1 mes de hosting en Avenix Cloud incluido</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/presupuesto?servicio=bot_avanzado"
                className="w-full text-center py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md shadow-blue-500/20"
              >
                Solicitar este bot
              </Link>
            </div>

            {/* Destacado 2: Web Corporativa */}
            <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Desarrollo Web
                </p>
                <h3 className="text-2xl font-bold text-white mt-1 font-display">
                  Web Corporativa
                </h3>
                <div className="mt-4 mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-display">
                    249,00 €
                  </span>
                  <span className="text-xs text-slate-400">desde (IVA inc.)</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Página web moderna, optimizada para buscadores, responsive y con diseño adaptado a tu marca corporativa.
                </p>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Hasta 5 secciones completas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Next.js App Router & Tailwind CSS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>SEO técnico y formulario de contacto</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Certificado SSL y hosting de alta velocidad</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/presupuesto?servicio=web_corporativa"
                className="w-full text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all"
              >
                Solicitar web corporativa
              </Link>
            </div>

            {/* Destacado 3: Avenix Bot Pro Suscripción */}
            <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Suscripción Mensual
                </p>
                <h3 className="text-2xl font-bold text-white mt-1 font-display">
                  Avenix Bot Pro
                </h3>
                <div className="mt-4 mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-display">
                    9,99 €
                  </span>
                  <span className="text-xs text-slate-400">/ mes (IVA inc.)</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Bot listo para operar de inmediato en tu servidor con módulos profesionales de moderación, logs y soporte.
                </p>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Uptime 99.9% en servidor dedicado</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Panel Avenix Control con métricas y logs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Sin límite de miembros en tu servidor</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Cancelación en cualquier momento</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/precios"
                className="w-full text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all"
              >
                Ver todos los planes
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/precios"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>Consultar catálogo completo de tarifas y suscripciones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROYECTOS REALIZADOS (POLÍTICA ESTRICTA: Solo mostramos proyectos reales expresamente autorizados) */}
      <section className="py-20 bg-[#0d1627] border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12 rounded-3xl bg-[#111827] border border-slate-800 text-center max-w-4xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 font-display">
              Transparencia en nuestro Portfolio
            </h3>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed mb-6">
              En Avenix Development respetamos estrictamente los acuerdos de confidencialidad (NDA) de nuestros clientes. 
              No publicamos proyectos sin la debida autorización expresa del propietario. 
              Puedes consultar los proyectos públicos disponibles en nuestro portfolio oficial.
            </p>
            <Link
              href="/proyectos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 transition-all"
            >
              <span>Acceder al Portfolio Autorizado</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (FAQ) */}
      <section className="py-24 bg-[#0B1220]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Dudas Comunes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              Preguntas Frecuentes
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Resolvemos las consultas técnicas y comerciales más habituales.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl bg-[#111827] border border-slate-800/80 p-6 [&_summary::-webkit-details-marker]:hidden transition-all duration-200 open:border-blue-500/40"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-white font-semibold text-base sm:text-lg">
                  <span>{faq.question}</span>
                  <span className="ml-4 p-1 rounded-lg bg-slate-800 text-slate-400 group-open:rotate-180 group-open:text-blue-400 transition-transform">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </summary>
                <p className="mt-4 text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* LLAMADA FINAL A LA ACCIÓN (CTA) */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#0B1220] to-[#080d17] border-t border-slate-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            ¿Listo para llevar tu proyecto al siguiente nivel?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Hablemos hoy de tus necesidades y diseñemos la solución ideal para tu comunidad o empresa.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/presupuesto"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Solicitar presupuesto sin compromiso</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Contactar con un desarrollador</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
