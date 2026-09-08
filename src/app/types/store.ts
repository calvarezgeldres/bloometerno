export type Product = {
  id: string | number;
  num: string;
  name: string;
  price: number;
  stock: number;
  category: string;
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
