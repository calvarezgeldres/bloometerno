/**
 * db.ts — Cliente de acceso a datos para Bloom Eterno
 * Se comunica con las Vercel API Routes (/api/*) que a su vez usan Neon PostgreSQL.
 * Las credenciales de la base de datos NUNCA llegan al navegador.
 */

const BASE = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
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
}

export const db = {
  products: {
    list: (): Promise<DbProduct[]> =>
      apiFetch("/api/products"),

    create: (data: Omit<DbProduct, "id" | "created_at" | "is_active">): Promise<DbProduct> =>
      apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, updates: Partial<Omit<DbProduct, "id" | "created_at">>): Promise<DbProduct> =>
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
