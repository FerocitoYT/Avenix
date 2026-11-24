import {CookieSettingsLink} from "@/components/cookie-notice";
import React from "react";
import Link from "next/link";
import { AvenixLogo } from "./brand/logo";
import {
  ShieldCheck,
  Lock,
  Server,
  Mail,
  ExternalLink,
  Bot,
  Globe,
  Cpu,
  Terminal,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#080d17] border-t border-slate-800/80 text-slate-400 text-sm overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <AvenixLogo size="lg" />
            <p className="text-slate-300 font-medium tracking-wide text-sm mt-3">
              Build beyond limits.
            </p>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Soluciones tecnológicas de alto rendimiento. Especialistas en desarrollo
              de bots de Discord avanzados, aplicaciones web escalables y hosting cloud
              dedicado para comunidades y empresas en crecimiento.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Cumplimiento RGPD</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Pagos Seguros Stripe</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Nodos en la UE</span>
              </span>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-display">
              Servicios
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/servicios#discord-bots"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-500/70" />
                  Bots de Discord
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios#desarrollo-web"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-500/70" />
                  Desarrollo Web & Apps
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios#hosting-cloud"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5 text-blue-500/70" />
                  Hosting & Cloud
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios#automatizaciones"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-500/70" />
                  Automatizaciones & APIs
                </Link>
              </li>
              <li>
                <Link
                  href="/precios"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-blue-400 font-medium"
                >
                  <span>Planes & Tarifas</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Plataforma */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-display">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-blue-400 transition-colors"
                >
                  Avenix Control
                </Link>
              </li>
              <li>
                <Link
                  href="/presupuesto"
                  className="hover:text-blue-400 transition-colors"
                >
                  Solicitar Presupuesto
                </Link>
              </li>
              <li>
                <Link
                  href="/proyectos"
                  className="hover:text-blue-400 transition-colors"
                >
                  Portfolio de Proyectos
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="hover:text-blue-400 transition-colors"
                >
                  Contacto & Soporte
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/setup-admin"
                  className="hover:text-slate-500 transition-colors text-xs text-slate-500"
                >
                  Inicialización Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Empresa */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-display">
              Legal & Términos
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/aviso-legal"
                  className="hover:text-blue-400 transition-colors"
                >
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacidad"
                  className="hover:text-blue-400 transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="hover:text-blue-400 transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terminos"
                  className="hover:text-blue-400 transition-colors"
                >
                  Términos de Servicio
                </Link>
              </li>
              <li><Link href="/changelogs" className="hover:text-blue-400 transition-colors">Novedades / Changelogs</Link></li>
              <li><CookieSettingsLink /></li>
              <li className="pt-2 text-xs text-slate-500">
                <span className="block text-slate-400 font-medium">Contacto directo:</span>
                <a
                  href="mailto:contacto@avenix.dev"
                  className="text-blue-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  contacto@avenix.dev
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Avenix. Todos los derechos reservados.
            Hecho con estándares de producción e ingeniería de software moderna.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Precios con 21% IVA incluido</span>
            <span>•</span>
            <span>Madrid & Frankfurt Data Centers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
