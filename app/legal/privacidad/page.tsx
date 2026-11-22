import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Política de Privacidad (RGPD)",
};

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B1220]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 text-slate-300">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-6">
          Política de Privacidad
        </h1>
        <p className="text-xs text-blue-400 font-medium mb-8">
          Cumplimiento RGPD (UE 2016/679) y LOPD-GDD 3/2018 • Pendiente de revisión jurídica final
        </p>

        <div className="space-y-6 text-sm leading-relaxed border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              1. Responsable del tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos recabados en este sitio web es <strong>Avenix</strong>. Puedes contactar con nuestro delegado de privacidad en: <strong>contacto@avenix.dev</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              2. Finalidad del tratamiento de datos
            </h2>
            <p>Tratamos los datos facilitados por los usuarios con las siguientes finalidades:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Gestión de solicitudes de presupuesto, contratación y emisión de facturas oficiales.</li>
              <li>Creación y mantenimiento de cuentas de usuario en el panel de control <em>Avenix Control</em>.</li>
              <li>Ejecución técnica y entrega de los servicios de desarrollo web y bots de Discord.</li>
              <li>Atención de tickets de soporte e incidencias técnicas.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              3. Base jurídica del tratamiento
            </h2>
            <p>
              La base legal para el tratamiento de tus datos es la ejecución de la relación precontractual o contractual derivada de la solicitud de servicios, así como el consentimiento expreso prestado al registrarte o contactarnos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              4. Conservación y destinatarios de los datos
            </h2>
            <p>
              Los datos se conservarán durante el tiempo necesario para cumplir las obligaciones legales, fiscales y contables. No se cederán datos a terceros salvo imperativo legal o a proveedores de servicios esenciales (Stripe para pasarela de pagos, proveedores cloud con servidores en la Unión Europea).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-display">
              5. Derechos de los usuarios (ARCO)
            </h2>
            <p>
              Cualquier usuario puede ejercitar en cualquier momento sus derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición dirigiéndose por correo a <strong>contacto@avenix.dev</strong> aportando acreditación de su identidad.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
