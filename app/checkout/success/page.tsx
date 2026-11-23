"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import {
  CheckCircle2,
  ArrowRight,
  Bot,
  FileText,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
} from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order") || "";
  const sessionIdParam = searchParams.get("session_id") || "";
  const gatewayParam = searchParams.get("gateway") || "";

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = async () => {
    try {
      const query = new URLSearchParams();
      if (orderParam) query.set("order", orderParam);
      if (sessionIdParam) query.set("session_id", sessionIdParam);

      const res = await fetch(`/api/checkout/status?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrderData(data);
        return data;
      }
    } catch (err) {
      console.error("Error polling order status:", err);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // Initial check
    checkStatus().then((data) => {
      // If not yet accepted, poll every 3 seconds up to 20 times (60s)
      if (!data || !data.isPaid) {
        interval = setInterval(async () => {
          setPollCount((prev) => {
            if (prev >= 20) {
              if (interval) clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });

          const current = await checkStatus();
          if (current?.isPaid) {
            if (interval) clearInterval(interval);
          }
        }, 3000);
      }
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderParam, sessionIdParam]);

  const isConfirmed = orderData?.isPaid || false;
  const displayOrderNumber = orderData?.orderNumber || orderParam || "AVX-PENDING";
  const displayInvoiceNumber = orderData?.invoiceNumber || "FAC-EMITIDA";

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
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Verificando estado de la transacción en la pasarela...</p>
          </div>
        ) : isConfirmed ? (
          /* Payment Confirmed State */
          <>
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-in zoom-in-90 duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Pago Verificado por Pasarela Oficial</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                ¡Tu servicio está activado!
              </h1>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Hemos recibido la confirmación oficial del pago. Tu bot de Discord ha sido desplegado en nuestros nodos europeos y la factura legal ya está registrada.
              </p>
            </div>

            {/* Reference Info Card */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 max-w-lg mx-auto w-full grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Referencia de Pedido:</span>
                <span className="font-mono text-sm font-bold text-white">{displayOrderNumber}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Factura Oficial:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">{displayInvoiceNumber}</span>
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
          </>
        ) : (
          /* Awaiting Webhook / IPN Confirmation State */
          <>
            <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Esperando Confirmación de Pasarela</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                Verificando recepción del pago
              </h1>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Estamos esperando la confirmación criptográfica por Webhook / IPN de {gatewayParam === "paypal" ? "PayPal" : "Stripe"}. Tu servicio se activará de forma automática inmediatamente en cuanto se reciba la señal.
              </p>
            </div>

            {/* Status Progress Card */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 max-w-lg mx-auto w-full space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400">Referencia de Pedido:</span>
                <span className="font-mono text-xs font-bold text-white">{displayOrderNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400">Estado en Base de Datos:</span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  PENDIENTE DE PAGO
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                <span>Comprobando periódicamente... (intento {pollCount}/20)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto w-full">
              <button
                onClick={() => checkStatus()}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Comprobar Ahora</span>
              </button>
              <Link
                href="/dashboard/pedidos"
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Ver mis Pedidos</span>
              </Link>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Avenix. Todos los derechos reservados. Verificación segura en tiempo real.</p>
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
