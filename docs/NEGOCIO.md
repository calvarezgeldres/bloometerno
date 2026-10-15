# Bloom Eterno: contexto de negocio

## Qué es

**Bloom Eterno** es una tienda online chilena que vende **insumos para bisutería artesanal**: piedras naturales, mostacillas, cristales y herramientas para crear piezas a mano.

El nombre ("flor eterna") viene de lo que se hace con esos materiales: **flores tejidas con mostacillas** (ramos de lirios, tulipanes, macetas con suculentas) que no se marchitan. En la web aparecen como "Creaciones reales" (fotos en `public/gallery/`). Sirven de inspiración y muestran lo que se puede hacer con los materiales.

- **Mercado:** solo Chile. Precios en pesos chilenos (CLP, sin decimales) y RUT del cliente obligatorio.
- **Taller / origen de despachos:** Vitacura, Región Metropolitana (Santiago).
- **Público:** personas que hacen bisutería o manualidades, desde principiantes hasta quienes ya tienen experiencia.
- **Tono de marca:** cálido, artesanal, "natural con intención". Todo el texto está en español de Chile y trata al cliente de "tú".

## Catálogo

Las categorías se administran desde el panel. Estas son las iniciales:

| Categoría | Qué incluye |
|---|---|
| Piedras | Cuarzo, ámbar, ojo de tigre… |
| Mostacillas | Decenas de colores y tamaños |
| Cristales | Facetados y brillantes |
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

- **WhatsApp:** canal principal para comprobantes, coordinación de regiones, retiros y personalización de colores.
- Instagram y email aparecen en la web.

## Estado actual y pendientes conocidos (octubre 2026)

- El sitio está desplegado en Vercel, pero tiene `noindex, nofollow` en `index.html`, así que **todavía no está abierto a buscadores**.
- Los valores por defecto de `store_settings` en `neon/schema.sql` (banco, cuenta, RUT, WhatsApp `+56912345678`) son **de ejemplo**. Los reales se cargan desde el panel.
- Hay un formulario de newsletter que no está conectado a nada.
- Las páginas de políticas (`/politica-de-envios`, `/cambios-y-devoluciones`, `/privacidad`) son una propuesta **sin revisión legal**; falta agregar razón social y RUT en privacidad.
- Parte del catálogo semilla usa fotos de Unsplash. Las fotos reales se suben desde el panel.
- Identidad visual: verde `#053C29`, acento dorado `#D9A526`, cursivas de acento `#929F78` y fondo crema `#FFFCF3`, con tipografías Playfair Display + Jost. Logo: isotipo "BE". Referencias de diseño: johnbead.com y kingcrafts.cl.
