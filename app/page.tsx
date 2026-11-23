"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
  Clock,
  Layers,
  ChevronDown,
  CheckCircle2,
  Lock,
  Headphones,
  Check,
  Server,
  Activity,
  Cpu,
  Ticket,
  Sliders,
  DollarSign,
  Users,
} from "lucide-react";

export default function HomePage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  const botFeatures = [
    {
      icon: ShieldCheck,
      title: "Moderación & Sistema Anti-Raid",
      description:
        "Filtros de spam automáticos, detección de links maliciosos, protección contra entradas masivas (anti-raid) y registro de sanciones en base de datos.",
    },
    {
      icon: Ticket,
      title: "Sistema de Tickets Profesional",
      description:
        "Creación de canales de soporte privados con botones interactivos, asignación de moderadores y generación automática de transcripciones en HTML.",
    },
    {
      icon: Zap,
      title: "Verificación y Roles Automáticos",
      description:
        "Sistemas de bienvenida interactivos, botones de selección de roles por reacción y validación para evitar cuentas falsas o bots atacantes.",
    },
    {
      icon: Terminal,
      title: "Panel Web Avenix Control",
      description:
        "Gestiona la configuración de tu bot, consulta logs en tiempo real, reinicia la instancia y ajusta colores de embeds desde tu navegador.",
    },
    {
      icon: Server,
      title: "Infraestructura Cloud Europea Dedicada",
      description:
        "Tu bot opera en contenedores aislados de alto rendimiento en Alemania y España con 99.9% de disponibilidad garantizada y protección Anti-DDoS.",
    },
    {
      icon: Headphones,
      title: "Soporte Técnico Directo 24/7",
      description:
        "Atención técnica prioritaria por parte de desarrolladores especializados para resolver cualquier duda o configuración de tu servidor.",
    },
  ];

  const botFaqs = [
    {
      question: "¿Cómo se añade el bot a mi servidor de Discord?",
      answer:
        "Tras completar la suscripción, recibirás un enlace de invitación oficial de Avenix Control para vincular el bot a tu servidor con los permisos necesarios en menos de un minuto.",
    },
    {
      question: "¿Puedo personalizar el nombre, foto de perfil y colores del bot?",
      answer:
        "Sí. A través del panel Avenix Control puedes personalizar los colores hexadecimales de los mensajes embeds, prefijos y textos de bienvenida para adaptarlos a la identidad de tu servidor.",
    },
    {
      question: "¿Qué diferencia hay entre el pago mensual de 9 € y el anual de 70 €?",
      answer:
        "El plan mensual tiene un coste de 9,00 € al mes facturado periódicamente. El plan anual ofrece un descuento especial costando solo 70,00 € al año (equivalente a ~5,83 €/mes), lo que supone un ahorro directo de 38,00 € al año.",
    },
    {
      question: "¿Hay límite de miembros, canales o mensajes en mi servidor?",
      answer:
        "No. Tu bot cuenta con recursos garantizados en servidor y no tiene restricciones en el número de miembros de tu comunidad ni en el volumen de comandos ejecutados.",
    },
    {
      question: "¿Puedo cancelar la suscripción en cualquier momento?",
      answer:
        "Sí. Puedes cancelar la renovación automática en cualquier momento desde tu panel de facturación de Stripe en Avenix Control sin penalizaciones.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      {/* HERO SECTION DEDICADA AL BOT DE DISCORD */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-tech-grid">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Avenix Bot Platform — Build beyond limits</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] font-display">
            El Bot de Discord definitivo para tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-300">
              comunidad o empresa
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Automatización integral, moderación activa, tickets con transcripciones y panel de control web.
            Rendimiento garantizado en servidores dedicados europeos.
          </p>

          {/* Price Callout Banner */}
          <div className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#111827] border border-blue-500/30 text-slate-200">
            <span className="text-xs text-slate-400">Tarifa oficial:</span>
            <span className="text-lg font-extrabold text-white font-display">
              9 € <span className="text-xs text-slate-400 font-normal">/ mes</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              o 70 € al año (Ahorra más del 35%)
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#tarifas"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Contratar Avenix Bot</span>
              <ArrowRight className="w-4 h-4 text-blue-200" />
            </a>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Ver Avenix Control</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">99.9% Uptime</p>
                <p className="text-xs text-slate-400">Sin caídas imprevistas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Baja Latencia</p>
                <p className="text-xs text-slate-400">&lt; 20ms en Europa</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sin Publicidad</p>
                <p className="text-xs text-slate-400">100% privado y limpio</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Panel Web</p>
                <p className="text-xs text-slate-400">Gestión en navegador</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE PRECIOS Y TARIFAS ESPECÍFICA */}
      <section id="tarifas" className="py-24 bg-[#0d1627] border-y border-slate-800/80 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Tarifas Oficiales
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              Un precio simple, todo incluido
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Sin funciones bloqueadas ni planes confusos. Todos los módulos y el panel web incluidos.
            </p>

            {/* Billing Toggle (Mensual vs Anual) */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-[#0B1220] border border-slate-800">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  billingCycle === "MONTHLY"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Facturación Mensual
              </button>
              <button
                onClick={() => setBillingCycle("ANNUAL")}
                className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  billingCycle === "ANNUAL"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Facturación Anual</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Ahorra 38 €
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Mensual */}
            <div
              className={`p-8 rounded-3xl bg-[#111827] border transition-all flex flex-col justify-between ${
                billingCycle === "MONTHLY"
                  ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500"
                  : "border-slate-800 opacity-80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white font-display">Avenix Bot Mensual</h3>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Flexibilidad
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Ideal para probar todas las funciones o servidores con necesidades mensuales.
                </p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white font-display">9,00 €</span>
                  <span className="text-xs text-slate-400">/ mes (21% IVA inc.)</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Uptime garantizado del 99.9% en servidor europeo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Módulo de tickets con transcripción HTML</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Moderación automática y filtros anti-raid</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Acceso completo a Avenix Control</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Cancela en cualquier momento sin compromiso</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/checkout?plan=price-bot-monthly"
                className="w-full text-center py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Contratar por 9 € / mes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Plan Anual */}
            <div
              className={`relative p-8 rounded-3xl bg-[#111827] border transition-all flex flex-col justify-between ${
                billingCycle === "ANNUAL"
                  ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500"
                  : "border-slate-800"
              }`}
            >
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                Mejor Oferta (Ahorra 38 €)
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white font-display">Avenix Bot Anual</h3>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Pago único anual equivalente a tan solo ~5,83 € al mes con soporte prioritario continuo.
                </p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white font-display">70,00 €</span>
                  <span className="text-xs text-slate-400">/ año (21% IVA inc.)</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Todas las funciones del plan mensual</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ahorro directo de más del 35% frente al pago mensual</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Soporte técnico VIP con respuesta rápida</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Copia de seguridad y persistencia anual garantizada</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Factura oficial correlativa descargable en PDF</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/checkout?plan=price-bot-annual"
                className="w-full text-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <span>Contratar por 70 € / año</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS Y FUNCIONALIDADES DETALLADAS DEL BOT */}
      <section className="py-24 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Características Incluidas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              Todo lo que tu servidor necesita en un solo bot
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Olvídate de tener 5 bots diferentes de procedencia dudosa. Avenix Bot unifica toda la gestión de tu comunidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {botFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-display">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ ESPECÍFICO DEL BOT */}
      <section className="py-24 bg-[#0d1627] border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Preguntas Frecuentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              Dudas sobre Avenix Bot
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Todo lo que necesitas saber antes de contratar el bot para tu servidor.
            </p>
          </div>

          <div className="space-y-4">
            {botFaqs.map((faq, idx) => (
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

      {/* LLAMADA FINAL A LA ACCIÓN */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#0B1220] to-[#080d17]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Lleva tu servidor de Discord al siguiente nivel
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            Únete a las comunidades que confían en Avenix para su moderación, soporte y automatización.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#tarifas"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Empezar por 9 €/mes o 70 €/año</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Consultar con un desarrollador</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
