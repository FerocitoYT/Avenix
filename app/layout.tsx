import {headers,cookies} from "next/headers";
import {LanguageProvider} from "@/components/language-provider";
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
  const h=headers();const saved=cookies().get("axyon_language")?.value;
  const country=(h.get("x-vercel-ip-country")||"").toUpperCase();
  const spanish=new Set(["ES","MX","AR","BO","CL","CO","CR","CU","DO","EC","SV","GQ","GT","HN","NI","PA","PY","PE","PR","UY","VE"]);
  const english=new Set(["US","GB","IE","AU","NZ","CA","JM","TT","BB","BS","BZ","GY","AG","DM","GD","KN","LC","VC"]);
  const preferred=(h.get("accept-language")||"").split(",").map(s=>{const [tag,...params]=s.trim().split(";");const q=params.find(p=>p.trim().startsWith("q="));return {lang:tag.toLowerCase().split("-")[0],q:q?Number(q.trim().slice(2)):1}}).filter(x=>x.q>0&&["es","en"].includes(x.lang)).sort((a,b)=>b.q-a.q)[0]?.lang;
  const lang=saved==="es"||saved==="en"?saved:spanish.has(country)?"es":english.has(country)?"en":preferred==="es"?"es":"en";
  return (
    <html lang={lang} className="dark">
      <body className="font-sans antialiased bg-[#0B1220] text-[#F8FAFC] min-h-screen selection:bg-blue-500/30 selection:text-white">
        <div className="relative flex min-h-screen flex-col">
          <LanguageProvider initialLanguage={lang}>{children}
          <CookieNotice /></LanguageProvider>
        </div>
      </body>
    </html>
  );
}
