"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Building,
  ShieldCheck,
  CheckCircle2,
  Save,
  KeyRound,
  LogOut,
  Smartphone,
  Globe,
} from "lucide-react";

export default function MiCuentaPage() {
  const [profile, setProfile] = useState({
    name: "Cliente Avenix",
    email: "cliente@empresa.com",
    companyName: "Mi Comunidad Discord",
    taxId: "B12345678", // NIF/CIF
    address: "Paseo de la Castellana 120",
    city: "Madrid",
    postalCode: "28046",
    country: "España",
    discordUsername: "cliente_pro",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }
    setPasswordSuccess(true);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Configuración de la Cuenta
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Administra tus datos de contacto, facturación oficial, contraseña y seguridad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Billing Data */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal & Billing Data */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Datos Personales y de Facturación (NIF/CIF)</span>
            </h2>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Datos fiscales y personales actualizados con éxito.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre o Razón Social
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Correo Electrónico (Login)
                  </label>
                  <input
                    type="email"
                    required
                    disabled
                    value={profile.email}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    NIF / CIF / Documento Fiscal
                  </label>
                  <input
                    type="text"
                    value={profile.taxId}
                    onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                    placeholder="Para facturas con IVA desglosado"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usuario de Discord Vinculado
                  </label>
                  <input
                    type="text"
                    value={profile.discordUsername}
                    onChange={(e) => setProfile({ ...profile, discordUsername: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Dirección de Facturación
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar cambios fiscales</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>Modificar Contraseña de Acceso</span>
            </h2>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Contraseña actualizada correctamente.</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nueva contraseña (mínimo 8 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
                >
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Sessions & Security Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Seguridad de Sesión</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B1220] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Navegador Actual</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Activo</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cookie de sesión segura HTTP-only con expiración en 7 días.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1220] border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Protección RGPD</span>
                <p className="text-[11px] text-slate-400">
                  Tus contraseñas están cifradas con salt de 12 rondas con bcrypt. Nunca se guardan en texto claro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
