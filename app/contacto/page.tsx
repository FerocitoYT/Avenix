"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Mail,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  FileText,
} from "lucide-react";

export default function ContactoPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    serviceType: "Bots de Discord",
    estimatedBudget: "200 € - 500 €",
    description: "",
    attachmentName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar el mensaje.");
      }

      setSentSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al conectar con el servidor.");
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
            Atención al Cliente
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 font-display">
            Contacto & Soporte Técnico
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-xl mx-auto">
            ¿Tienes dudas técnicas, comerciales o una propuesta de colaboración? Escríbenos directamente y te responderemos en menos de 24 horas.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white font-display">
                Canales Directos
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Respondemos consultas en horario comercial de lunes a viernes (09:00 a 19:00 CET).
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">Correo electrónico:</span>
                    <a
                      href="mailto:contacto@avenix.dev"
                      className="text-white hover:text-blue-400 font-semibold"
                    >
                      contacto@avenix.dev
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">Tiempo de respuesta:</span>
                    <span className="text-white font-semibold">Menos de 24 horas laborables</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">Seguridad y Privacidad:</span>
                    <span className="text-white font-semibold">Cifrado TLS 1.3 bancario</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-950/40 border border-blue-500/20 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
                ¿Ya eres cliente activo?
              </p>
              <p className="text-slate-300">
                Para incidencias técnicas o soporte de tus bots contratados, utiliza el sistema de tickets dentro de{" "}
                <Link href="/dashboard" className="text-blue-400 underline font-semibold">
                  Avenix Control
                </Link>{" "}
                para obtener soporte prioritario inmediato.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#111827] border border-slate-800">
              {sentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">
                    Mensaje Recibido
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Hemos guardado tu solicitud en nuestra base de datos. Un miembro de nuestro equipo técnico se pondrá en contacto contigo en breve a través de{" "}
                    <span className="text-blue-400 font-medium">{form.email}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setSentSuccess(false);
                      setForm({
                        name: "",
                        email: "",
                        serviceType: "Bots de Discord",
                        estimatedBudget: "200 € - 500 €",
                        description: "",
                        attachmentName: "",
                      });
                    }}
                    className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ej. Laura González"
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
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="laura@empresa.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tipo de servicio de interés *
                      </label>
                      <select
                        value={form.serviceType}
                        onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Bots de Discord">Bots de Discord</option>
                        <option value="Desarrollo Web & Apps">Desarrollo Web & Apps</option>
                        <option value="Hosting & Cloud">Hosting & Cloud</option>
                        <option value="Automatizaciones & APIs">Automatizaciones & APIs</option>
                        <option value="Consulta Comercial General">Consulta Comercial General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Presupuesto estimado aproximado
                      </label>
                      <select
                        value={form.estimatedBudget}
                        onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Menos de 200 €">Menos de 200 €</option>
                        <option value="200 € - 500 €">200 € - 500 €</option>
                        <option value="500 € - 1.000 €">500 € - 1.000 €</option>
                        <option value="Más de 1.000 €">Más de 1.000 €</option>
                        <option value="Por definir">Por definir</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Descripción de tu proyecto o consulta *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Cuéntanos en detalle qué necesitas desarrollar, qué dudas tienes o cuáles son los objetivos de tu servidor o empresa..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Archivos adjuntos opcionales (Mockup, esquema o especificaciones)
                    </label>
                    <input
                      type="text"
                      value={form.attachmentName}
                      onChange={(e) => setForm({ ...form, attachmentName: e.target.value })}
                      placeholder="Enlace a Figma, Google Drive o documento de requisitos..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Tus datos serán tratados conforme al RGPD exclusivamente para atender tu solicitud comercial y técnica.
                  </p>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando solicitud...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar mensaje a Avenix</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
