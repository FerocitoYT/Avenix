"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "EMPLOYEE" | "ADMIN";
  discordUsername?: string;
  companyName?: string;
  isActive: boolean;
  registeredAt: string;
}

export default function AdminClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<ClientRecord[]>([
    {
      id: "cli-1",
      name: "Superadministrador Principal",
      email: "admin@avenix.dev",
      role: "ADMIN",
      discordUsername: "avenix_root",
      companyName: "Avenix",
      isActive: true,
      registeredAt: "2026-11-01",
    },
    {
      id: "cli-2",
      name: "Carlos Developer",
      email: "carlos@comunidad.es",
      role: "CLIENT",
      discordUsername: "carlos_gaming",
      companyName: "Gaming Zone Server",
      isActive: true,
      registeredAt: "2026-11-12",
    },
    {
      id: "cli-3",
      name: "Laura Martínez",
      email: "laura@tiendavirtual.com",
      role: "CLIENT",
      discordUsername: "laura_m",
      companyName: "E-Commerce Corp",
      isActive: true,
      registeredAt: "2026-11-15",
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.discordUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClientActive = (id: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    setToastMessage("Estado de cliente actualizado.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const changeRole = (id: string, newRole: "CLIENT" | "EMPLOYEE" | "ADMIN") => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, role: newRole } : c))
    );
    setToastMessage(`Rol actualizado a ${newRole}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Administración de Clientes y Usuarios
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control de accesos, roles de usuario (Cliente, Empleado, Admin) y estados de cuenta.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o Discord..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1220] border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Usuario</th>
                <th className="pb-3">Correo</th>
                <th className="pb-3">Comunidad / Empresa</th>
                <th className="pb-3">Rol</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Registro</th>
                <th className="pb-3 pr-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2">
                    <span className="font-bold text-white block">{client.name}</span>
                    {client.discordUsername && (
                      <span className="text-[10px] text-indigo-400 font-mono">
                        @{client.discordUsername}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-300">{client.email}</td>
                  <td className="py-3.5 text-slate-400">
                    {client.companyName || "No especificada"}
                  </td>
                  <td className="py-3.5">
                    <select
                      value={client.role}
                      onChange={(e) => changeRole(client.id, e.target.value as any)}
                      className="px-2.5 py-1 rounded-lg bg-[#111827] border border-slate-700 text-white text-[11px] font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CLIENT">CLIENTE</option>
                      <option value="EMPLOYEE">EMPLEADO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        client.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {client.isActive ? "Activo" : "Desactivado"}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500">{formatDate(client.registeredAt)}</td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => toggleClientActive(client.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800"
                    >
                      {client.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
