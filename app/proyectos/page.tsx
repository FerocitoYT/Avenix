import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import {
  ExternalLink,
  ShieldCheck,
  Bot,
  Globe,
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
} from "lucide-react";

export const metadata = {
  title: "Portfolio de Proyectos Autorizados",
  description:
    "Proyectos y desarrollos autorizados de Avenix Development. Bots de Discord y soluciones web en producción.",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let authorizedProjects: any[] = [];
  try {
    authorizedProjects = await prisma.project.findMany({
      where: {
        isPublicAuthorized: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (err) {
    // Database connection or table pending
    authorizedProjects = [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-tech-grid relative border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Casos de Éxito & Desarrollos
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mt-4 font-display">
            Portfolio de Proyectos
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Explora las plataformas web, bots e integraciones desarrolladas por el equipo de Avenix Development que cuentan con autorización pública.
          </p>
        </div>
      </section>

      {/* Projects Grid or Honest Verified Empty State */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {authorizedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorizedProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/40 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {project.coverImage ? (
                    <div className="h-48 w-full bg-slate-900 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.coverImage}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-slate-900/80 border-b border-slate-800 flex items-center justify-center text-slate-600">
                      <Code2 className="w-12 h-12 text-blue-500/40" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        {project.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {project.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Technologies tags */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.technologies.map((tech: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/60 mt-2">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Visitar proyecto</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Proyecto en infraestructura privada
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-[#111827] border border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-white font-display">
              Compromiso de Privacidad y Confidencialidad
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              En Avenix Development trabajamos bajo estrictos Acuerdos de Confidencialidad (NDA).
              Únicamente exponemos públicamente proyectos que cuentan con el consentimiento expreso de sus propietarios.
            </p>

            <p className="text-slate-400 text-xs leading-relaxed">
              Los nuevos proyectos autorizados se publicarán automáticamente en esta sección una vez completadas las fases de entrega y validación con el cliente.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/presupuesto"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Desarrollar tu proyecto con nosotros</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/servicios"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
              >
                Consultar servicios
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
