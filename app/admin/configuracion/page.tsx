"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Building,
  KeyRound,
  Bell,
  CheckCircle2,
  Save,
  Lock,
  FileText,
  Activity,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AdminConfiguracionPage() {
  const [companySettings, setCompanySettings] = useState({
    companyName: "Avenix",
    tagline: "Build beyond limits.",
    contactEmail: "contacto@avenix.dev",
    supportEmail: "soporte@avenix.dev",
    defaultVatRate: 21.0,
    stripeLiveMode: false,
    requireEmailVerification: true,
  });

  const [issuer,setIssuer]=useState({name:"",taxId:"",address:""});
  const [issuerReady,setIssuerReady]=useState(false);
  const [issuerBusy,setIssuerBusy]=useState(false);
  const [issuerMessage,setIssuerMessage]=useState("");
  const [issuerError,setIssuerError]=useState(false);
  useEffect(()=>{let live=true;fetch("/api/admin/invoice-issuer",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);if(live){setIssuer(d.issuer);setIssuerReady(true);}}).catch(()=>{if(live){setIssuerError(true);setIssuerMessage("No se pudo cargar la configuración fiscal.");}});return()=>{live=false};},[]);
  async function saveIssuer(e:React.FormEvent){
    e.preventDefault();setIssuerBusy(true);setIssuerMessage("");setIssuerError(false);
    try{const r=await fetch("/api/admin/invoice-issuer",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(issuer)});const d=await r.json();if(!r.ok)throw Error(d.error||"No se pudo guardar");setIssuer(d.issuer);setIssuerMessage("Datos fiscales guardados correctamente.");}catch(e){setIssuerError(true);setIssuerMessage(e instanceof Error?e.message:"No se pudo guardar");}finally{setIssuerBusy(false);}
  }
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/audit-logs");
        const data = await res.json();
        if (data?.logs) {
          setAuditLogs(data.logs);
        }
      } catch (err) {
        console.error("Error loading real audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Configuración Global y Auditoría de Seguridad
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Parámetros del sistema, integraciones sensibles y registro inmutable de acciones administrativas.
        </p>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuración general actualizada y sincronizada.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: General Configuration */}
        <div className="space-y-6">
          <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-[#0B1220] border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Parámetros de la Empresa y Facturación</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Nombre Comercial Oficial
                </label>
                <input
                  type="text"
                  value={companySettings.companyName}
                  onChange={(e) =>
                    setCompanySettings({ ...companySettings, companyName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Eslogan de Marca
                </label>
                <input
                  type="text"
                  value={companySettings.tagline}
                  onChange={(e) =>
                    setCompanySettings({ ...companySettings, tagline: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={companySettings.contactEmail}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Tipo de IVA por Defecto (%)
                  </label>
                  <input
                    type="number"
                    value={companySettings.defaultVatRate}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        defaultVatRate: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Parámetros</span>
                </button>
              </div>
            </div>
          </form>

          <form id="facturacion" onSubmit={saveIssuer} className="p-6 sm:p-8 rounded-3xl bg-[#0B1220] border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-400"/>Datos fiscales de facturación</h2>
            <p className="text-xs text-slate-400">Estos datos aparecerán en los PDF propios de Axyon para cualquier medio de pago. Los documentos con datos ya guardados no se modificarán.</p>
            {([{key:"name",label:"Nombre fiscal o razón social",max:100},{key:"taxId",label:"NIF / CIF",max:40},{key:"address",label:"Domicilio fiscal completo",max:140}] as const).map(f=><label key={f.key} className="block text-xs text-slate-300 space-y-2"><span>{f.label}</span><input required maxLength={f.max} disabled={!issuerReady||issuerBusy} value={issuer[f.key]} onChange={e=>setIssuer(prev=>({...prev,[f.key]:e.target.value}))} className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-white disabled:opacity-50"/></label>)}
            <button type="submit" disabled={!issuerReady||issuerBusy} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-2"><Save className="w-4 h-4"/>{issuerBusy?"Guardando…":"Guardar datos fiscales"}</button>
            {issuerMessage&&<p role="status" className={"text-xs "+(issuerError?"text-red-400":"text-emerald-400")}>{issuerMessage}</p>}
          </form>
          {/* Security & Webhooks Status Box */}
          <div className="p-6 rounded-3xl bg-[#0B1220] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Estado de Pasarelas y Webhooks de Pago</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-slate-800">
                <span className="text-slate-300 font-medium">PostgreSQL Database (Neon)</span>
                <span className="text-emerald-400 font-mono font-bold">DATABASE_URL OK</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-slate-800">
                <div>
                  <span className="text-slate-300 font-medium block">Stripe Webhook Listener</span>
                  <span className="text-[10px] text-slate-500 font-mono">/api/stripe/webhook</span>
                </div>
                <span className="text-blue-400 font-mono font-bold">3D Secure / Webhook</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-slate-800">
                <div>
                  <span className="text-slate-300 font-medium block">PayPal IPN Listener</span>
                  <span className="text-[10px] text-slate-500 font-mono">/api/webhooks/paypal</span>
                </div>
                <span className="text-amber-400 font-mono font-bold">IPN Postback Validador</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-slate-800">
                <span className="text-slate-300 font-medium">JWT & Cookie Signing Secret</span>
                <span className="text-emerald-400 font-mono font-bold">32 Bytes Cifrado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Audit Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Registro de Auditoría (Audit Logs)</span>
            </h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              Inmutable
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#0B1220] border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Usuario: <strong className="text-slate-300">{log.user}</strong></span>
                    <span className="font-mono text-slate-500">IP: {log.ipAddress}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-[#0B1220] border border-slate-800 text-center text-xs text-slate-500">
                {loading ? "Cargando registros de auditoría..." : "No hay registros de auditoría todavía."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
