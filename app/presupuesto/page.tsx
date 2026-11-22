"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Bot,
  Globe,
  Server,
  Cpu,
  Layers,
  Send,
  ShieldCheck,
  Calculator,
  Loader2,
} from "lucide-react";

export default function PresupuestoPage() {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [serviceType, setServiceType] = useState<string>("discord_bot");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [estimatedBudget, setEstimatedBudget] = useState<string>("200_500");
  const [timeline, setTimeline] = useState<string>("normal");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    discordTag: "",
    company: "",
    description: "",
  });

  const serviceOptions = [
    {
      id: "discord_bot",
      title: "Bot de Discord Personalizado",
      desc: "Comandos slash, tickets, base de datos, economía, moderación.",
      icon: Bot,
    },
    {
      id: "desarrollo_web",
      title: "Desarrollo Web & Plataformas",
      desc: "Web corporativa, SaaS, tienda online con Next.js y panel.",
      icon: Globe,
    },
    {
      id: "hosting_cloud",
      title: "Hosting & Servidores Cloud",
      desc: "Alojamiento dedicado, Docker, anti-DDoS, 99.9% uptime.",
      icon: Server,
    },
    {
      id: "automatizacion_api",
      title: "Automatización & APIs",
      desc: "Integraciones de pago, sincronización webhooks y bases de datos.",
      icon: Cpu,
    },
  ];

  const featuresByService: Record<string, { id: string; label: string }[]> = {
    discord_bot: [
      { id: "slash_commands", label: "Comandos Slash modernos e interactivos" },
      { id: "tickets_system", label: "Sistema de tickets con transcripción HTML" },
      { id: "database_storage", label: "Base de datos persistente (PostgreSQL / Redis)" },
      { id: "stripe_roles", label: "Asignación automática de roles tras pago" },
      { id: "web_dashboard", label: "Panel web de administración Avenix Control" },
      { id: "moderation_auto", label: "Sistema anti-raid y automoderación inteligente" },
    ],
    desarrollo_web: [
      { id: "nextjs_modern", label: "Desarrollo en Next.js App Router & TypeScript" },
      { id: "responsive_design", label: "Diseño 100% responsive móvil y tablet" },
      { id: "seo_analytics", label: "Optimización SEO técnico y Core Web Vitals" },
      { id: "payments_stripe", label: "Pasarela de pagos Stripe / PayPal / Bizum" },
      { id: "admin_cms", label: "Panel administrativo privado para gestionar datos" },
      { id: "rgpd_legal", label: "Páginas legales y banner de cookies RGPD" },
    ],
    hosting_cloud: [
      { id: "docker_isolation", label: "Aislamiento por contenedor Docker" },
      { id: "auto_restart", label: "Reinicio automático 24/7 en caso de fallo" },
      { id: "realtime_logs", label: "Consola de logs interactiva en Avenix Control" },
      { id: "backup_daily", label: "Copias de seguridad diarias en nodo externo" },
      { id: "anti_ddos", label: "Protección Anti-DDoS europea mitigada" },
    ],
    automatizacion_api: [
      { id: "webhooks_sync", label: "Validación y despacho de Webhooks" },
      { id: "database_bridge", label: "Sincronización bidireccional de bases de datos" },
      { id: "discord_notifications", label: "Notificaciones instantáneas en canales Discord" },
      { id: "email_alerts", label: "Alertas automáticas por correo electrónico" },
      { id: "audit_logs", label: "Registro histórico de eventos e incidencias" },
    ],
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType,
          selectedFeatures,
          estimatedBudget,
          timeline,
          name: formData.name,
          email: formData.email,
          discordTag: formData.discordTag,
          company: formData.company,
          description: formData.description,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al enviar la solicitud.");
      }

      setSubmittedQuote(data.quote);
      setStep(5); // Success step
    } catch (err: any) {
      setErrorMessage(err.message || "Hubo un problema de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-tech-grid relative border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Configurador de Proyectos
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 font-display">
            Solicitar Presupuesto Personalizado
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-xl mx-auto">
            Configura las necesidades de tu solución en 4 sencillos pasos. Analizaremos tu solicitud y te enviaremos una propuesta formal cerrada.
          </p>

          {/* Stepper Progress Bar */}
          {step < 5 && (
            <div className="mt-10 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span className={step >= 1 ? "text-blue-400 font-bold" : ""}>1. Servicio</span>
                <span className={step >= 2 ? "text-blue-400 font-bold" : ""}>2. Funciones</span>
                <span className={step >= 3 ? "text-blue-400 font-bold" : ""}>3. Presupuesto</span>
                <span className={step >= 4 ? "text-blue-400 font-bold" : ""}>4. Contacto</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Multi-step Form Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl relative">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Paso 1: ¿Qué tipo de solución necesitas?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona la categoría principal de tu proyecto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {serviceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = serviceType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setServiceType(opt.id)}
                      className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                          : "bg-[#0B1220] border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{opt.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <span>Continuar a Funcionalidades</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Features */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Paso 2: Funcionalidades deseadas
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Marca las opciones que te interesen (puedes seleccionar varias).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuresByService[serviceType]?.map((feat) => {
                  const isSelected = selectedFeatures.includes(feat.id);
                  return (
                    <div
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-4 rounded-xl cursor-pointer text-xs flex items-center gap-3 transition-all border ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 text-white font-medium"
                          : "bg-[#0B1220] border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span>{feat.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <span>Continuar a Presupuesto</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Timeline */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Paso 3: Rango de presupuesto y tiempos
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Esto nos permite ajustar el alcance y proponerte la mejor relación coste/funcionalidad.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Presupuesto estimado aproximado
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "less_200", label: "Menos de 200 €" },
                    { id: "200_500", label: "200 € - 500 €" },
                    { id: "500_1000", label: "500 € - 1.000 €" },
                    { id: "more_1000", label: "Más de 1.000 €" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setEstimatedBudget(b.id)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center border transition-all ${
                        estimatedBudget === b.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                          : "bg-[#0B1220] border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Plazo deseado de entrega
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "urgent", label: "Urgente (menos de 7 días)" },
                    { id: "normal", label: "Estándar (1 - 3 semanas)" },
                    { id: "flexible", label: "Flexible (sin prisa inmediata)" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeline(t.id)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center border transition-all ${
                        timeline === t.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                          : "bg-[#0B1220] border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <span>Continuar a Datos de Contacto</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Contact & Project Details */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Paso 4: Datos de contacto y descripción
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Indícanos dónde enviarte la propuesta y detalla cualquier requerimiento clave.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tu nombre / Responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Carlos Martínez"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="carlos@ejemplo.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usuario o Tag de Discord (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.discordTag}
                    onChange={(e) => setFormData({ ...formData, discordTag: e.target.value })}
                    placeholder="ej. carlos_dev"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Comunidad o Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="ej. Servidor Gaming Club"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descripción detallada del proyecto *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explícanos qué debe hacer el bot o la web, qué comandos específicos imaginas o cualquier enlace relevante..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                Al enviar este formulario aceptas nuestra{" "}
                <Link href="/legal/privacidad" className="text-blue-400 underline">
                  política de privacidad
                </Link>{" "}
                y el tratamiento de tus datos para la emisión de la propuesta comercial.
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando solicitud...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar solicitud de presupuesto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success Confirmation */}
          {step === 5 && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-white font-display">
                ¡Solicitud de Presupuesto Recibida!
              </h2>

              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Hemos registrado tu proyecto con el identificador oficial{" "}
                <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {submittedQuote?.quoteNumber || "PRES-2026-AVX"}
                </span>
                . Nuestro equipo técnico evaluará la viabilidad y te responderá por correo electrónico con una propuesta personalizada.
              </p>

              <div className="p-4 rounded-xl bg-[#0B1220] border border-slate-800 text-xs text-slate-400 max-w-md mx-auto text-left">
                <p className="font-semibold text-white mb-1">Próximos pasos:</p>
                <p>1. Revisión técnica de requerimientos en menos de 24 horas laborables.</p>
                <p>2. Envío de presupuesto formal cerrado con desglose de IVA.</p>
                <p>3. En caso de aprobación, creación de pedido en tu panel Avenix Control.</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  Volver al inicio
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                >
                  Crear cuenta en Avenix Control
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
