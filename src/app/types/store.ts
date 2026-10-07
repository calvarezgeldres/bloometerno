/**
 * Característica de una categoría (ej: "Calibre", "Color").
 * isVariant = el producto puede tener varias opciones de esta característica y
 * el cliente elige una al comprar; cada combinación es una ProductVariant con su stock.
 */
export type CategoryAttribute = {
  id: string;
  name: string;
  isVariant: boolean;
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  attributes: CategoryAttribute[];
  sortOrder: number;
  productCount?: number;
};

export type ProductVariant = {
  id: string;
  /** { "<id característica>": "Dorado" } */
  options: Record<string, string>;
  stock: number;
  /** null = usa el precio del producto */
  price?: number | null;
};

export type Product = {
  id: string | number;
  num: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  categoryId?: string | null;
  /** Valores de las características fijas: { "<id característica>": "0,8 mm" } */
  attributes?: Record<string, string>;
  variants?: ProductVariant[];
  badge?: string | null;
  badgeType?: "new" | "hot" | "limited" | null;
  image: string;
  alt?: string;
  description?: string;
  isActive?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
  variant?: ProductVariant | null;
  /** Texto legible de la variante, ej: "Color: Dorado" */
  variantLabel?: string;
};

export type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
};

export type OrderCustomer = {
  name: string;
  rut: string;
  email: string;
  phone: string;
  region: string;
  comuna: string;
  address: string;
  notes?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  status: "Pendiente de transferencia" | "Pagado con Mercado Pago" | "Comprobante recibido" | "En preparación" | "Enviado" | "Anulado";
  items: {
    productId: string | number;
    productName: string;
    price: number;
    quantity: number;
    image?: string;
    variantId?: string | null;
    variantLabel?: string | null;
  }[];
  createdAt: string;
};

export type StoreSettings = {
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountRut: string;
  accountHolder: string;
  contactEmail: string;
  whatsappNumber: string;
  freeShippingThreshold: number;
};
