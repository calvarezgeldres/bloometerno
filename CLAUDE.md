# Bloom Eterno: contexto técnico

Tienda online chilena de **insumos para bisutería** (piedras, mostacillas, cristales, kits, herramientas), con panel de administración propio. Si necesitas el contexto de negocio (qué se vende, cómo compra el cliente, estados de pedido, pendientes), está en **[docs/NEGOCIO.md](docs/NEGOCIO.md)**: léelo primero.

Todo el código, los comentarios, los commits y la UI están en **español de Chile**. Mantén ese idioma.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 6 + TypeScript, SPA con `react-router` v7 |
| Estilos | Tailwind CSS 4 + CSS variables en `src/styles/theme.css`. Muchos componentes usan `style={{}}` inline con `var(--...)` |
| UI kit | Componentes estilo shadcn/ui en `src/app/components/ui/` (Radix), `lucide-react` para íconos, `sonner` para toasts |
| Backend | Vercel Serverless Functions en `/api/*.ts` (`@vercel/node`) |
| Base de datos | **Neon** (Postgres serverless) vía `@neondatabase/serverless`, con queries SQL directas en tagged templates. Sin ORM |
| Imágenes | **Vercel Blob**: el navegador sube directo, con token emitido por `/api/upload` |
| Pagos | **Mercado Pago Checkout Pro** (REST, sin SDK) + transferencia bancaria manual |
| Hosting | Vercel. **Push a `main` = deploy a producción** |

Origen: el proyecto nació como export de **Figma Make** (por eso existen `guidelines/`, `ATTRIBUTIONS.md`, `default_shadcn_theme.css` y el plugin `figmaAssetResolver` en `vite.config.ts`). Hay dependencias heredadas que casi no se usan (MUI, react-slick, react-dnd, recharts…).

## Estructura

```
api/                      Funciones serverless (una por archivo = un endpoint)
  auth.ts                 GET sesión · POST login · DELETE logout
  products.ts             GET público (activos + variantes) · POST/PATCH/DELETE admin
  categories.ts           CRUD de categorías y sus características (admin para escribir)
  orders.ts               POST público (crea pedido por transferencia y descuenta stock) · GET/PATCH admin
  mercadopago.ts          POST crea preferencia · POST ?webhook=1 · GET ?pending= (polling)
  settings.ts             Config de la tienda (datos bancarios, WhatsApp, despacho gratis)
  upload.ts               Token de subida a Vercel Blob (solo admin)
src/
  main.tsx, app/App.tsx   Entrada y rutas
  app/context/StoreContext.tsx   Estado global: catálogo, carrito, pedidos, settings, auth admin
  app/pages/              StorePage (/), Productos, Kits, Nosotros, Contacto, Admin, PagoResultado, PagoError
  app/components/         Secciones de la landing, CartDrawer, CheckoutModal, EtiquetaDespachoModal
  app/components/admin/   CategoriesManager, ProductAttributesEditor (variantes), ImageUploader
  app/data/chileData.ts   Regiones/comunas de Chile y métodos de despacho (costos hardcodeados)
  app/types/store.ts      Tipos de dominio (Product, Category, ProductVariant, Order, StoreSettings…)
  lib/db.ts               Cliente HTTP del frontend hacia /api (fetch con credentials)
  lib/catalog.ts          Helpers de variantes (precio, etiqueta, stock)
  lib/imageUpload.ts      Valida, redimensiona y convierte a WebP en el navegador; luego sube a Blob
  lib/rut.ts              Validación (módulo 11) y formato del RUT chileno
neon/
  schema.sql              Esquema completo + seed (para una BD nueva)
  migration_*.sql         Migraciones incrementales idempotentes (para una BD existente)
scripts/create-admin-user.mjs   Crea o actualiza un usuario de /admin
supabase/                 LEGACY: el proyecto migró de Supabase a Neon. No se usa
public/                   Logos y galería de "creaciones reales" (webp)
logos/                    Archivos fuente del logo (no se sirven)
```

## Modelo de datos (Neon)

- `products`: precio y stock en **INTEGER (CLP)**. `category` (texto) se mantiene **sincronizado** con `category_id` (FK). `attributes` JSONB guarda las características fijas `{ "<idCaracterística>": "valor" }`. `is_active` sirve de borrado lógico.
- `categories`: `attributes` JSONB `[{ id, name, isVariant }]` define qué características tienen sus productos.
- `product_variants`: una fila por combinación de opciones `{ "<idCaracterística>": "Dorado" }`, con stock propio, `price` opcional (NULL = usa el precio del producto) e `image` opcional (NULL = usa la foto del producto; helper `variantImage` en `src/lib/catalog.ts`). **Si un producto tiene variantes, `products.stock` es la suma del stock de sus variantes** (lo recalcula `syncVariants` en `api/products.ts`).
- `orders` + `order_items`: los ítems guardan copia de nombre, precio, imagen y `variant_label`, para que el historial sobreviva si se borra el producto o la variante. `status` es texto libre, validado contra una lista en `api/orders.ts` (ver estados en `src/app/types/store.ts`).
- `store_settings`: una sola fila con `id = 'default'`.
- `admin_users`: contraseñas con `scrypt` en formato `salt:hash`.
- `mp_pending_orders`: puente para Mercado Pago (ver abajo).

## Flujos clave

**Auth admin.** Usa una cookie `bloom_admin_session` (HttpOnly, 8 h) con payload base64url firmado con HMAC-SHA256 usando `SESSION_SECRET`. No hay JWT ni librería de auth. Cada función de `/api` que escribe valida la cookie con su propia copia de `requireAuth`.

**Pago con transferencia.** `POST /api/orders` crea el pedido en estado "Pendiente de transferencia" y **descuenta stock de inmediato**. Luego el admin confirma el pago a mano.

**Pago con Mercado Pago.**
1. `POST /api/mercadopago` guarda el carrito completo en `mp_pending_orders.payload` y crea la preferencia con `external_reference = pendingId` y `back_urls` hacia `/pago-resultado?pending=…`.
2. El pedido real se crea **solo cuando el pago está `approved`**, en `resolvePayment()`. Esa función es idempotente y la llaman dos caminos: el webhook (`?webhook=1`, que puede tardar minutos) y el polling de `/pago-resultado`, que trae el `payment_id` en la URL de retorno y verifica al instante.
3. Nunca se confía en el body del webhook: siempre se vuelve a consultar el pago en la API de MP con el access token.

**Imágenes.** `ImageUploader` valida el peso, las medidas mínimas y la proporción (las reglas están en `IMAGE_RULES`), achica y convierte a WebP en el navegador, y sube directo a Vercel Blob. `/api/upload` solo emite el token, con tipo y tamaño acotados.

**Fallback a localStorage.** `StoreContext` persiste productos, carrito, pedidos y settings en `localStorage`. Si `/api` no responde, la tienda sigue funcionando con datos locales y semilla (`isCloudConnected = false`). Ojo: esto puede ocultar errores de API mientras se desarrolla.

## Reglas importantes (aprendidas a golpes)

1. **Los archivos de `/api` deben ser 100 % autocontenidos: nada de imports relativos** entre ellos ni hacia `src/`. Esto rompió dos veces el bundling de Vercel (`FUNCTION_INVOCATION_FAILED`, commits `8d2c3c1` y `9857f5d`). Por eso `getDb`, `parseCookies`, `requireAuth`, etc. están **duplicados a propósito** en cada archivo. No los "refactorices" a un módulo compartido.
2. **Secretos nunca con prefijo `VITE_`.** `DATABASE_URL`, `SESSION_SECRET`, `MERCADOPAGO_ACCESS_TOKEN` y `BLOB_READ_WRITE_TOKEN` son solo del servidor. La única variable pública es `VITE_MERCADOPAGO_PUBLIC_KEY`.
3. **Migraciones de BD:** no hay herramienta de migraciones. Para cambiar el esquema:
   - Crea `neon/migration_<nombre>.sql` **idempotente** (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).
   - Replica el cambio al final de `neon/schema.sql`.
   - **Córrela a mano en el SQL Editor de Neon ANTES de hacer push**, porque push a main despliega y el código nuevo fallaría contra la BD vieja.
4. **Montos en CLP como enteros.** Sin decimales y sin floats. Para mostrarlos se formatean con separador de miles.
5. **Neon no soporta `SET` dinámico** con tagged templates. Por eso los PATCH actualizan campo por campo con una whitelist (ver `api/products.ts`). Sigue ese patrón; no armes SQL con strings concatenados.
6. Al descontar stock de un producto con variantes, se descuenta de la **variante** y luego se recalcula el total del producto.
7. Valida el RUT con `isValidRut` de `src/lib/rut.ts` en cualquier formulario nuevo que lo pida.

## Desarrollo local

```bash
npm install
npm run dev          # solo Vite (http://localhost:5173). Las funciones /api NO corren acá
```

- Con `npm run dev` las llamadas a `/api` fallan y la app usa el **fallback de localStorage**. Sirve para trabajar UI.
- Para probar el backend real hay que usar `vercel dev` (Vercel CLI, `npm i -g vercel` y `vercel link`), con un `.env` que tenga `DATABASE_URL` apuntando a una **branch de desarrollo de Neon** (no a producción).
- Las variables de entorno están documentadas en `.env.example`. Las reales viven en Vercel → Project Settings → Environment Variables. **No se commitean.**
- Para crear el primer admin: `node --env-file=.env scripts/create-admin-user.mjs <usuario> <contraseña>`.
- Para Mercado Pago en local se necesitan credenciales de prueba y un `SITE_URL` público (ej. ngrok) para recibir el webhook. Aun sin webhook, el retorno con `payment_id` igual confirma el pago.

No hay tests, linter ni CI configurados. Antes de hacer push, verifica al menos que `npm run build` compile.

## Convenciones

- Commits en español con prefijo tipo Conventional Commits: `feat:`, `fix:`, `refactor:`.
- Los comentarios explican el **porqué** (hay varios ejemplos largos en `api/mercadopago.ts` y `api/products.ts`). Mantén ese estilo.
- Los componentes grandes (`AdminPage.tsx` ~1400 líneas, `CheckoutModal.tsx` ~950, `AdminModal.tsx` ~1000) están en un solo archivo. Si los tocas mucho, conviene extraer subcomponentes a `components/admin/`.
- Las rutas nuevas de la SPA van en `src/app/App.tsx`. `vercel.json` ya reescribe todo lo que no es `/api` hacia `index.html`.
