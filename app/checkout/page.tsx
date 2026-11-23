"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  CreditCard,
  Zap,
  ArrowRight,
  Server,
  Bot,
  HelpCircle,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planParam = searchParams.get("plan") || "price-bot-monthly";

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    planParam === "bot_anual_70" || planParam === "price-bot-annual"
      ? "price-bot-annual"
      : "price-bot-monthly"
  );

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    companyName: "",
    taxId: "",
    paymentMethod: "STRIPE" as "STRIPE" | "PAYPAL",
    acceptTerms: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill if user has active session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setForm((prev) => ({
            ...prev,
            customerName: prev.customerName || data.user.name || "",
            customerEmail: prev.customerEmail || data.user.email || "",
            companyName: prev.companyName || data.user.companyName || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const plans = [
    {
      id: "price-bot-monthly",
      name: "Avenix Bot Mensual",
      priceCents: 900, // 9,00 €
      intervalLabel: "/ mes",
      description: "Flexibilidad mes a mes. Cancela cuando quieras sin permanencia.",
      badge: "Más Flexible",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: "price-bot-annual",
      name: "Avenix Bot Anual",
      priceCents: 7000, // 70,00 €
      intervalLabel: "/ año",
      description: "Equivalente a solo ~5,83 €/mes. Soporte prioritario VIP continuo.",
      badge: "Ahorra 38 €",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const totalAmountCents = currentPlan.priceCents;
  const baseAmountCents = Math.round(totalAmountCents / 1.21);
  const vatAmountCents = totalAmountCents - baseAmountCents;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.acceptTerms) {
      setError("Debes aceptar las condiciones de contratación y la política de privacidad.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: currentPlan.id,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          companyName: form.companyName || undefined,
          taxId: form.taxId || undefined,
          paymentMethod: form.paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pago.");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/checkout/success?order=${data.orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message || "No se pudo completar el proceso de compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#0B1220]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AvenixLogo size="sm" />
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Checkout Cifrado SSL de 256 bits</span>
            </div>
            <Link
              href="/#tarifas"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Volver a tarifas
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Finalizar Contratación
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Completa tus datos para activar tu bot y recibir tu factura oficial con IVA desglosado.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Plan Selector Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Selecciona tu modalidad de bot
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#111827] border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "bg-[#111827]/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-white">{plan.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                          {plan.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mb-3">{plan.description}</p>

                      <div className="flex items-baseline gap-1 mt-auto pt-2 border-t border-slate-800/80">
                        <span className="text-xl font-extrabold text-white font-display">
                          {formatCurrency(plan.priceCents)}
                        </span>
                        <span className="text-[10px] text-slate-400">{plan.intervalLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Details */}
              <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Datos del titular del servicio
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nombre completo o Razón Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="Ej. Hugo Romero"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Correo electrónico de contacto *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Servidor de Discord o Comunidad (Opcional)
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Ej. Mi Comunidad Gaming"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      NIF / CIF para Factura (Opcional)
                    </label>
                    <input
                      type="text"
                      value={form.taxId}
                      onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                      placeholder="Ej. 12345678Z"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. Método de Pago Oficial
                  </label>
                  <span className="text-[10px] text-blue-400 font-medium">Verificación Webhook / IPN</span>
                </div>

                <div className="space-y-3">
                  {/* Stripe Option */}
                  <label
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      form.paymentMethod === "STRIPE"
                        ? "bg-[#0B1220] border-blue-500 ring-1 ring-blue-500"
                        : "bg-[#0B1220]/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={form.paymentMethod === "STRIPE"}
                        onChange={() => setForm({ ...form, paymentMethod: "STRIPE" })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Tarjeta de Débito / Crédito (Stripe)</span>
                          <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.2 rounded font-bold uppercase">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Pasarela oficial protegida con 3D Secure, Apple Pay y Google Pay.
                        </p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-indigo-400 shrink-0" />
                  </label>

                  {/* PayPal Option */}
                  <label
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      form.paymentMethod === "PAYPAL"
                        ? "bg-[#0B1220] border-blue-500 ring-1 ring-blue-500"
                        : "bg-[#0B1220]/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={form.paymentMethod === "PAYPAL"}
                        onChange={() => setForm({ ...form, paymentMethod: "PAYPAL" })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">PayPal / Tarjeta con PayPal</span>
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded font-bold uppercase">
                            IPN Seguro
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Paga con tu saldo de PayPal, cuenta bancaria o tarjetas vinculadas.
                        </p>
                      </div>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 font-sans">
                      PP
                    </div>
                  </label>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  required
                  checked={form.acceptTerms}
                  onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-400 leading-snug">
                  He leído y acepto los{" "}
                  <Link href="/legal/terminos" className="text-blue-400 hover:underline">
                    Términos de Contratación
                  </Link>{" "}
                  y la{" "}
                  <Link href="/legal/privacidad" className="text-blue-400 hover:underline">
                    Política de Privacidad
                  </Link>
                  . Entiendo que se aplicará el 21% de IVA legal español.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando con {form.paymentMethod === "STRIPE" ? "Stripe" : "PayPal"}...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Pagar con {form.paymentMethod === "STRIPE" ? "Tarjeta (Stripe)" : "PayPal"} ({formatCurrency(totalAmountCents)})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                El servicio se activará de forma inmediata una vez verificado el pago por la pasarela oficial.
              </p>
            </form>
          </div>

          {/* Right Summary Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-800 space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white font-display">
                  Resumen del Pedido
                </h3>
                <span className="text-[11px] text-blue-400 font-semibold">
                  Avenix Cloud
                </span>
              </div>

              {/* Item Details */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{currentPlan.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Instancia de Bot Discord alojada en eu-node-01 con soporte y consola web.
                  </p>
                </div>
              </div>

              {/* Inclusions checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Uptime garantizado del 99.9% en nodo europeo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Acceso inmediato a Avenix Control (/dashboard/bots)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tickets con transcripción, moderación y economía</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Factura legal correlativa en PDF con 21% IVA</span>
                </div>
              </div>

              {/* Tax & Price Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Base Imponible</span>
                  <span>{formatCurrency(baseAmountCents)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>IVA Legal Español (21%)</span>
                  <span>{formatCurrency(vatAmountCents)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800/80">
                  <span className="font-display">Total a Pagar</span>
                  <span className="text-lg text-blue-400 font-display">
                    {formatCurrency(totalAmountCents)}
                  </span>
                </div>
              </div>

              {/* Trust Badge Box */}
              <div className="p-4 rounded-2xl bg-[#0B1220] border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Garantía Oficial Avenix</span>
                </div>
                <p>
                  Servidor operativo de forma inmediata tras el pago. Sin permanencias en planes mensuales. Facturación transparente y soporte técnico dedicado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Avenix. Todos los derechos reservados. Pagos seguros y cifrados.</p>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
