# Integraciones ecommerce y API — Axyon Control

## WooCommerce (WordPress)

1. Abre `/dashboard/bots/integraciones` y selecciona un bot con suscripción activa. Puedes registrar hasta 10 tiendas WooCommerce independientes por bot.
2. Introduce nombre de tienda y la URL de webhook del canal Discord.
3. Elige qué eventos de pedidos quieres recibir, personaliza el título y define un importe mínimo opcional; después guarda.
4. **Copia el secreto de firma antes de salir**: no vuelve a mostrarse.
5. En WordPress → WooCommerce → Ajustes → Avanzado → Webhooks, crea un webhook activo para cada evento:
   - `order.created` (pedido creado)
   - `order.updated` (pedido actualizado)
   - `order.deleted` (pedido eliminado)
6. Usa la URL de entrega generada y el secreto de firma en todos los webhooks de esa tienda.
7. Realiza un pedido de prueba. WooCommerce firmará el cuerpo con HMAC-SHA256 en Base64 y enviará la cabecera `X-WC-Webhook-Signature`.
8. Revisa `/dashboard/bots/integraciones/historial` para ver la cola de entregas y los errores. Puedes reintentar manualmente las que alcancen el estado `FAILED`.

Los avisos incluyen número de pedido, estado e importe, sin datos personales del comprador. El receptor verifica firma y suscripción, guarda el evento en Neon y devuelve HTTP 202. El worker de Axyon-Bot envía la notificación y reintenta errores con backoff exponencial (máximo 8 intentos). Las entregas son al menos una vez y pueden repetirse si Discord acepta el mensaje pero el proceso termina antes de marcarlo como entregado.

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

- Esta versión es un **conector inicial con cola durable**, reintentos y hasta 10 tiendas por bot. Aún faltan límites de volumen por suscripción, métricas avanzadas, destinos múltiples por tienda, configuración completa de condiciones y acciones sobre roles de Discord.
- Los eventos se entregan mediante webhooks de Discord, no a través del gateway del bot. Cambiar reglas de tiendas no requiere reconectar el cliente Discord; desplegar código nuevo en Discloud sí puede reiniciar el proceso.
- La configuración de tiendas continúa en `Setting` como fase de compatibilidad. La cola tiene su propio modelo `IntegrationDelivery` e índices; sería recomendable crear modelos dedicados para cada tienda, reglas y destinos antes de escalar a miles de tiendas.
- Editar reglas **no rota** el secreto; puedes optar por regenerarlo explícitamente y tendrás que actualizarlo en WooCommerce.
- No publiques ni envíes los secretos o las URL de webhook a terceros.
