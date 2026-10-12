-- Migración: foto propia por variante (ej: la foto del alambre en Dorado), para
-- que el cliente vea el color que está eligiendo.
-- Ya está incluida en neon/schema.sql para instalaciones nuevas; este archivo
-- es para copiar/pegar en el SQL Editor de Neon (console.neon.tech) sobre una
-- base de datos que ya existe. Es idempotente: se puede correr más de una vez.

-- NULL = la variante usa la foto principal del producto.
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image TEXT;
