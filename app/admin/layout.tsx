"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  ShoppingBag,
  PackageCheck,
  FileCheck2,
  Receipt,
  RotateCw,
  LifeBuoy,
  Server,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.user || data.user.role !== "ADMIN") {
          // If not admin, redirect to regular dashboard
          router.push("/dashboard");
          return;
        }
        setAdminUser(data.user);
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Clientes", href: "/admin/clientes", icon: Users },
    { label: "Catálogo & Precios", href: "/admin/catalogo", icon: ShoppingBag },
    { label: "Pedidos", href: "/admin/pedidos", icon: PackageCheck },
    { label: "Presupuestos", href: "/admin/presupuestos", icon: FileCheck2 },
    { label: "Facturación", href: "/admin/facturacion", icon: Receipt },
    { label: "Suscripciones", href: "/admin/suscripciones", icon: RotateCw },
    { label: "Soporte Tickets", href: "/admin/soporte", icon: LifeBuoy },
    { label: "Infraestructura", href: "/admin/infraestructura", icon: Server },
    { label: "Configuración & Logs", href: "/admin/configuracion", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d17] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
            Verificando permisos de Administrador...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d17] flex flex-col md:flex-row text-slate-200">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B1220] border-r border-indigo-500/20 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <AvenixLogo />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Center</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
          >
            <span>Ir a Panel Cliente</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B1220] border-b border-indigo-500/20 sticky top-0 z-40">
        <AvenixLogo size="sm" />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-400">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
