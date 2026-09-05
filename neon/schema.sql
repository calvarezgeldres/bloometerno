-- ==============================================================================
-- SCHEMA SQL PARA BLOOM ETERNO (NEON / VERCEL POSTGRES)
-- ==============================================================================
-- Puedes ejecutar este script en la consola de Neon (SQL Editor) en Vercel
-- o en https://console.neon.tech/
-- ==============================================================================

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    num VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 10 CHECK (stock >= 0),
    badge VARCHAR(50),
    badge_type VARCHAR(20),
    image TEXT NOT NULL,
    alt TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_rut VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    shipping_method VARCHAR(100) NOT NULL,
    shipping_cost INTEGER NOT NULL DEFAULT 0,
    subtotal INTEGER NOT NULL,
    total INTEGER NOT NULL,
    payment_method VARCHAR(100) NOT NULL DEFAULT 'Transferencia Bancaria',
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente de transferencia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Tabla de Ítems del Pedido (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Tabla de Configuración de la Tienda
CREATE TABLE IF NOT EXISTS store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    bank_name VARCHAR(100) NOT NULL DEFAULT 'Banco Santander',
    account_type VARCHAR(100) NOT NULL DEFAULT 'Cuenta Corriente',
    account_number VARCHAR(100) NOT NULL DEFAULT '87-65432-1',
    account_rut VARCHAR(20) NOT NULL DEFAULT '76.980.123-K',
    account_holder VARCHAR(255) NOT NULL DEFAULT 'Bloom Eterno SpA',
    contact_email VARCHAR(255) NOT NULL DEFAULT 'pagos@bloometerno.cl',
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '+56912345678',
    free_shipping_threshold INTEGER NOT NULL DEFAULT 35000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Configuración inicial por defecto
INSERT INTO store_settings (id, bank_name, account_type, account_number, account_rut, account_holder, contact_email, whatsapp_number, free_shipping_threshold)
VALUES (
    'default',
    'Banco Santander',
    'Cuenta Corriente',
    '87-65432-1',
    '76.980.123-K',
    'Bloom Eterno SpA',
    'pagos@bloometerno.cl',
    '+56912345678',
    35000
) ON CONFLICT (id) DO NOTHING;

-- 5. Tabla de Usuarios Administradores (login del panel /admin)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Catálogo Semilla Inicial (Seed Data)
INSERT INTO products (num, name, price, stock, category, badge, badge_type, image, alt)
VALUES 
    ('01', 'Mostacilla rosado pálido 2mm', 1490, 25, 'Mostacillas', 'Más vendido', 'hot', 'https://images.unsplash.com/photo-1560847133-e6f64dc352ea?w=600&h=700&fit=crop&auto=format&q=80', 'Mostacillas rosadas ensartadas'),
    ('02', 'Piedra ojo de tigre natural', 3900, 14, 'Piedras', 'Nuevo', 'new', 'https://images.unsplash.com/photo-1766038844075-d997429c85ef?w=600&h=700&fit=crop&auto=format&q=80', 'Piedra ojo de tigre pulida natural'),
    ('03', 'Cristal facetado verde oliva', 2200, 18, 'Cristales', 'Nuevo', 'new', 'https://images.unsplash.com/photo-1556376752-19770d78207f?w=600&h=700&fit=crop&auto=format&q=80', 'Cristales facetados color verde'),
    ('04', 'Kit pulsera floral completo', 8990, 6, 'Kits', 'Ed. Limitada', 'limited', 'https://images.unsplash.com/photo-1660911866937-9399bf71af1e?w=600&h=700&fit=crop&auto=format&q=80', 'Kit completo para pulsera floral'),
    ('05', 'Separadores dorado suave x20', 2490, 30, 'Herramientas', 'Más vendido', 'hot', 'https://images.unsplash.com/photo-1658915250017-bee8f8f0d9a6?w=600&h=700&fit=crop&auto=format&q=80', 'Separadores dorados para bisutería artesanal'),
    ('06', 'Mix mostacillas crema y beige', 3200, 20, 'Mostacillas', NULL, NULL, 'https://images.unsplash.com/photo-1510229955695-588e1612a69b?w=600&h=700&fit=crop&auto=format&q=80', 'Mix de mostacillas en tonos crema'),
    ('07', 'Cuarzo rosa rodado natural', 4500, 8, 'Piedras', 'Nuevo', 'new', 'https://images.unsplash.com/photo-1568551732226-3ad05aac9a76?w=600&h=700&fit=crop&auto=format&q=80', 'Cuarzo rosa rodado sobre superficie natural'),
    ('08', 'Set iniciación bisutería natural', 12900, 4, 'Kits', 'Ed. Limitada', 'limited', 'https://images.unsplash.com/photo-1560847133-95f64e08e02a?w=600&h=700&fit=crop&auto=format&q=80', 'Set completo de iniciación en bisutería natural');
