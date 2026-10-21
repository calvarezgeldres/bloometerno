-- Migración: SKU por variante y SKU de producto más largo.
-- El SKU del producto se guarda en products.num (el "Código" que muestra la
-- tienda); se amplía a 64 caracteres porque los SKU de proveedor pueden ser
-- largos (ej: "81201010-00"). Cada variante (ej: un color) puede tener su SKU.
-- Ya está incluida en neon/schema.sql para instalaciones nuevas; este archivo
-- es para copiar/pegar en el SQL Editor de Neon sobre una base que ya existe.
-- Es idempotente: se puede correr más de una vez.

ALTER TABLE products ALTER COLUMN num TYPE VARCHAR(64);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sku VARCHAR(64);
