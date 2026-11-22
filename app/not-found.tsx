import React from "react";
import Link from "next/link";
import { AvenixLogo } from "@/components/brand/logo";
import { ArrowLeft, Bot } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-6 text-center">
      <AvenixLogo size="lg" className="mb-8" />
      <div className="p-8 max-w-md w-full rounded-3xl bg-[#111827] border border-slate-800 space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
          <Bot className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-display">404</h1>
        <h2 className="text-base font-bold text-white font-display">Página no encontrada</h2>
        <p className="text-xs text-slate-400">
          La ruta a la que intentas acceder no existe o ha sido reubicada dentro de Avenix.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
