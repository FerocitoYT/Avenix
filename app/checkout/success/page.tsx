"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import {
  CheckCircle2,
  ArrowRight,
  Bot,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  Loader2,
  ExternalLink,
} from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || searchParams.get("session_id") || "AVX-2026-CONFIRMED";
  const invoiceNumber = searchParams.get("invoice") || "FAC-2026-OFICIAL";

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800/80 bg-[#0B1220]/80 backdrop-blur-md py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <AvenixLogo size="sm" />
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Ir a Avenix Control</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16 w-full text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-in zoom-in-90 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Pago y Contratación Completados</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            ¡Tu servicio está activado!
          </h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Hemos verificado tu contratación y desplegado tu instancia en nuestros nodos europeos. La factura oficial ya ha sido generada en tu cuenta.
          </p>
        </div>

        {/* Reference Info Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 max-w-lg mx-auto w-full grid grid-cols-2 gap-4 text-left">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Referencia de Pedido:</span>
            <span className="font-mono text-sm font-bold text-white">{orderNumber}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Factura Emitida:</span>
            <span className="font-mono text-sm font-bold text-blue-400">{invoiceNumber}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto w-full">
          <Link
            href="/dashboard/bots"
            className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Gestionar mi Bot</span>
          </Link>
          <Link
            href="/dashboard/facturacion"
            className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar Factura</span>
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Avenix. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
