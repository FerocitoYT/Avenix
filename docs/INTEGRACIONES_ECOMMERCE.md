# Integraciones ecommerce y API — Axyon Control

## WooCommerce (WordPress)

1. Abre `/dashboard/bots/integraciones` y selecciona un bot con suscripción activa.
2. Introduce nombre de tienda y la URL de webhook del canal Discord.
3. Elige qué eventos de pedidos quieres recibir y guarda.
4. **Copia el secreto de firma antes de salir**: no vuelve a mostrarse.
5. En WordPress → WooCommerce → Ajustes → Avanzado → Webhooks, crea un webhook activo para cada evento:
   - `order.created` (pedido creado)
   - `order.updated` (pedido actualizado)
   - `order.deleted` (pedido eliminado)
6. Usa la URL de entrega generada y el secreto de firma en todos los webhooks de esa tienda.
7. Realiza un pedido de prueba. WooCommerce firmará el cuerpo con HMAC-SHA256 en Base64 y enviará la cabecera `X-WC-Webhook-Signature`.

Los avisos incluyen número de pedido, estado e importe, sin datos personales del comprador. El receptor verifica la firma, el estado de la suscripción y el identificador de entrega. Si Discord falla, responde 503 para permitir reintentos.

## API personalizada

1. Abre `/dashboard/bots/integraciones/api`.
2. Selecciona bot, nombre y webhook de Discord. Guarda y copia el secreto.
3. Envía POST a la URL generada con `Content-Type: application/json`, `X-Axyon-Event-Id` (único por evento) y `X-Axyon-Signature` (hexadecimal HMAC-SHA256 del cuerpo UTF-8 exacto).

Ejemplo Node.js (el secreto debe residir en el servidor emisor, nunca en el navegador):

```js
import { createHmac, randomUUID } from "node:crypto";

const body = JSON.stringify({
  event: "order.paid",
  message: "Nuevo pago recibido",
  reference: "PED-123",
});
const signature = createHmac("sha256", process.env.AXYON_SIGNING_SECRET)
  .update(body).digest("hex");
const response = await fetch(process.env.AXYON_EVENT_URL, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-axyon-event-id": randomUUID(),
    "x-axyon-signature": signature,
  },
  body,
});
if (!response.ok) throw new Error(`Axyon respondió ${response.status}`);
```

## Limitaciones antes de producción masiva

- Esta versión es un **primer conector**. Aún faltan la cola de entregas durable, un sistema de reintentos y límites por cliente, métricas, múltiples tiendas y destinos por bot, y acciones avanzadas sobre roles de Discord.
- Los eventos se entregan mediante webhooks de Discord, no a través del gateway del bot. Por tanto, no requieren reconectar el cliente Discord.
- La configuración se almacena en `Setting` como paso inicial; para un producto multitienda deben crearse modelos dedicados e índices por integración, evento y tenant.
- El secreto se rota al guardar nuevamente. Actualízalo en el emisor.
- No publiques ni envíes los secretos o las URL de webhook a terceros.
