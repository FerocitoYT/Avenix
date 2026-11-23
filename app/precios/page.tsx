"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { OFFICIAL_CATALOG } from "@/lib/catalog";
import { formatCurrency, calculateBaseFromTotal } from "@/lib/utils";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  HelpCircle,
  Clock,
  Layers,
  Bot,
  Globe,
  Server,
  Zap,
} from "lucide-react";

export default function PricingPage() {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const categories = [
    { id: "ALL", label: "Todas las tarifas" },
    { id: "DISCORD_BOT", label: "Bots de Discord" },
    { id: "WEB_DEVELOPMENT", label: "Desarrollo Web" },
    { id: "HOSTING_CLOUD", label: "Hosting & Mantenimiento" },
  ];

  const filteredCatalog =
    filterCategory === "ALL"
      ? OFFICIAL_CATALOG
      : OFFICIAL_CATALOG.filter((item) => item.category === filterCategory);

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-tech-grid relative border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Tarifas Oficiales
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mt-4 font-display">
            Precios y Planes de Servicio
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Tarifas fijas transparentes con el 21% de IVA incluido. Sin cobros imprevistos ni renovaciones automáticas no autorizadas.
          </p>

          {/* Filter pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {filteredCatalog.map((product) => (
            <div key={product.id} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white font-display">
                      {product.name}
                    </h2>
                    {product.badge && (
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          product.isAvailable
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    {product.tagline}
                  </p>
                </div>
              </div>

              {/* Price Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.prices.map((price) => {
                  const vatBreakdown = calculateBaseFromTotal(price.priceCents, price.vatRatePercent);
                  const isAvailable = product.isAvailable && price.isAvailable;

                  return (
                    <div
                      key={price.id}
                      className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
                        price.isPopular
                          ? "bg-[#111827] border-2 border-blue-500 shadow-lg shadow-blue-500/10"
                          : "bg-[#111827]/70 border border-slate-800 hover:border-slate-700"
                      } ${!isAvailable ? "opacity-75" : ""}`}
                    >
                      {price.isPopular && (
                        <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Recomendado
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white font-display">
                            {price.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 uppercase font-medium">
                            {price.billingType === "RECURRING" ? "Suscripción" : "Pago único"}
                          </span>
                        </div>

                        {/* Price amount */}
                        <div className="mt-4 mb-2 flex items-baseline gap-1.5">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                            {formatCurrency(price.priceCents)}
                          </span>
                          {price.billingType === "RECURRING" && (
                            <span className="text-xs text-slate-400">/ mes</span>
                          )}
                        </div>

                        {/* Tax info */}
                        <p className="text-[11px] text-slate-400 mb-6">
                          Incluye 21% IVA ({formatCurrency(vatBreakdown.vatAmountCents)} IVA • Base: {formatCurrency(vatBreakdown.baseAmountCents)})
                        </p>

                        {/* Features */}
                        <ul className="space-y-2.5 text-xs text-slate-300 mb-6 pt-4 border-t border-slate-800">
                          {product.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-slate-800/80">
                        {isAvailable ? (
                          <Link
                            href={`/checkout?plan=${price.id}`}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                              price.isPopular
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                                : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                            }`}
                          >
                            <span>{price.billingType === "RECURRING" ? "Suscribirse" : "Contratar"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800/50 text-amber-400/80 border border-amber-500/20 cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Próximamente disponible</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Informative box about quotes & custom software */}
        <div className="mt-20 p-8 rounded-3xl bg-[#111827] border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              ¿Tu proyecto requiere funcionalidades a medida?
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Si necesitas un bot con sistemas propietarios, una arquitectura web compleja o integraciones personalizadas, utiliza nuestro formulario de presupuesto para recibir una cotización exacta.
            </p>
          </div>
          <Link
            href="/presupuesto"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap shadow-md shadow-blue-500/20 transition-all hover:scale-105"
          >
            Configurar presupuesto personalizado
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
