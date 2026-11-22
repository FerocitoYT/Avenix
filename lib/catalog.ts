export interface ProductDefinition {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "DISCORD_BOT" | "WEB_DEVELOPMENT" | "HOSTING_CLOUD" | "AUTOMATION";
  features: string[];
  badge?: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  prices: {
    id: string;
    name: string;
    billingType: "ONE_TIME" | "RECURRING";
    interval?: "MONTH" | "YEAR";
    priceCents: number; // in cents
    vatIncluded: boolean;
    vatRatePercent: number;
    stripePriceId?: string;
    isPopular?: boolean;
    isAvailable: boolean;
  }[];
}

export const OFFICIAL_CATALOG: ProductDefinition[] = [
  // 1. Bots de Discord (Servicio / Desarrollo)
  {
    id: "prod-bot-custom",
    slug: "bots-discord",
    name: "Desarrollo de Bots de Discord",
    tagline: "Sistemas avanzados a medida para comunidades y empresas.",
    description:
      "Desarrollamos bots de Discord robustos, interactivos y completamente adaptados a tu operativa: sistemas de tickets, verificación, economía interna, moderación inteligente e integraciones con tus sistemas.",
    category: "DISCORD_BOT",
    features: [
      "Arquitectura escalable en Node.js / TypeScript",
      "Comandos slash modernos y modales interactivos",
      "Panel web de gestión opcional integrado",
      "Soporte para bases de datos PostgreSQL o Redis",
      "Despliegue y configuración en tus propios servidores o en nuestro Cloud",
    ],
    badge: "Especialidad Avenix",
    isAvailable: true,
    isFeatured: true,
    prices: [
      {
        id: "price-bot-basic",
        name: "Básico",
        billingType: "ONE_TIME",
        priceCents: 7900, // 79 €
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
      {
        id: "price-bot-advanced",
        name: "Avanzado",
        billingType: "ONE_TIME",
        priceCents: 19900, // 199 €
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
    ],
  },

  // 2. Suscripciones Bot Saas (Avenix Bot Starter, Pro, Business)
  {
    id: "prod-bot-subscription",
    slug: "suscripcion-bot",
    name: "Avenix Bot Multiuso (Suscripción)",
    tagline: "El bot todo-en-uno definitivo para tu servidor.",
    description:
      "Automatiza y gestiona tu comunidad sin complicaciones técnicas. Incluye módulos de moderación activa, tickets de soporte personalizables, logs de auditoría y copias de seguridad continuas.",
    category: "DISCORD_BOT",
    features: [
      "99.9% de uptime garantizado en infraestructura dedicada",
      "Panel de control Avenix Control intuitivo",
      "Logs en tiempo real y métricas del servidor",
      "Soporte prioritario 24/7",
    ],
    badge: "Suscripción",
    isAvailable: true,
    isFeatured: true,
    prices: [
      {
        id: "price-bot-monthly",
        name: "Mensual",
        billingType: "RECURRING",
        interval: "MONTH",
        priceCents: 900, // 9,00 €/mes
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
      {
        id: "price-bot-annual",
        name: "Anual (Ahorra 38 €)",
        billingType: "RECURRING",
        interval: "YEAR",
        priceCents: 7000, // 70,00 €/año
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
    ],
  },

  // 3. Desarrollo Web
  {
    id: "prod-web-dev",
    slug: "desarrollo-web",
    name: "Desarrollo Web & Aplicaciones",
    tagline: "Plataformas web de alto rendimiento, seguras y diseñadas para convertir.",
    description:
      "Creamos desde webs corporativas ultrarrápidas hasta tiendas online y plataformas SaaS a medida utilizando Next.js, React, Tailwind CSS y arquitecturas cloud modernas.",
    category: "WEB_DEVELOPMENT",
    features: [
      "Diseño a medida, sin plantillas genéricas",
      "Optimización SEO técnico y Core Web Vitals al máximo",
      "Panel de administración a medida para gestionar contenidos",
      "Cumplimiento normativo RGPD, cookies y accesibilidad",
      "Integración de pasarelas de pago (Stripe, PayPal, Bizum)",
    ],
    badge: "Alta demanda",
    isAvailable: true,
    isFeatured: true,
    prices: [
      {
        id: "price-web-corporate",
        name: "Web Corporativa",
        billingType: "ONE_TIME",
        priceCents: 24900, // 249 €
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
      {
        id: "price-web-ecommerce",
        name: "Tienda Online",
        billingType: "ONE_TIME",
        priceCents: 49900, // 499 €
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
      {
        id: "price-web-custom-app",
        name: "Aplicaciones Personalizadas",
        billingType: "ONE_TIME",
        priceCents: 79900, // 799 €
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
    ],
  },

  // 4. Hosting y Cloud
  {
    id: "prod-hosting-cloud",
    slug: "hosting-cloud",
    name: "Hosting y Cloud Dedicado",
    tagline: "Alojamiento optimizado para bots de Discord y aplicaciones Node.js.",
    description:
      "Servidores de alto rendimiento ubicados en centros de datos europeos con protección anti-DDoS avanzada, monitorización 24/7 y reinicios automáticos en caso de fallo.",
    category: "HOSTING_CLOUD",
    features: [
      "Aislamiento por contenedor (Docker)",
      "Protección Anti-DDoS avanzada L4/L7",
      "Acceso a consola de logs interactiva y métricas en vivo",
      "Copias de seguridad diarias automatizadas",
    ],
    badge: "Cloud Seguro",
    isAvailable: true,
    isFeatured: false,
    prices: [
      {
        id: "price-hosting-bot",
        name: "Hosting de Bots",
        billingType: "RECURRING",
        interval: "MONTH",
        priceCents: 599, // 5,99 €/mes
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
      {
        id: "price-hosting-maintenance",
        name: "Mantenimiento Web",
        billingType: "RECURRING",
        interval: "MONTH",
        priceCents: 1999, // 19,99 €/mes
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
    ],
  },

  // 5. Automatizaciones e Integraciones
  {
    id: "prod-automation",
    slug: "automatizaciones-integraciones",
    name: "Automatizaciones & APIs",
    tagline: "Conecta tus herramientas y elimina tareas repetitivas.",
    description:
      "Diseñamos flujos automatizados que conectan Discord, Stripe, hojas de cálculo, CRMs y bases de datos para optimizar la gestión de tu negocio sin intervención manual.",
    category: "AUTOMATION",
    features: [
      "Sincronización bidireccional mediante Webhooks y REST APIs",
      "Gestión automática de roles y accesos tras el pago",
      "Notificaciones automáticas y alertas en tiempo real",
      "Monitorización y alertas ante fallos de conexión",
    ],
    badge: "A Medida",
    isAvailable: true,
    isFeatured: false,
    prices: [
      {
        id: "price-auto-custom",
        name: "Integración Básica",
        billingType: "ONE_TIME",
        priceCents: 14900, // 149 €
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
      {
        id: "price-auto-enterprise",
        name: "Solución Empresarial",
        billingType: "ONE_TIME",
        priceCents: 39900, // 399 €
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
    ],
  },

  // 6. Próximos lanzamientos (deshabilitados y marcados como Próximamente)
  {
    id: "prod-cloud-vps",
    slug: "servidores-vps",
    name: "Servidores VPS NVMe",
    tagline: "Máquinas virtuales con almacenamiento NVMe de máxima velocidad.",
    description:
      "Lanza tus propios proyectos en servidores privados virtuales de alto rendimiento con IPs dedicadas en Frankfurt y Madrid.",
    category: "HOSTING_CLOUD",
    features: [
      "Almacenamiento NVMe PCIe Gen4",
      "Red de 1 Gbps no medida",
      "Panel de reinstalación instantánea",
    ],
    badge: "Próximamente",
    isAvailable: false, // Marcado como no disponible / Próximamente
    prices: [
      {
        id: "price-vps-proximamente",
        name: "Plan Alpha",
        billingType: "RECURRING",
        interval: "MONTH",
        priceCents: 1499,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isAvailable: false,
      },
    ],
  },
];
