export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image?: string;
}

export interface ProductState {
  products: Product[];
  nextCursor: string | null;
  myProducts: Product[];
  myNextCursor: string | null;
  loading: boolean;
  error: string | null;
}
export interface ProductResponse {
  products: Product[];
  nextCursor: string | null;
}
