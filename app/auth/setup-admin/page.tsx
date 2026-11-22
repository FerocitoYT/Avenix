"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import {
  ShieldAlert,
  KeyRound,
  Mail,
  User,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SetupAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    setupToken: "",
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al inicializar el administrador.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al procesar la inicialización.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-tech-grid">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <AvenixLogo size="lg" className="justify-center" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mt-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Procedimiento de Inicialización Segura</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-3 font-display">
            Configurar Primer Superadministrador
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Por estrictos criterios de seguridad, no existen cuentas de administrador públicas o predeterminadas en el código.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl space-y-6">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                ¡Superadministrador Creado!
              </h3>
              <p className="text-xs text-slate-300">
                La sesión ha sido iniciada. Redirigiéndote al panel administrativo...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Token Secreto de Inicialización (ADMIN_INITIAL_SETUP_TOKEN) *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={form.setupToken}
                    onChange={(e) => setForm({ ...form, setupToken: e.target.value })}
                    placeholder="Clave definida en tu archivo .env"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1220] border border-amber-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Configurado en la variable ADMIN_INITIAL_SETUP_TOKEN del servidor.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre del Administrador *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Administrador Principal Avenix"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo Electrónico de Acceso *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@avenix.dev"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña de Administrador (mínimo 10 caracteres) *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando superadministrador...</span>
                    </>
                  ) : (
                    <>
                      <span>Inicializar y desbloquear panel admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
