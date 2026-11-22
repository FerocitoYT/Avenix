import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Términos y Condiciones de Servicio",
};

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 text-slate-300">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-6">
          Términos de Servicio y Contratación
        </h1>
        <p className="text-xs text-blue-400 font-medium mb-8">
          Vigente desde Noviembre 2026 • Pendiente de revisión jurídica final
        </p>

        <div className="space-y-6 text-sm leading-relaxed border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              1. Aceptación de los términos
            </h2>
            <p>
              La contratación de cualquier servicio o producto (incluyendo bots de Discord, webs, hosting o suscripciones) a través de Avenix Development implica la aceptación íntegra de las presentes condiciones contractuales.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              2. Precios e Impuestos
            </h2>
            <p>
              Todos los precios fijados en el catálogo y en las propuestas presupuestarias incluyen el tipo impositivo del Impuesto sobre el Valor Añadido (IVA del 21% aplicable en España), salvo indicación contraria para operaciones B2B intracomunitarias o extracomunitarias con inversión de sujeto pasivo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              3. Condiciones de entrega y revisiones
            </h2>
            <p>
              El desarrollo comenzará tras la formalización del presupuesto o el pago inicial establecido. El cliente dispondrá de un periodo de revisión para verificar que el software se ajusta a las especificaciones pactadas. No se considerarán defectos modificaciones solicitadas que excedan el alcance del presupuesto aprobado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              4. Suscripciones y cancelaciones
            </h2>
            <p>
              Las suscripciones mensuales de hosting o bots se renuevan de forma recurrente al término de cada periodo mensual a través de Stripe. El cliente puede cancelar la renovación en cualquier momento antes de la fecha de corte desde su panel de facturación en Avenix Control, manteniendo el servicio activo hasta el fin del ciclo ya abonado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              5. Cumplimiento con las políticas de Discord
            </h2>
            <p>
              Todos los bots desarrollados se programan de conformidad estricta con las Políticas para Desarrolladores y Términos de Servicio de Discord. Queda prohibido solicitar o utilizar bots para fines contrarios a la ley, spam masivo, actividades de raid o vulneración de derechos de terceros.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
