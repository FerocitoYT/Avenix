"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

interface Message {
  id: string;
  sender: string;
  isStaff: boolean;
  content: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "RESOLVED" | "CLOSED";
  statusLabel: string;
  createdAt: string;
  messages: Message[];
}

export default function SoportePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newReply, setNewReply] = useState<string>("");

  // New ticket form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Bots de Discord");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [newContent, setNewContent] = useState("");

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !activeTicketId) return;

    const message: Message = {
      id: "m-" + Date.now(),
      sender: "Cliente",
      isStaff: false,
      content: newReply,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId
          ? { ...t, messages: [...t.messages, message] }
          : t
      )
    );
    setNewReply("");
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTicket: Ticket = {
      id: "tck-" + Date.now(),
      ticketNumber: `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      category: newCategory,
      priority: newPriority,
      status: "OPEN",
      statusLabel: "Abierto",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: "m-init",
          sender: "Cliente",
          isStaff: false,
          content: newContent,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setActiveTicketId(newTicket.id);
    setShowCreateModal(false);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Soporte Técnico y Tickets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comunícate directamente con nuestros ingenieros para resolver cualquier duda o incidencia.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear nuevo ticket</span>
        </button>
      </div>

      {/* Main Split: Ticket List vs Active Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List (1 Col) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tus Tickets ({tickets.length})
          </h2>

          <div className="space-y-2">
            {tickets.length > 0 ? (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicketId(t.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    activeTicketId === t.id
                      ? "bg-[#111827] border-blue-500 shadow-md shadow-blue-500/10"
                      : "bg-[#111827]/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {t.ticketNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {t.statusLabel}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">{t.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{t.category}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-[#111827]/60 border border-slate-800 text-center text-xs text-slate-500">
                No tienes tickets abiertos.
              </div>
            )}
          </div>
        </div>

        {/* Conversation Thread (2 Cols) */}
        <div className="lg:col-span-2">
          {activeTicket ? (
            <div className="rounded-3xl bg-[#111827] border border-slate-800 flex flex-col h-[600px] overflow-hidden">
              {/* Thread Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0e1626]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {activeTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-bold text-white font-display">
                      {activeTicket.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Categoría: {activeTicket.category} • Prioridad: {activeTicket.priority}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeTicket.statusLabel}
                </span>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.isStaff ? "items-start" : "items-end"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                      {m.isStaff ? (
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {m.sender}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-300">{m.sender}</span>
                      )}
                      <span>• {formatDateTime(m.createdAt)}</span>
                    </div>

                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                        m.isStaff
                          ? "bg-slate-800/90 text-white border border-slate-700/80 rounded-tl-sm"
                          : "bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-500/20"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-800 bg-[#0e1626] flex items-center gap-3">
                <input
                  type="text"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Escribe tu respuesta técnica aquí..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={!newReply.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-blue-500/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#111827] border border-slate-800 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white font-display">
                  {tickets.length === 0 ? "No has abierto ningún ticket de soporte" : "Selecciona un ticket"}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {tickets.length === 0
                    ? "Si tienes alguna duda sobre tus bots, desarrollos o facturación, abre un ticket y el equipo de ingenieros te responderá directamente."
                    : "Elige uno de tus tickets en la columna izquierda para leer el historial y responder."}
                </p>
              </div>
              {tickets.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Abrir ticket ahora</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#111827] border border-slate-800 p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">
                Abrir Nuevo Ticket de Soporte
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Asunto del ticket *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Error al conectar el bot al canal de voz"
                  className="w-full px-4 py-2 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Bots de Discord">Bots de Discord</option>
                    <option value="Desarrollo Web">Desarrollo Web</option>
                    <option value="Hosting & Servidores">Hosting & Servidores</option>
                    <option value="Facturación y Pagos">Facturación y Pagos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detalles del mensaje *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe la incidencia o consulta técnica con el mayor detalle posible..."
                  className="w-full px-4 py-2 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  Crear ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
