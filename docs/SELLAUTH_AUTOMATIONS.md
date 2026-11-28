# SellAuth + Automatizaciones de Axyon

## Estado de esta entrega

Esta rama incorpora la conexión segura con SellAuth y un flujo configurable de comando slash, selección de productos/variantes, cantidades, revisión del staff y creación del cupón.

Incluye:
- API Key cifrada en servidor mediante AES-256-GCM.
- Configuración opcional del slug de tienda mediante `X-STORE`.
- Comprobación de conexión y lectura de catálogo (hasta 100 productos por consulta).
- Productos y variantes del catálogo disponibles en el editor de acciones.
- Disparador de comando slash personalizado, registrado al iniciar el bot.\n- Acción `SELLAUTH_PRODUCT_REQUEST`: selector de catálogo con paginación, selección múltiple y formulario de cantidades.\n- Acción `REQUEST_APPROVAL`: envío a un canal, botones de aprobar/rechazar, roles autorizados, control de doble resolución y persistencia de solicitudes.\n- Acción `SELLAUTH_CREATE_COUPON`: creación del cupón después de la aprobación, usando los productos/variantes seleccionados en el formulario.
- Ámbito de tienda completa o restricción a productos/variantes.
- Código manual o aleatorio, tipo/importe de descuento, límite de usos y caducidad.
- Comprobación de permisos de instancia/suscripción en las rutas del panel.

## Configuración

1. En el Bot Manager, abrir **Integraciones → SellAuth**.
2. Crear una API Key en SellApp con los permisos mínimos:
   - `listing`: leer el catálogo.
   - `coupon`: crear cupones.
3. Introducir la API Key y, opcionalmente, el slug de la tienda (por ejemplo, `mi-tienda`).
4. Guardar y pulsar **Probar conexión**.
5. Abrir **Automatizaciones** y crear un flujo con el disparador **comando personalizado**.\n6. Añadir, en este orden, **SellAuth · Formulario de productos y cantidades**, **Solicitar aprobación del staff** y **SellAuth · Crear cupón**.\n7. En la acción de creación, activar **Utilizar los productos seleccionados por el usuario en el formulario anterior**. Configurar el descuento, límite de usos y caducidad.

La API Key se cifra con la variable de servidor `ENCRYPTION_MASTER_KEY`. No se devuelve al navegador ni se registra en los logs. La misma clave maestra debe estar disponible en el proceso web y en el proceso del bot que comparte la base de datos.

## API utilizada

Base URL: `https://sell.app/api`

- Catálogo: `GET /v2/products?limit=100&with_drafts=true`
- Crear cupón: `POST /v2/coupons`

Se envía `Authorization: Bearer <API_KEY>` y `X-STORE` cuando se ha configurado un slug.

Para limitar el cupón a productos concretos se envía `store_wide: false`, `products: [ids]` y opcionalmente `product_variants: [ids]`. Los identificadores se convierten a números antes de llamar a SellApp.

## Límites funcionales que deben mantenerse claros

- El límite de usos de SellApp limita canjes del cupón; no equivale a una cantidad máxima de unidades por producto dentro de un pedido.
- SellApp aplica el cupón a los productos/variantes seleccionados, pero la API de creación de cupones no ofrece una propiedad para vincular el cupón exclusivamente a un usuario de Discord o a un email. Si se requiere esa garantía, Axyon debe añadir una validación de identidad durante el checkout o el proceso de canje.
- Las cantidades solicitadas se guardan en la solicitud y se muestran al staff para su revisión. El límite de usos de SellApp limita canjes del cupón, no unidades por producto en un pedido; por tanto, la cantidad no se fuerza automáticamente en el checkout.\n- Los comandos slash personalizados se registran al arrancar cada instancia del bot; tras crear o renombrar un comando puede ser necesario reiniciar la instancia para sincronizar los comandos con Discord.

## Seguridad y operación

- No guardar API Keys en `.env`, commits, contenido de automatizaciones ni mensajes de Discord.
- No registrar el cuerpo de autorización ni la clave descifrada.
- Mantener las claves SellApp limitadas a las abilities necesarias y a la tienda correcta.
- Las llamadas tienen timeout de 12 segundos; los errores HTTP se devuelven sin incluir la clave.
- Antes de habilitar una automatización de cupones en producción, probarla con una tienda de pruebas y un producto no publicado.
