# AVENIX DEVELOPMENT — PLATAFORMA INTEGRAL DE SERVICIOS TECNOLÓGICOS

> **Eslogan:** *Build beyond limits.*  
> **Identidad visual:** Estética tecnológica premium, modo oscuro por defecto (`#0B1220`), azul eléctrico (`#3B82F6`), tipografía moderna y panel de control unificado.

---

## 1. DESCRIPCIÓN DEL PROYECTO

Avenix Development es una plataforma comercial y técnica completa desarrollada desde cero para una empresa especializada en:
- **Desarrollo de bots de Discord personalizados** (moderación, tickets, economía, roles automatizados, bases de datos).
- **Desarrollo web y aplicaciones Next.js** (webs corporativas, tiendas online, plataformas SaaS).
- **Hosting y Cloud dedicado** (alojamiento gestionado de bots en nodos europeos con Anti-DDoS).
- **Automatizaciones e integraciones mediante APIs y Webhooks**.
- **Ecosistema de gestión unificado: Avenix Control**.

No es una maqueta ni una landing page con botones falsos: es una arquitectura real en Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL (Neon ready) y Stripe.

---

## 2. ESTRUCTURA DE RUTAS Y PÁGINAS

### Web Corporativa Pública
- `/`: **Inicio** con Hero corporativo (*"Transformamos tus ideas en soluciones digitales"*), presentación de especialidades, ventajas competitivas reales, proceso de contratación en 4 etapas, catálogo destacado, sección de portfolio con política de privacidad estricta (sin clientes ni testimonios inventados), preguntas frecuentes y footer con desglose de IVA (21%).
- `/servicios`: **Especialidades técnicas** desglosadas con especificaciones, precios base, entregables y FAQs:
  - Bots de Discord
  - Desarrollo Web & Aplicaciones
  - Hosting & Cloud
  - Automatizaciones & APIs
- `/precios`: **Matriz de precios oficiales** con desglose de IVA español (21%) y base imponible. Los productos aún no lanzados aparecen etiquetados como *"Próximamente"* con el pago bloqueado por seguridad.
- `/proyectos`: **Portfolio administrable** con filtro de proyectos que cuentan con autorización expresa del cliente.
- `/presupuesto`: **Configurador interactivo de presupuestos en 4 pasos** (Servicio -> Funcionalidades -> Rango presupuestario -> Datos y descripción). Genera código oficial `PRES-2026-XXXX`.
- `/contacto`: **Formulario de contacto funcional** conectado a base de datos y auditoría de solicitudes.
- `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies`, `/legal/terminos`: **Textos legales adaptados al marco normativo español y europeo (RGPD, LOPD-GDD, LSSI-CE)**.

### Autenticación y Seguridad
- `/auth/login`: Acceso seguro con correo y contraseña o Discord OAuth. Sesión firmada con JWT en cookie HTTP-Only.
- `/auth/register`: Registro de clientes con hashing seguro de contraseñas (`bcryptjs` con 12 rondas de salt).
- `/auth/setup-admin`: **Procedimiento de inicialización segura del primer superadministrador** mediante token secreto `ADMIN_INITIAL_SETUP_TOKEN`. No existen cuentas públicas predeterminadas.

### Avenix Control — Panel del Cliente (`/dashboard`)
- `/dashboard`: Visión general con métricas de servicios activos, pedidos en curso, facturas pendientes, tickets y notificaciones.
- `/dashboard/servicios`: Servicios contratados, identificadores (`AVX-BOT-...`), fecha de alta y renovación.
- `/dashboard/bots`: **Consola interactiva de control de bots**:
  - Estado del bot en tiempo real (*Online*, *Detenido*, *Reiniciando*).
  - Botones funcionales para Iniciar, Detener y Reiniciar la instancia.
  - Consola de logs en vivo con botón para copiar al portapapeles.
  - Métricas reales de consumo (RAM 142 MB / 512 MB, CPU %, Uptime, Ping WebSocket).
  - Editor de configuración: prefijo, color hexadecimal de embeds y activación de módulos.
- `/dashboard/pedidos`: Seguimiento de encargos etapa por etapa (*Pendiente*, *Aceptado*, *En desarrollo*, *Revisión*, *Completado*, *Cancelado*).
- `/dashboard/facturacion`: Facturas con desglose del 21% de IVA, botón de descarga y portal de cliente Stripe.
- `/dashboard/soporte`: Sistema de tickets con mensajes bidireccionales y respuestas del personal.
- `/dashboard/cuenta`: Modificación de datos personales, fiscales (NIF/CIF), contraseña y sesiones activas.

### Panel de Administración (`/admin`)
- `/admin`: Dashboard con KPIs reales (facturación total, MRR mensual recurrente, clientes registrados, servicios en ejecución).
- `/admin/catalogo`: Modificación en vivo de productos, precios en céntimos y estado *"Próximamente"*.
- `/admin/clientes`: Gestión de usuarios, asignación de roles (`CLIENT`, `EMPLOYEE`, `ADMIN`) y activación/desactivación.
- `/admin/presupuestos`: Revisión de solicitudes de clientes, valoración de ofertas y registro de aceptación.
- `/admin/pedidos`: Asignación de desarrolladores y actualización de fases de entrega.
- `/admin/facturacion`: Facturas oficiales correlativas y verificación estricta de pagos mediante Stripe.
- `/admin/suscripciones`: Control de ciclos de facturación, renovaciones y cancelaciones.
- `/admin/soporte`: Bandeja unificada de tickets con respuesta como miembro del staff.
- `/admin/infraestructura`: Monitorización de nodos en Frankfurt y Madrid con estado de contenedores.
- `/admin/configuracion`: Configuración corporativa y registro inmutable de auditoría (`AuditLogs`).

---

## 3. TECNOLOGÍAS UTILIZADAS

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Lenguaje** | TypeScript 5 (Modo estricto) |
| **Estilos** | Tailwind CSS con paleta `#0B1220` y `#111827` |
| **Iconos** | Lucide React |
| **Base de Datos** | PostgreSQL (preparado para Neon Database) |
| **ORM** | Prisma ORM 5.22 |
| **Autenticación** | Sesiones cifradas JWT en cookies `HttpOnly`, `SameSite=Lax` |
| **Cifrado** | `bcryptjs` con 12 rondas de salt |
| **Pagos** | Stripe API v2024-11 (Checkout, Billing Portal y Webhooks firmados) |
| **Validación** | Zod v3 |

---

## 4. INSTALACIÓN Y CONFIGURACIÓN LOCAL

### 1. Clonar el repositorio y entrar en la carpeta
```bash
git clone <url-del-repositorio>
cd Avenix
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` como `.env`:
```bash
cp .env.example .env
```
Edita `.env` e introduce tus claves:
- `DATABASE_URL`: Cadena de conexión PostgreSQL (ej. de Neon con `?sslmode=require`).
- `AUTH_SECRET` / `JWT_SECRET`: Clave aleatoria de más de 32 caracteres.
- `ADMIN_INITIAL_SETUP_TOKEN`: Clave secreta elegida para inicializar el primer administrador.
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`: Claves de Stripe en modo test o live.

### 4. Generar cliente Prisma y desplegar esquema
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Compilar en producción o iniciar modo desarrollo
```bash
# Modo desarrollo:
npm run dev

# Compilación de producción:
npm run build
npm run start
```

---

## 5. INICIALIZACIÓN DEL PRIMER ADMINISTRADOR

Por motivos de seguridad, la plataforma no incluye cuentas de administrador públicas predeterminadas.

Para crear la primera cuenta con rol `ADMIN`:
1. Asegúrate de haber definido `ADMIN_INITIAL_SETUP_TOKEN` en tu `.env`.
2. Dirígete a la ruta: `http://localhost:3000/auth/setup-admin` (o en tu dominio de producción).
3. Introduce el token secreto junto con el nombre, correo y contraseña deseada para el administrador.
4. El sistema creará la cuenta, bloqueará permanentemente el endpoint para evitar futuros registros no autorizados y te dará acceso directo a `/admin`.

---

## 6. DESPLIEGUE EN VERCEL

1. Sube el repositorio a GitHub:
   ```bash
   git add .
   git commit -m "feat: Avenix Development enterprise production platform"
   git remote add origin <tu-repositorio-github>
   git push -u origin main
   ```
2. Importa el repositorio en [Vercel](https://vercel.com).
3. Añade las variables de entorno de tu `.env` en el panel de Vercel.
4. Pulsa **Deploy**.
