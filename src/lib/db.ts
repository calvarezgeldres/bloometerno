/**
 * db.ts — Cliente de acceso a datos para Bloom Eterno
 * Se comunica con las Vercel API Routes (/api/*) que a su vez usan Neon PostgreSQL.
 * Las credenciales de la base de datos NUNCA llegan al navegador.
 */

const BASE = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Productos ────────────────────────────────────────────────────────────────

export interface DbProduct {
  id: string;
  num: string | null;
  name: string;
  category: string;
  price: number;
  stock: number;
  badge: string | null;
  badge_type: string | null;
  image: string;
  alt: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  category_id: string | null;
  attributes: Record<string, string>;
  variants: DbVariant[];
}

export interface DbVariant {
  id: string;
  product_id: string;
  options: Record<string, string>;
  stock: number;
  price: number | null;
  sort_order: number;
}

/** Variante tal como se envía a la API: sin id (o con un id que la API no conoce) = variante nueva. */
export type DbVariantInput = { id?: string; options: Record<string, string>; stock: number; price: number | null };

export type DbProductInput = Omit<DbProduct, "id" | "created_at" | "is_active" | "variants"> & {
  variants?: DbVariantInput[];
};

export interface DbCategory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  attributes: { id: string; name: string; isVariant: boolean }[];
  sort_order: number;
  product_count: number;
  created_at: string;
}

export type DbCategoryInput = Partial<Pick<DbCategory, "name" | "description" | "image" | "attributes" | "sort_order">>;

export const db = {
  categories: {
    list: (): Promise<DbCategory[]> =>
      apiFetch("/api/categories"),

    create: (data: DbCategoryInput): Promise<DbCategory> =>
      apiFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, updates: DbCategoryInput): Promise<DbCategory> =>
      apiFetch("/api/categories", {
        method: "PATCH",
        body: JSON.stringify({ id, ...updates }),
      }),

    delete: (id: string): Promise<{ ok: boolean }> =>
      apiFetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  products: {
    list: (): Promise<DbProduct[]> =>
      apiFetch("/api/products"),

    create: (data: DbProductInput): Promise<DbProduct> =>
      apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, updates: Partial<DbProductInput & { is_active: boolean }>): Promise<DbProduct> =>
      apiFetch("/api/products", {
        method: "PATCH",
        body: JSON.stringify({ id, ...updates }),
      }),

    delete: (id: string): Promise<{ ok: boolean }> =>
      apiFetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  // ─── Pedidos ────────────────────────────────────────────────────────────────

  orders: {
    list: (): Promise<any[]> =>
      apiFetch("/api/orders"),

    create: (data: Record<string, any>): Promise<any> =>
      apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string): Promise<{ ok: boolean }> =>
      apiFetch("/api/orders", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      }),
  },

  // ─── Mercado Pago ───────────────────────────────────────────────────────────

  mercadopago: {
    createPreference: (data: Record<string, any>): Promise<{ init_point: string; pending_id: string }> =>
      apiFetch("/api/mercadopago", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getStatus: (
      pendingId: string,
      paymentId?: string | null
    ): Promise<{ estado: "pendiente" | "aprobado" | "rechazado"; order: any | null }> =>
      apiFetch(
        `/api/mercadopago?pending=${encodeURIComponent(pendingId)}${paymentId ? `&payment_id=${encodeURIComponent(paymentId)}` : ""}`
      ),
  },

  // ─── Configuración ──────────────────────────────────────────────────────────

  settings: {
    get: (): Promise<any> =>
      apiFetch("/api/settings"),

    update: (data: Record<string, any>): Promise<any> =>
      apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // ─── Autenticación de Administrador ─────────────────────────────────────────

  auth: {
    me: (): Promise<{ authenticated: boolean; username: string | null }> =>
      apiFetch("/api/auth"),

    login: (username: string, password: string): Promise<{ ok: boolean; username: string }> =>
      apiFetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),

    logout: (): Promise<{ ok: boolean }> =>
      apiFetch("/api/auth", { method: "DELETE" }),
  },
};

/** Verifica si la API responde correctamente (para el indicador en el Admin) */
export async function checkApiConnection(): Promise<boolean> {
  try {
    const res = await fetch("/api/products");
    return res.ok;
  } catch {
    return false;
  }
}
