"use client";
import {useLanguage,LanguageSelector} from "@/components/language-provider";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
 const {t}=useLanguage();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    discordUsername: "",
    companyName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("Error al crear la cuenta.","Unable to create account."));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || t("No se pudo registrar la cuenta.","Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-tech-grid">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <AvenixLogo size="lg" className="justify-center" /><div className="mt-3"><LanguageSelector/></div>
          <h1 className="text-2xl font-bold text-white mt-6 font-display">
            {t("Crear cuenta de cliente","Create a customer account")}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t("Accede a tus servicios, facturación y panel de control de bots.","Access your services, billing and bot dashboard.")}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("Nombre y Apellidos *","Full name *")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. David Fernández"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("Correo electrónico *","Email address *")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="david@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("Contraseña segura (mínimo 8 caracteres) *","Secure password (at least 8 characters) *")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("Discord Tag (opcional)","Discord tag (optional)")}
                </label>
                <input
                  type="text"
                  value={form.discordUsername}
                  onChange={(e) => setForm({ ...form, discordUsername: e.target.value })}
                  placeholder="david_dev"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Empresa / Servidor
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Mi Comunidad"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Al registrarte aceptas las{" "}
              <Link href="/legal/terminos" className="text-blue-400 underline">
                condiciones de uso
              </Link>{" "}
              y la{" "}
              <Link href="/legal/privacidad" className="text-blue-400 underline">
                {t("política de privacidad","privacy policy")}
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("Creando tu cuenta...","Creating your account...")}</span>
                </>
              ) : (
                <>
                  <span>{t("Registrar cuenta y continuar","Create account and continue")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          {t("¿Ya tienes cuenta en Avenix?","Already have an Axyon account?")}{" "}
          <Link href="/auth/login" className="text-blue-400 hover:underline font-semibold">
            {t("Iniciar sesión","Sign in")}
          </Link>
        </div>
      </div>
    </div>
  );
}
