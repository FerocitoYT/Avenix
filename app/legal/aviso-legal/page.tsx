import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Aviso Legal",
};

export default function AvisoLegalPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 text-slate-300">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-6">
          Aviso Legal
        </h1>
        <p className="text-xs text-blue-400 font-medium mb-8">
          Última actualización: Noviembre 2026 • Documento pendiente de revisión jurídica final
        </p>

        <div className="space-y-6 text-sm leading-relaxed border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              1. Datos identificativos del titular
            </h2>
            <p>
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos de la entidad titular de la presente plataforma:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Denominación comercial: <strong>Avenix Development</strong></li>
              <li>Actividad: Desarrollo de software, bots de Discord, soluciones web y alojamiento en la nube</li>
              <li>Correo electrónico de contacto: <strong>contacto@avenix.dev</strong></li>
              <li>Sitio web: <strong>https://avenix.dev</strong></li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              2. Objeto y ámbito de aplicación
            </h2>
            <p>
              El presente Aviso Legal regula el acceso, navegación y uso del sitio web de Avenix Development, así como las responsabilidades derivadas del uso de sus contenidos, marcas, código fuente y servicios asociados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              3. Propiedad intelectual e industrial
            </h2>
            <p>
              Todos los contenidos de esta web, incluyendo pero no limitándose a textos, logotipos vectoriales, diseños gráficos, código fuente en TypeScript, estilos CSS y bases de datos, son titularidad exclusiva de Avenix Development o de terceros que han autorizado su uso, quedando expresamente prohibida su reproducción, distribución o transformación sin autorización previa por escrito.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              4. Limitación de responsabilidad
            </h2>
            <p>
              Avenix Development no se hace responsable de los daños derivados de caídas imprevistas de redes de telecomunicaciones, ataques informáticos externos que superen los estándares razonables de seguridad o del uso indebido que terceros hagan de los bots o aplicaciones desarrolladas una vez entregadas al cliente.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
