import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, CartItem, Order, StoreSettings, Category, ProductVariant } from "../types/store";
import { db, DbProductInput } from "../../lib/db";
import { cartKey, variantPrice } from "../../lib/catalog";

/** Valores mientras carga la configuración real desde Neon. */
const EMPTY_SETTINGS: StoreSettings = {
  bankName: "",
  accountType: "",
  accountNumber: "",
  accountRut: "",
  accountHolder: "",
  contactEmail: "",
  whatsappNumber: "",
  freeShippingThreshold: 35000,
};

/** Estado de la conexión con la API (Neon). Ya no existe un "modo local": sin API no se guarda nada. */
export type ApiStatus = "connecting" | "connected" | "error";

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAdminOpen: boolean;
  apiStatus: ApiStatus;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant | null, variantLabel?: string) => boolean;
  removeFromCart: (productId: string | number, variantId?: string | null) => void;
  updateQuantity: (productId: string | number, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  createOrder: (orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "status">) => Promise<Order>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string | number, updates: Partial<Product>) => Promise<void>;
  updateStock: (id: string | number, newStock: number) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  addCategory: (category: Omit<Category, "id" | "sortOrder" | "productCount">) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Omit<Category, "id" | "productCount">>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: Order["status"]) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Solo el carrito vive en el navegador. Catálogo, pedidos y configuración se
// leen y escriben siempre en Neon (las claves viejas bloom_products_v2, etc.
// quedan sin uso en los navegadores que las tengan).
const CART_STORAGE_KEY = "bloom_cart_v2";

/** Avisa en el panel que un cambio no se guardó (los botones no esperan la promesa). */
function reportSaveError(action: string, e: unknown) {
  console.error(`Error al ${action}:`, e);
  const detail = e instanceof Error ? e.message : String(e);
  alert(`No se pudo ${action}. El cambio NO quedó guardado.\n\n${detail}`);
}

/** Convierte una fila de la API (snake_case) al tipo Product (camelCase) */
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    num: row.num ?? "00",
    name: row.name,
    price: row.price,
    stock: row.stock ?? 0,
    category: row.category,
    categoryId: row.category_id ?? null,
    attributes: row.attributes ?? {},
    variants: (row.variants ?? []).map((v: any) => ({
      id: v.id,
      options: v.options ?? {},
      stock: v.stock ?? 0,
      price: v.price ?? null,
      image: v.image ?? null,
    })),
    badge: row.badge ?? null,
    badgeType: row.badge_type ?? null,
    image: row.image,
    alt: row.alt ?? row.name,
    description: row.description ?? null,
    isActive: row.is_active ?? true,
  };
}

function mapDbCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    image: row.image ?? null,
    attributes: row.attributes ?? [],
    sortOrder: row.sort_order ?? 0,
    productCount: row.product_count ?? 0,
  };
}

/** Producto (camelCase) → cuerpo para la API de productos */
function toDbProductInput(p: Partial<Product>): Partial<DbProductInput> {
  const out: Partial<DbProductInput> = {};
  if (p.num !== undefined)         out.num         = p.num;
  if (p.name !== undefined)        out.name        = p.name;
  if (p.price !== undefined)       out.price       = p.price;
  if (p.stock !== undefined)       out.stock       = p.stock;
  if (p.category !== undefined)    out.category    = p.category;
  if (p.categoryId !== undefined)  out.category_id = p.categoryId;
  if (p.attributes !== undefined)  out.attributes  = p.attributes;
  if (p.badge !== undefined)       out.badge       = p.badge;
  if (p.badgeType !== undefined)   out.badge_type  = p.badgeType;
  if (p.image !== undefined)       out.image       = p.image;
  if (p.alt !== undefined)         out.alt         = p.alt;
  if (p.description !== undefined) out.description = p.description;
  if (p.variants !== undefined) {
    out.variants = p.variants.map((v) => ({
      id: v.id,
      options: v.options,
      stock: v.stock,
      price: v.price ?? null,
      image: v.image ?? null,
    }));
  }
  return out;
}

/** Si el producto tiene variantes, su stock es la suma de las variantes */
function withVariantStock(p: Product): Product {
  return p.variants && p.variants.length > 0 ? { ...p, stock: p.variants.reduce((acc, v) => acc + v.stock, 0) } : p;
}

/** Convierte una fila de la API al tipo Order (camelCase) */
export function mapDbOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.order_number,
    customer: {
      name: o.customer_name,
      rut: o.customer_rut,
      email: o.customer_email,
      phone: o.customer_phone,
      region: o.region,
      comuna: o.comuna,
      address: o.address,
      notes: o.notes,
    },
    shippingMethod: o.shipping_method,
    shippingCost: o.shipping_cost,
    subtotal: o.subtotal,
    total: o.total,
    paymentMethod: o.payment_method,
    status: o.status,
    items: (o.order_items ?? []).map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variantId: item.variant_id ?? null,
      variantLabel: item.variant_label ?? null,
    })),
    createdAt: o.created_at,
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(EMPTY_SETTINGS);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("connecting");

  useEffect(() => {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* noop */ }
  }, [cart]);

  // Carga inicial desde la API de Neon. El catálogo define si hay conexión.
  const fetchNeonProducts = useCallback(async () => {
    try {
      const rows = await db.products.list();
      setProducts(Array.isArray(rows) ? rows.map(mapDbProduct) : []);
      setApiStatus("connected");
    } catch (e) {
      console.error("No se pudo cargar el catálogo desde Neon:", e);
      setApiStatus("error");
    }
  }, []);

  // Un carrito guardado puede traer productos que ya no existen (ej. los de
  // ejemplo del antiguo modo local): se descartan para que el pedido no falle.
  useEffect(() => {
    if (apiStatus !== "connected") return;
    const ids = new Set(products.map((p) => String(p.id)));
    setCart((prev) => {
      const valid = prev.filter((i) => ids.has(String(i.product.id)));
      return valid.length === prev.length ? prev : valid;
    });
  }, [apiStatus, products]);

  const fetchNeonCategories = useCallback(async () => {
    try {
      const rows = await db.categories.list();
      if (rows) setCategories(rows.map(mapDbCategory));
    } catch (e) {
      console.error("Error cargando categorías de Neon:", e);
    }
  }, []);

  const fetchNeonOrders = useCallback(async () => {
    try {
      const rows = await db.orders.list();
      if (rows) setOrders(rows.map(mapDbOrder));
    } catch (e) {
      // 401 esperado en la tienda pública: los pedidos solo los ve el admin
      console.warn("Pedidos no disponibles:", e);
    }
  }, []);

  const fetchNeonSettings = useCallback(async () => {
    try {
      const row = await db.settings.get();
      if (row) {
        setSettings({
          bankName: row.bank_name,
          accountType: row.account_type,
          accountNumber: row.account_number,
          accountRut: row.account_rut,
          accountHolder: row.account_holder,
          contactEmail: row.contact_email,
          whatsappNumber: row.whatsapp_number,
          freeShippingThreshold: row.free_shipping_threshold,
        });
      }
    } catch (e) {
      console.error("Error cargando configuración de Neon:", e);
    }
  }, []);

  useEffect(() => {
    fetchNeonCategories();
    fetchNeonProducts();
    fetchNeonOrders();
    fetchNeonSettings();
  }, [fetchNeonCategories, fetchNeonProducts, fetchNeonOrders, fetchNeonSettings]);

  // Cálculos de carrito (el precio puede venir de la variante elegida)
  const cartTotal = cart.reduce((acc, item) => acc + variantPrice(item.product, item.variant) * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const itemKey = (item: CartItem) => cartKey(item.product.id, item.variant?.id);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant | null, variantLabel?: string): boolean => {
    const currentStock = variant ? variant.stock : product.stock;
    if (currentStock <= 0) return false;

    const key = cartKey(product.id, variant?.id);
    let addedSuccessfully = true;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => itemKey(i) === key);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > currentStock) {
          addedSuccessfully = false;
          return prevCart.map((i) => (itemKey(i) === key ? { ...i, quantity: currentStock } : i));
        }
        return prevCart.map((i) => (itemKey(i) === key ? { ...i, quantity: newQty } : i));
      } else {
        const initialQty = Math.min(quantity, currentStock);
        return [...prevCart, { product, quantity: initialQty, variant: variant ?? null, variantLabel }];
      }
    });

    setIsCartOpen(true);
    return addedSuccessfully;
  };

  const removeFromCart = (productId: string | number, variantId?: string | null) => {
    const key = cartKey(productId, variantId);
    setCart((prev) => prev.filter((i) => itemKey(i) !== key));
  };

  const updateQuantity = (productId: string | number, quantity: number, variantId?: string | null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    const key = cartKey(productId, variantId);
    setCart((prev) =>
      prev.map((item) => {
        if (itemKey(item) === key) {
          const maxStock = item.variant ? item.variant.stock : item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // Crear pedido: el servidor lo guarda y descuenta el stock. Si falla, el
  // error llega al checkout (nunca se da por hecho un pedido que no existe).
  const createOrder = async (
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "status">
  ): Promise<Order> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BLOOM-${randomSuffix}`;

    const created = await db.orders.create({
      order_number: orderNumber,
      customer_name: orderData.customer.name,
      customer_rut: orderData.customer.rut,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.phone,
      region: orderData.customer.region,
      comuna: orderData.customer.comuna,
      address: orderData.customer.address,
      notes: orderData.customer.notes ?? "",
      shipping_method: orderData.shippingMethod,
      shipping_cost: orderData.shippingCost,
      subtotal: orderData.subtotal,
      total: orderData.total,
      payment_method: orderData.paymentMethod,
      items: orderData.items.map((i) => ({
        product_id: String(i.productId),
        product_name: i.productName,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        variant_id: i.variantId ?? null,
        variant_label: i.variantLabel ?? null,
      })),
    });

    const newOrder = mapDbOrder(created);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    // El stock lo descontó el servidor: se recarga el catálogo para reflejarlo
    fetchNeonProducts();
    return newOrder;
  };

  // Productos: un error se propaga para que el panel lo muestre
  const addProduct = async (productData: Omit<Product, "id">): Promise<Product> => {
    const draft = withVariantStock({
      ...productData,
      id: "",
      num: productData.num || String(products.length + 1).padStart(2, "0"),
      isActive: true,
    });
    const created = await db.products.create({
      ...toDbProductInput(draft),
      alt: draft.alt ?? draft.name,
      description: draft.description ?? null,
      badge: draft.badge ?? null,
      badge_type: draft.badgeType ?? null,
    } as DbProductInput);
    const newProd = mapDbProduct(created);
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateStock = async (id: string | number, newStock: number) => {
    const validStock = Math.max(0, newStock);
    try {
      await db.products.update(String(id), { stock: validStock });
      setProducts((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, stock: validStock } : p)));
    } catch (e) {
      reportSaveError("actualizar el stock", e);
    }
  };

  // El producto queda tal como lo devuelve el servidor (ids reales de las
  // variantes y stock recalculado)
  const updateProduct = async (id: string | number, updates: Partial<Product>) => {
    const { category: _ignored, num: _num, ...rest } = updates;
    const updated = await db.products.update(String(id), toDbProductInput(rest));
    setProducts((prev) => prev.map((p) => (String(p.id) === String(id) ? mapDbProduct(updated) : p)));
  };

  const deleteProduct = async (id: string | number) => {
    try {
      await db.products.delete(String(id));
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (e) {
      reportSaveError("eliminar el producto", e);
    }
  };

  // ─── Categorías ──────────────────────────────────────────────────────────────

  const addCategory = async (data: Omit<Category, "id" | "sortOrder" | "productCount">): Promise<Category> => {
    const created = await db.categories.create({
      name: data.name,
      description: data.description ?? null,
      image: data.image ?? null,
      attributes: data.attributes,
    });
    const newCat = mapDbCategory(created);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Omit<Category, "id" | "productCount">>) => {
    const current = categories.find((c) => c.id === id);
    const updated = await db.categories.update(id, {
      name: updates.name,
      description: updates.description,
      image: updates.image,
      attributes: updates.attributes,
      sort_order: updates.sortOrder,
    });
    const next = mapDbCategory(updated);

    setCategories((prev) => prev.map((c) => (c.id === id ? next : c)));
    // El nombre de la categoría se copia en cada producto
    if (current && next.name !== current.name) {
      setProducts((prev) =>
        prev.map((p) =>
          p.categoryId === id || (!p.categoryId && p.category === current.name) ? { ...p, category: next.name } : p
        )
      );
    }
  };

  const deleteCategory = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    const inUse = products.filter((p) => p.categoryId === id || (!p.categoryId && p.category === cat?.name)).length;
    if (inUse > 0) {
      throw new Error(
        `No se puede eliminar: la categoría tiene ${inUse} producto(s). Muévelos a otra categoría o elimínalos primero.`
      );
    }

    await db.categories.delete(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ─── Pedidos y configuración ────────────────────────────────────────────────

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await db.orders.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (e) {
      reportSaveError("cambiar el estado del pedido", e);
    }
  };

  // Un error se propaga para que el formulario no muestre "guardado"
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const dbSettings: Record<string, any> = {};
    if (newSettings.bankName !== undefined)              dbSettings.bank_name               = newSettings.bankName;
    if (newSettings.accountType !== undefined)           dbSettings.account_type            = newSettings.accountType;
    if (newSettings.accountNumber !== undefined)         dbSettings.account_number          = newSettings.accountNumber;
    if (newSettings.accountRut !== undefined)            dbSettings.account_rut             = newSettings.accountRut;
    if (newSettings.accountHolder !== undefined)         dbSettings.account_holder          = newSettings.accountHolder;
    if (newSettings.contactEmail !== undefined)          dbSettings.contact_email           = newSettings.contactEmail;
    if (newSettings.whatsappNumber !== undefined)        dbSettings.whatsapp_number         = newSettings.whatsappNumber;
    if (newSettings.freeShippingThreshold !== undefined) dbSettings.free_shipping_threshold = newSettings.freeShippingThreshold;

    await db.settings.update(dbSettings);
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        settings,
        isCartOpen,
        isCheckoutOpen,
        isAdminOpen,
        apiStatus,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAdminOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        createOrder,
        addProduct,
        updateProduct,
        updateStock,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        updateSettings,
        refreshOrders: fetchNeonOrders,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore debe usarse dentro de un StoreProvider");
  }
  return context;
};
