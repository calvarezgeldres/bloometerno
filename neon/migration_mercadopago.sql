-- Migración para habilitar Mercado Pago en Bloom Eterno.
-- Ya está incluida en neon/schema.sql para instalaciones nuevas; este archivo
-- es para copiar/pegar en el SQL Editor de Neon (console.neon.tech) sobre una
-- base de datos que ya existe.

CREATE TABLE IF NOT EXISTS mp_pending_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado')),
    mp_preference_id TEXT,
    mp_payment_id TEXT,
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
