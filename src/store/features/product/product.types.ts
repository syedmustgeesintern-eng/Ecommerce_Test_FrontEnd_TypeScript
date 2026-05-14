export interface ProductAttributeValue {
  value: string;
  meta: any;
}

export interface ProductAttribute {
  name: string;
  values: ProductAttributeValue[];
}

export interface VariantAttribute {
  attribute: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: string;
  stock: number;
  attributes: VariantAttribute[];
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  sku: string;
  categories: any[];

  attributes: ProductAttribute[];

  variants: ProductVariant[];

  images: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductState {
  products: Product[];
  myProducts: Product[];

  selectedProduct: Product | null;

  nextCursor: string | null;
  myNextCursor: string | null;

  loading: boolean;
  detailsLoading: boolean;

  error: string | null;
}
export interface ProductResponse {
  products: Product[];
  nextCursor: string | null;
}
