export type CartVariant = {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
};

export type CartProductRef = {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string | null;
};

export type CartLineItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variant: CartVariant;
  product: CartProductRef;
};

export type CartResponse = {
  cartId: string;
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
};

export type CartState = {
  cart: CartResponse | null;
  loading: boolean;
  mutationLoading: boolean;
  error: string | null;
};
