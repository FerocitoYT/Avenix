import {CookieNotice} from "@/components/cookie-notice";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Avenix | Build beyond limits",
    template: "%s | Avenix",
  },
  description:
    "Desarrollo profesional de bots de Discord personalizados, aplicaciones web de alto rendimiento, hosting cloud optimizado y automatizaciones para comunidades y empresas.",
  keywords: [
    "Avenix",
    "Bots de Discord personalizados",
    "Desarrollo web Next.js",
    "Hosting bots Discord",
    "Automatizaciones API",
    "Software a medida",
    "Avenix Control",
  ],
  authors: [{ name: "Avenix Team" }],
  creator: "Avenix",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    title: "Avenix — Build beyond limits",
    description:
      "Transformamos tus ideas en soluciones digitales. Bots de Discord a medida, plataformas web modernas y hosting de alta disponibilidad.",
    siteName: "Avenix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Avenix — Build beyond limits",
    description:
      "Transformamos tus ideas en soluciones digitales. Bots de Discord a medida, plataformas web modernas y hosting de alta disponibilidad.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="font-sans antialiased bg-[#0B1220] text-[#F8FAFC] min-h-screen selection:bg-blue-500/30 selection:text-white">
        <div className="relative flex min-h-screen flex-col">
          {children}
          <CookieNotice />
        </div>
      </body>
    </html>
  );
}
