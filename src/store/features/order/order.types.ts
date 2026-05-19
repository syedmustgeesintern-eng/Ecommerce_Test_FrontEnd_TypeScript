export type ShippingAddress = {
  id?: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  streetAddress: string;
};

export type OrderItemImage = {
  id: string;
  url: string;
};

export type OrderItemProduct = {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  sku: string;
  images?: OrderItemImage[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItemVariant = {
  id: string;
  sku: string;
  price: string;
  stock: number;
  product: OrderItemProduct;
  images: OrderItemImage[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  product: OrderItemProduct;
  variantId: string;
  variant: OrderItemVariant;
  selectedAttributes?: Record<string, string>;
  unitPrice: string;
  quantity: number;
};

export type OrderStatusHistory = {
  id: string;
  orderId: string;
  oldStatus: string | null;
  newStatus: string;
  changedAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  shippingAddressOverride: ShippingAddress | null;
  status: string;
  subtotal: string;
  shippingFee: string;
  totalAmount: string;
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  items: { variantId: string; quantity: number }[];
  addressId?: string;
  shippingAddress?: ShippingAddress;
};

export type OrdersResponse = {
  data: Order[];
  nextCursor: string | null;
  limit: number;
  hasMore: boolean;
};

export type FetchOrdersParams = {
  limit?: number;
  cursor?: string | null;
};

export type OrderState = {
  orders: Order[];
  selectedOrder: Order | null;
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  detailsLoading: boolean;
  placing: boolean;
  error: string | null;
};
