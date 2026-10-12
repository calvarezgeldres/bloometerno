# Bloom Eterno: contexto de negocio

## Qué es

**Bloom Eterno** es una tienda online chilena que vende **insumos para bisutería artesanal**: piedras naturales, mostacillas, cristales, herramientas y **kits** para crear piezas a mano.

El nombre ("flor eterna") viene de lo que se hace con esos materiales: **flores tejidas con mostacillas** (ramos de lirios, tulipanes, macetas con suculentas) que no se marchitan. En la web aparecen como "Creaciones reales" (fotos en `public/gallery/`). Sirven de inspiración y muestran lo que se puede hacer con los kits.

- **Mercado:** solo Chile. Precios en pesos chilenos (CLP, sin decimales) y RUT del cliente obligatorio.
- **Taller / origen de despachos:** Vitacura, Región Metropolitana (Santiago).
- **Público:** personas que hacen bisutería o manualidades, desde principiantes (con kits) hasta quienes compran insumos sueltos.
- **Tono de marca:** cálido, artesanal, "natural con intención". Todo el texto está en español de Chile y trata al cliente de "tú".

## Catálogo

Las categorías se administran desde el panel. Estas son las iniciales:

| Categoría | Qué incluye |
|---|---|
| Piedras | Cuarzo, ámbar, ojo de tigre… |
| Mostacillas | Decenas de colores y tamaños |
| Cristales | Facetados y brillantes |
| Kits | Todo lo necesario para empezar (ej: kit pulsera floral) |
| Herramientas | Hilos, alambres, cierres, separadores, accesorios |

- Cada categoría define sus **características** (ej: "Calibre", "Color").
- Una característica puede ser **fija** (un solo valor por producto, ej: calibre 0,8 mm) o **de variante**: el cliente elige una opción al comprar (ej: un alambre en Dorado / Plateado / Cobre) y **cada variante tiene su propio stock** y, si se quiere, su propio precio.
- Los productos pueden llevar un badge: "Nuevo", "Más vendido" o "Ed. Limitada".

## Cómo compra un cliente

1. Navega el catálogo y agrega productos al carrito. Si el producto tiene variantes, elige una.
2. En el checkout ingresa sus datos (nombre, **RUT validado**, email, WhatsApp, región, comuna y dirección).
3. Elige la **entrega**:
   - **Despacho a domicilio en Santiago (RM):** $3.990, 24 a 48 h hábiles, con despachador privado.
   - **Otras regiones:** se coordina por WhatsApp y el costo **no** se cobra en la web.
   - **Retiro en el taller de Vitacura:** gratis, previo aviso.
   - Hay un umbral de **despacho gratis** que se configura en el panel (por defecto $35.000).
4. Elige cómo **pagar**:
   - **Transferencia bancaria:** el pedido queda "Pendiente de transferencia". El cliente ve los datos bancarios y envía el comprobante por WhatsApp con un mensaje ya armado.
   - **Mercado Pago (Checkout Pro):** paga con tarjeta u otros medios. El pedido **solo se crea si el pago sale aprobado**, así que no quedan pedidos ni stock "fantasma" por pagos abandonados.

## Operación de la dueña / admin (panel `/admin`)

Requiere usuario y contraseña. Tiene 4 pestañas:

- **Inventario:** crear y editar productos, fotos, precios, stock, variantes y badges, y activar o desactivar productos.
- **Categorías:** crear categorías y sus características.
- **Pedidos:** ver los pedidos con los datos del cliente y avanzarlos por estados:

  ```
  Pendiente de transferencia ──[Confirmar pago recibido]──► Comprobante recibido ─┐
  Pagado con Mercado Pago ─────────────────────────────────────────────────────────┤
                                                                                   ▼
                                         [Iniciar despacho] ─► En preparación ─► Enviado
  (cualquier estado) ─► Anulado
  ```

  Desde un pedido pagado se puede **imprimir una etiqueta de despacho** de 100×150 mm (impresora térmica Phomemo PM-241-BT o similar). La etiqueta no está integrada con couriers: Blue Express o Correos asignan su propio número de seguimiento.
- **Configuración:** datos bancarios que se muestran para la transferencia, email de contacto, número de WhatsApp y umbral de despacho gratis.

## Canales de contacto

- **WhatsApp:** canal principal para comprobantes, coordinación de regiones, retiros y personalización de colores de kits.
- Instagram y email aparecen en la web.

## Estado actual y pendientes conocidos (octubre 2026)

- El sitio está desplegado en Vercel, pero tiene `noindex, nofollow` en `index.html`, así que **todavía no está abierto a buscadores**.
- Los valores por defecto de `store_settings` en `neon/schema.sql` (banco, cuenta, RUT, WhatsApp `+56912345678`) son **de ejemplo**. Los reales se cargan desde el panel.
- **Hay textos de la web que no calzan con lo implementado:**
  - Las FAQ mencionan Webpay y efectivo, pero hoy solo hay transferencia y Mercado Pago.
  - Las FAQ dicen "a regiones 3 a 6 días", pero el despacho a regiones se coordina a mano.
  - Hay un formulario de newsletter que no está conectado a nada.
- Parte del catálogo semilla usa fotos de Unsplash. Las fotos reales se suben desde el panel.
- El diseño visual tomó como referencia el estilo de *Elle Blooming*: verde oliva/bosque, coral/burdeo y crema, con tipografías Playfair Display + Jost.
