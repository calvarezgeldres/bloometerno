import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, CartItem, Order, StoreSettings } from "../types/store";
import { db, checkApiConnection } from "../../lib/db";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    num: "01",
    name: "Mostacilla rosado pálido 2mm",
    price: 1490,
    stock: 25,
    badge: "Más vendido",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1560847133-e6f64dc352ea?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Mostacillas rosadas ensartadas",
    category: "Mostacillas",
    description: "Mostacillas de vidrio seleccionadas de 2mm, terminación mate satinada ideal para pulseras delicadas.",
    isActive: true,
  },
  {
    id: 2,
    num: "02",
    name: "Piedra ojo de tigre natural",
    price: 3900,
    stock: 14,
    badge: "Nuevo",
    badgeType: "new",
    image: "https://images.unsplash.com/photo-1766038844075-d997429c85ef?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Piedra ojo de tigre pulida natural",
    category: "Piedras",
    description: "Piedra semipreciosa ojo de tigre con vetas doradas naturales y pulido suave de alta durabilidad.",
    isActive: true,
  },
  {
    id: 3,
    num: "03",
    name: "Cristal facetado verde oliva",
    price: 2200,
    stock: 18,
    badge: "Nuevo",
    badgeType: "new",
    image: "https://images.unsplash.com/photo-1556376752-19770d78207f?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Cristales facetados color verde",
    category: "Cristales",
    description: "Cuentas de cristal con facetas reflectantes en tonalidad verde oliva, destellos cálidos al sol.",
    isActive: true,
  },
  {
    id: 4,
    num: "04",
    name: "Kit pulsera floral completo",
    price: 8990,
    stock: 5,
    badge: "Ed. Limitada",
    badgeType: "limited",
    image: "https://images.unsplash.com/photo-1660911866937-9399bf71af1e?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Kit completo para pulsera floral",
    category: "Kits",
    description: "Incluye hilo elástico resistente, dijes de brote botánico, piedras y mostacillas seleccionadas.",
    isActive: true,
  },
  {
    id: 5,
    num: "05",
    name: "Separadores dorado suave x20",
    price: 2490,
    stock: 30,
    badge: "Más vendido",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1658915250017-bee8f8f0d9a6?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Separadores dorados para bisutería artesanal",
    category: "Herramientas",
    description: "Pack de 20 separadores metálicos con baño dorado libre de níquel, resistentes al uso diario.",
    isActive: true,
  },
  {
    id: 6,
    num: "06",
    name: "Mix mostacillas crema y beige",
    price: 3200,
    stock: 20,
    badge: null,
    badgeType: null,
    image: "https://images.unsplash.com/photo-1510229955695-588e1612a69b?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Mix de mostacillas en tonos crema",
    category: "Mostacillas",
    description: "Variedad de tonalidades orgánicas crema, marfil y beige tostado para creaciones sobrias y elegantes.",
    isActive: true,
  },
  {
    id: 7,
    num: "07",
    name: "Cuarzo rosa rodado natural",
    price: 4500,
    stock: 8,
    badge: "Nuevo",
    badgeType: "new",
    image: "https://images.unsplash.com/photo-1568551732226-3ad05aac9a76?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Cuarzo rosa rodado sobre superficie natural",
    category: "Piedras",
    description: "Piedra rodada suave al tacto con tonalidad rosa traslúcida y energía armonizadora.",
    isActive: true,
  },
  {
    id: 8,
    num: "08",
    name: "Set iniciación bisutería natural",
    price: 12900,
    stock: 3,
    badge: "Ed. Limitada",
    badgeType: "limited",
    image: "https://images.unsplash.com/photo-1560847133-95f64e08e02a?w=600&h=700&fit=crop&auto=format&q=80",
    alt: "Set completo de iniciación en bisutería natural",
    category: "Kits",
    description: "Caja organizadora con pinzas de precisión, 6 variedades de piedras, hilos y fornituras completas.",
    isActive: true,
  },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  bankName: "Banco Santander",
  accountType: "Cuenta Corriente",
  accountNumber: "87-65432-1",
  accountRut: "76.980.123-K",
  accountHolder: "Bloom Eterno SpA",
  contactEmail: "pagos@bloometerno.cl",
  whatsappNumber: "+56912345678",
  freeShippingThreshold: 35000,
};

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAdminOpen: boolean;
  isCloudConnected: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  createOrder: (orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "status">) => Promise<Order>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string | number, updates: Partial<Product>) => Promise<void>;
  updateStock: (id: string | number, newStock: number) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: Order["status"]) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetCatalog: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: "bloom_products_v2",
  CART: "bloom_cart_v2",
  ORDERS: "bloom_orders_v2",
  SETTINGS: "bloom_settings_v2",
};

/** Convierte una fila de la API (snake_case) al tipo Product (camelCase) */
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    num: row.num ?? "00",
    name: row.name,
    price: row.price,
    stock: row.stock ?? 0,
    category: row.category,
    badge: row.badge ?? null,
    badgeType: row.badge_type ?? null,
    image: row.image,
    alt: row.alt ?? row.name,
    description: row.description ?? null,
    isActive: row.is_active ?? true,
  };
}

/** Convierte una fila de la API al tipo Order (camelCase) */
function mapDbOrder(o: any): Order {
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
    })),
    createdAt: o.created_at,
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Persistencia en localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); } catch { /* noop */ }
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); } catch { /* noop */ }
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); } catch { /* noop */ }
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch { /* noop */ }
  }, [settings]);

  // Carga inicial desde la API de Neon
  const fetchNeonProducts = useCallback(async () => {
    try {
      const rows = await db.products.list();
      if (rows && rows.length > 0) {
        setProducts(rows.map(mapDbProduct));
        setIsCloudConnected(true);
      }
    } catch (e) {
      console.warn("API Neon no disponible, usando almacenamiento local:", e);
      setIsCloudConnected(false);
    }
  }, []);

  const fetchNeonOrders = useCallback(async () => {
    try {
      const rows = await db.orders.list();
      if (rows) setOrders(rows.map(mapDbOrder));
    } catch (e) {
      console.warn("Error cargando pedidos de Neon:", e);
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
      console.warn("Error cargando configuración de Neon:", e);
    }
  }, []);

  useEffect(() => {
    // Verificar conexión y cargar datos al montar
    checkApiConnection().then((connected) => {
      if (connected) {
        fetchNeonProducts();
        fetchNeonOrders();
        fetchNeonSettings();
      }
    });
  }, [fetchNeonProducts, fetchNeonOrders, fetchNeonSettings]);

  // Cálculos de carrito
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: Product, quantity = 1): boolean => {
    const currentStock = product.stock;
    if (currentStock <= 0) return false;

    let addedSuccessfully = true;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => String(i.product.id) === String(product.id));
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > currentStock) {
          addedSuccessfully = false;
          return prevCart.map((i) =>
            String(i.product.id) === String(product.id) ? { ...i, quantity: currentStock } : i
          );
        }
        return prevCart.map((i) =>
          String(i.product.id) === String(product.id) ? { ...i, quantity: newQty } : i
        );
      } else {
        const initialQty = Math.min(quantity, currentStock);
        return [...prevCart, { product, quantity: initialQty }];
      }
    });

    setIsCartOpen(true);
    return addedSuccessfully;
  };

  const removeFromCart = (productId: string | number) => {
    setCart((prev) => prev.filter((i) => String(i.product.id) !== String(productId)));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (String(item.product.id) === String(productId)) {
          const maxStock = item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // Crear pedido — Neon descuenta el stock en el servidor
  const createOrder = async (
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "status">
  ): Promise<Order> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BLOOM-${randomSuffix}`;
    const now = new Date().toISOString();

    // Descontar stock localmente (optimistic update)
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedItem = orderData.items.find((i) => String(i.productId) === String(prod.id));
        if (orderedItem) {
          return { ...prod, stock: Math.max(0, prod.stock - orderedItem.quantity) };
        }
        return prod;
      })
    );

    const newOrder: Order = {
      ...orderData,
      id: `local-${Date.now()}`,
      orderNumber,
      status: "Pendiente de transferencia",
      createdAt: now,
    };

    // Sincronizar con Neon
    if (isCloudConnected) {
      try {
        const apiPayload = {
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
            product_id: typeof i.productId === "string" && i.productId.includes("-") ? i.productId : null,
            product_name: i.productName,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        };

        const created = await db.orders.create(apiPayload);
        newOrder.id = created.id;
      } catch (err) {
        console.warn("Fallo al sincronizar orden con Neon:", err);
      }
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const addProduct = async (productData: Omit<Product, "id">): Promise<Product> => {
    const nextNum = String(products.length + 1).padStart(2, "0");
    const localId = `prod-${Date.now()}`;

    const newProd: Product = {
      ...productData,
      id: localId,
      num: productData.num || nextNum,
      isActive: true,
    };

    if (isCloudConnected) {
      try {
        const created = await db.products.create({
          num: newProd.num ?? nextNum,
          name: newProd.name,
          category: newProd.category,
          price: newProd.price,
          stock: newProd.stock,
          badge: newProd.badge ?? null,
          badge_type: newProd.badgeType ?? null,
          image: newProd.image,
          alt: newProd.alt ?? newProd.name,
          description: newProd.description ?? null,
        });
        newProd.id = created.id;
      } catch (e) {
        console.warn("Error guardando producto en Neon, guardado local:", e);
      }
    }

    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateStock = async (id: string | number, newStock: number) => {
    const validStock = Math.max(0, newStock);
    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, stock: validStock } : p))
    );

    if (isCloudConnected) {
      try {
        await db.products.update(String(id), { stock: validStock });
      } catch (e) {
        console.warn("Error actualizando stock en Neon:", e);
      }
    }
  };

  const updateProduct = async (id: string | number, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, ...updates } : p))
    );

    if (isCloudConnected) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.name !== undefined)        dbUpdates.name        = updates.name;
        if (updates.price !== undefined)       dbUpdates.price       = updates.price;
        if (updates.stock !== undefined)       dbUpdates.stock       = updates.stock;
        if (updates.category !== undefined)    dbUpdates.category    = updates.category;
        if (updates.badge !== undefined)       dbUpdates.badge       = updates.badge;
        if (updates.badgeType !== undefined)   dbUpdates.badge_type  = updates.badgeType;
        if (updates.image !== undefined)       dbUpdates.image       = updates.image;
        if (updates.description !== undefined) dbUpdates.description = updates.description;

        await db.products.update(String(id), dbUpdates);
      } catch (e) {
        console.warn("Error editando producto en Neon:", e);
      }
    }
  };

  const deleteProduct = async (id: string | number) => {
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));

    if (isCloudConnected) {
      try {
        await db.products.delete(String(id));
      } catch (e) {
        console.warn("Error eliminando producto de Neon:", e);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    if (isCloudConnected) {
      try {
        await db.orders.updateStatus(orderId, newStatus);
      } catch (e) {
        console.warn("Error actualizando estado en Neon:", e);
      }
    }
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    if (isCloudConnected) {
      const dbSettings: Record<string, any> = {};
      if (newSettings.bankName !== undefined)              dbSettings.bank_name               = newSettings.bankName;
      if (newSettings.accountType !== undefined)           dbSettings.account_type            = newSettings.accountType;
      if (newSettings.accountNumber !== undefined)         dbSettings.account_number          = newSettings.accountNumber;
      if (newSettings.accountRut !== undefined)            dbSettings.account_rut             = newSettings.accountRut;
      if (newSettings.accountHolder !== undefined)         dbSettings.account_holder          = newSettings.accountHolder;
      if (newSettings.contactEmail !== undefined)          dbSettings.contact_email           = newSettings.contactEmail;
      if (newSettings.whatsappNumber !== undefined)        dbSettings.whatsapp_number         = newSettings.whatsappNumber;
      if (newSettings.freeShippingThreshold !== undefined) dbSettings.free_shipping_threshold = newSettings.freeShippingThreshold;

      db.settings.update(dbSettings).catch((e) =>
        console.warn("Error guardando configuración en Neon:", e)
      );
    }
  };

  const resetCatalog = () => {
    setProducts(DEFAULT_PRODUCTS);
    setCart([]);
    setOrders([]);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        settings,
        isCartOpen,
        isCheckoutOpen,
        isAdminOpen,
        isCloudConnected,
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
        updateOrderStatus,
        updateSettings,
        resetCatalog,
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
