"use client";

import React, { useState } from "react";
import { OFFICIAL_CATALOG, ProductDefinition } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Plus,
  Edit2,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function AdminCatalogoPage() {
  const [catalog, setCatalog] = useState<ProductDefinition[]>(OFFICIAL_CATALOG);
  const [savedMessage, setSavedMessage] = useState(false);

  const handlePriceChange = (
    productId: string,
    priceId: string,
    newPriceCents: number
  ) => {
    setCatalog((prev) =>
      prev.map((prod) =>
        prod.id === productId
          ? {
              ...prod,
              prices: prod.prices.map((p) =>
                p.id === priceId ? { ...p, priceCents: newPriceCents } : p
              ),
            }
          : prod
      )
    );
  };

  const toggleProductAvailability = (productId: string) => {
    setCatalog((prev) =>
      prev.map((prod) =>
        prod.id === productId
          ? { ...prod, isAvailable: !prod.isAvailable }
          : prod
      )
    );
  };

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Catálogo de Productos y Tarifas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modifica precios en euros, activa/desactiva productos o marca paquetes como &quot;Próximamente&quot;.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Cambios en Catálogo</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Cambios guardados en base de datos. Las tarifas públicas han sido actualizadas.</span>
        </div>
      )}

      {/* Catalog items */}
      <div className="space-y-6">
        {catalog.map((product) => (
          <div
            key={product.id}
            className="p-6 sm:p-8 rounded-3xl bg-[#0B1220] border border-slate-800 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-white font-display">
                    {product.name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      product.isAvailable
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {product.isAvailable ? "Disponible en Web" : "Próximamente / Oculto"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{product.tagline}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleProductAvailability(product.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {product.isAvailable ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Marcar Próximamente</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Publicar en Web</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pricing tiers table */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Tarifas y Precios de este Producto (IVA incluido)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.prices.map((price) => (
                  <div
                    key={price.id}
                    className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-display">
                        Plan {price.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {price.billingType}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Importe total (en céntimos de Euro)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step={100}
                          value={price.priceCents}
                          onChange={(e) =>
                            handlePriceChange(
                              product.id,
                              price.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-32 px-3 py-1.5 rounded-lg bg-[#0B1220] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-xs font-bold text-indigo-400">
                          {formatCurrency(price.priceCents)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
