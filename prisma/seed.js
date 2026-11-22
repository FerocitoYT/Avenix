const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const OFFICIAL_CATALOG = [
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
        priceCents: 7900,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
      {
        id: "price-bot-advanced",
        name: "Avanzado",
        billingType: "ONE_TIME",
        priceCents: 19900,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
    ],
  },
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
        priceCents: 900,
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
        priceCents: 7000,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
    ],
  },
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
        priceCents: 24900,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
      {
        id: "price-web-ecommerce",
        name: "Tienda Online",
        billingType: "ONE_TIME",
        priceCents: 49900,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: true,
        isAvailable: true,
      },
      {
        id: "price-web-custom-app",
        name: "Aplicaciones Personalizadas",
        billingType: "ONE_TIME",
        priceCents: 79900,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
    ],
  },
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
        priceCents: 599,
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
        priceCents: 1999,
        vatIncluded: true,
        vatRatePercent: 21.0,
        isPopular: false,
        isAvailable: true,
      },
    ],
  },
];

async function main() {
  console.log("Iniciando sembrado del catálogo de Avenix...");

  for (const prod of OFFICIAL_CATALOG) {
    const upsertedProd = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        tagline: prod.tagline,
        description: prod.description,
        features: prod.features,
        isAvailable: prod.isAvailable,
        isFeatured: prod.isFeatured,
        badge: prod.badge,
      },
      create: {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        tagline: prod.tagline,
        description: prod.description,
        category: prod.category,
        features: prod.features,
        isAvailable: prod.isAvailable,
        isFeatured: prod.isFeatured,
        badge: prod.badge,
      },
    });

    for (const p of prod.prices) {
      await prisma.productPrice.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          priceCents: p.priceCents,
          billingType: p.billingType,
          interval: p.interval,
          isPopular: p.isPopular,
          isAvailable: p.isAvailable,
        },
        create: {
          id: p.id,
          productId: upsertedProd.id,
          name: p.name,
          priceCents: p.priceCents,
          billingType: p.billingType,
          interval: p.interval,
          currency: "EUR",
          vatIncluded: p.vatIncluded,
          vatRatePercent: p.vatRatePercent,
          isPopular: p.isPopular,
          isAvailable: p.isAvailable,
        },
      });
    }
  }

  console.log("¡Catálogo sembrado con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
