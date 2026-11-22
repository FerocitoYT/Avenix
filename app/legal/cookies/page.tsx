import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Política de Cookies",
};

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 text-slate-300">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-6">
          Política de Cookies
        </h1>
        <p className="text-xs text-blue-400 font-medium mb-8">
          Conforme a la directiva ePrivacy y el RGPD • Pendiente de revisión jurídica final
        </p>

        <div className="space-y-6 text-sm leading-relaxed border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              1. ¿Qué son las cookies?
            </h2>
            <p>
              Una cookie es un pequeño archivo que se descarga en tu navegador web al acceder a determinadas páginas. Permiten a una web, entre otras cosas, recordar tu sesión activa y mantener la seguridad del panel Avenix Control.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              2. Cookies utilizadas en Avenix Development
            </h2>
            <p>
              En nuestra plataforma priorizamos la mínima recopilación de datos y la privacidad del usuario:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                <strong>Cookies técnicas estrictamente necesarias:</strong> gestionan la autenticación segura mediante cookies cifradas HTTP-only (evitando accesos no autorizados mediante scripts XSS).
              </li>
              <li>
                <strong>Cookies de Stripe:</strong> necesarias para la prevención del fraude y la ejecución segura de pagos y suscripciones en el checkout.
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-400">
              No utilizamos cookies invasivas de rastreo publicitario entre sitios ni comercializamos perfiles de navegación de nuestros usuarios con terceras empresas.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              3. Configuración y desactivación en el navegador
            </h2>
            <p>
              Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones de tu navegador web (Chrome, Firefox, Safari, Edge). Ten en cuenta que si bloqueas las cookies técnicas esenciales, el acceso a tu área privada de cliente en Avenix Control no podrá funcionar.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
