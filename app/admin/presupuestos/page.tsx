"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  Send,
  DollarSign,
  User,
  ArrowRight,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface QuoteItem {
  id: string;
  quoteNumber: string;
  guestName: string;
  guestEmail: string;
  serviceType: string;
  estimatedBudget: string;
  projectDescription: string;
  selectedFeatures: string[];
  status: "PENDING" | "REVIEWING" | "PROPOSAL_SENT" | "ACCEPTED" | "REJECTED";
  proposedPriceCents?: number;
  adminNotes?: string;
  createdAt: string;
}

export default function AdminPresupuestosPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number>(19900);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const res = await fetch("/api/admin/quotes");
        const data = await res.json();
        if (data?.quotes) {
          setQuotes(data.quotes);
          if (data.quotes.length > 0) {
            setActiveQuoteId(data.quotes[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading real quotes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotes();
  }, []);

  const activeQuote = quotes.find((q) => q.id === activeQuoteId);

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuoteId) return;

    setQuotes((prev) =>
      prev.map((q) =>
        q.id === activeQuoteId
          ? {
              ...q,
              status: "PROPOSAL_SENT",
              proposedPriceCents: proposedPrice,
              adminNotes: notes,
            }
          : q
      )
    );

    setToastMessage(`Presupuesto ${activeQuote?.quoteNumber} enviado formalmente al cliente.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcceptProposal = (id: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "ACCEPTED" } : q))
    );
    setToastMessage("Presupuesto marcado como ACEPTADO por el cliente.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Gestión de Presupuestos y Propuestas
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evalúa las solicitudes enviadas desde la web pública, define el importe exacto con IVA y envía la oferta formal.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quote List (1 col) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Solicitudes Recibidas ({quotes.length})
          </h2>

          <div className="space-y-2">
            {quotes.length > 0 ? (
              quotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setActiveQuoteId(q.id);
                    if (q.proposedPriceCents) setProposedPrice(q.proposedPriceCents);
                    if (q.adminNotes) setNotes(q.adminNotes);
                  }}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    activeQuoteId === q.id
                      ? "bg-[#0B1220] border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "bg-[#0B1220]/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {q.quoteNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        q.status === "PENDING"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : q.status === "PROPOSAL_SENT"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {q.status === "PENDING"
                        ? "Pendiente"
                        : q.status === "PROPOSAL_SENT"
                        ? "Oferta Enviada"
                        : "Aceptado"}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white mb-0.5">{q.guestName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{q.guestEmail}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
                    <span>{q.serviceType}</span>
                    <span>{formatDate(q.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-[#0B1220]/60 border border-slate-800 text-center text-xs text-slate-500">
                {loading ? "Cargando presupuestos..." : "No hay presupuestos recibidos."}
              </div>
            )}
          </div>
        </div>

        {/* Quote Detail & Evaluation (2 cols) */}
        <div className="lg:col-span-2">
          {activeQuote ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1220] border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {activeQuote.quoteNumber}
                  </span>
                  <h3 className="text-lg font-bold text-white font-display">
                    {activeQuote.guestName}
                  </h3>
                  <p className="text-xs text-slate-400">{activeQuote.guestEmail}</p>
                </div>

                <div className="flex items-center gap-2">
                  {activeQuote.status === "PROPOSAL_SENT" && (
                    <button
                      onClick={() => handleAcceptProposal(activeQuote.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                    >
                      Registrar Aceptación de Cliente
                    </button>
                  )}
                </div>
              </div>

              {/* Requirement details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Descripción del Proyecto del Cliente
                </h4>
                <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {activeQuote.projectDescription}
                </div>
              </div>

              {/* Selected features */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Funcionalidades Seleccionadas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeQuote.selectedFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evaluation and Quote Form */}
              <form onSubmit={handleSendProposal} className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Definir Oferta Formal de Avenix
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Precio Propuesto Cerrado (céntimos de Euro, IVA inc.)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={100}
                        required
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(parseInt(e.target.value) || 0)}
                        className="w-36 px-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-sm font-bold text-white font-display">
                        = {formatCurrency(proposedPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Memoria Técnica / Notas para el Cliente
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Detalla los entregables incluidos, plazos de entrega y garantías de soporte..."
                    className="w-full px-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Emitir y Notificar Presupuesto al Cliente</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#0B1220] border border-slate-800">
              {quotes.length === 0 ? "No hay solicitudes de presupuesto recibidas todavía." : "Selecciona una solicitud para emitir la propuesta."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
