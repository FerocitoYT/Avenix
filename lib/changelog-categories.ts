export const categories={
 welcome:{es:"Bienvenidas y despedidas",en:"Welcome and leave messages"},
 security:{es:"Seguridad, moderación y verificación",en:"Security, moderation and verification"},
 tickets:{es:"Tickets y soporte",en:"Tickets and support"},
 billing:{es:"Facturación, pagos y suscripciones",en:"Billing, payments and subscriptions"},
 account:{es:"Cuenta y acceso",en:"Account and access"},
 notifications:{es:"Notificaciones",en:"Notifications"},
 status:{es:"Estado de servicios",en:"Service status"},
 maintenance:{es:"Mantenimiento e infraestructura",en:"Maintenance and infrastructure"},
 performance:{es:"Rendimiento y sincronización",en:"Performance and synchronization"},
 voice:{es:"Canales de voz",en:"Voice channels"},
 community:{es:"Gestión de comunidades",en:"Community management"},
 privacy:{es:"Privacidad y preferencias",en:"Privacy and preferences"},
 changelogs:{es:"Historial de novedades",en:"Release notes"},
 interface:{es:"Interfaz y navegación",en:"Interface and navigation"},
 database:{es:"Almacenamiento y consistencia de datos",en:"Data storage and consistency"},
 internal:{es:"Componentes internos y estabilidad",en:"Internal components and stability"}
} as const;
export type Category=keyof typeof categories;
