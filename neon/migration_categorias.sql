-- Migración: categorías administrables, características por categoría y
-- variantes de producto (ej: un alambre con varios colores, cada uno con su stock).
-- Ya está incluida en neon/schema.sql para instalaciones nuevas; este archivo
-- es para copiar/pegar en el SQL Editor de Neon (console.neon.tech) sobre una
-- base de datos que ya existe. Es idempotente: se puede correr más de una vez.

-- 1. Categorías. "attributes" son las características que se cargan en cada
-- producto de la categoría: [{ "id": "...", "name": "Color", "isVariant": true }].
-- isVariant = true significa que el producto puede tener varias opciones de esa
-- característica y el cliente elige una al comprar (cada opción con su stock).
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    attributes JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Productos: vínculo a la categoría + valores de las características fijas
-- ({ "<id característica>": "valor" }). La columna "category" (texto) se
-- mantiene sincronizada con el nombre de la categoría.
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 3. Variantes: una fila por combinación de opciones ({ "<id característica>": "Dorado" }).
-- price NULL = usa el precio del producto. Si un producto tiene variantes, su
-- stock es la suma del stock de sus variantes.
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    price INTEGER CHECK (price >= 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON product_variants(product_id);

-- 4. Ítems de pedido: qué variante se compró (con una copia del texto, por si
-- después se borra la variante).
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_label TEXT;

-- 5. Categorías iniciales (las que ya mostraba la portada).
INSERT INTO categories (name, description, image, sort_order) VALUES
    ('Piedras', 'Cuarzo, ámbar, ojo de tigre', 'https://images.unsplash.com/photo-1560427450-00fa9481f01e?w=900&h=1100&fit=crop&auto=format&q=80', 1),
    ('Mostacillas', 'Decenas de colores y tamaños', 'https://images.unsplash.com/photo-1560847133-e6f64dc352ea?w=600&h=500&fit=crop&auto=format&q=80', 2),
    ('Cristales', 'Facetados y brillantes', 'https://images.unsplash.com/photo-1556376752-19770d78207f?w=600&h=500&fit=crop&auto=format&q=80', 3),
    ('Kits', 'Para empezar a crear hoy', 'https://images.unsplash.com/photo-1660911866937-9399bf71af1e?w=600&h=500&fit=crop&auto=format&q=80', 4),
    ('Herramientas', 'Hilos, cierres y accesorios', 'https://images.unsplash.com/photo-1658915250017-bee8f8f0d9a6?w=600&h=500&fit=crop&auto=format&q=80', 5)
ON CONFLICT (name) DO NOTHING;

-- Cualquier otra categoría que ya usen los productos existentes
INSERT INTO categories (name, sort_order)
SELECT DISTINCT p.category, 100 FROM products p
WHERE p.category IS NOT NULL AND p.category <> ''
ON CONFLICT (name) DO NOTHING;

-- Vincular los productos existentes a su categoría
UPDATE products p SET category_id = c.id
FROM categories c
WHERE p.category_id IS NULL AND c.name = p.category;
