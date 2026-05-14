export type Category = {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  level?: number;
  isActive?: boolean;
  hasChildren?: boolean;
  children?: Category[];
};

export type VariantFormPayload = {
  id?: string;
  sku: string;
  price: number;
  stock: number;
  attributes?: Array<{
    attribute: string;
    value: string;
    meta?: { hex?: string };
  }>;
};

export type ProductFormPayload = {
  name: string;
  description?: string;
  basePrice?: number;
  sku?: string;
  categoryIds?: string[];
  variants?: VariantFormPayload[];
};

export type ProductDetailsResponse = {
  id: string;
  name: string;
  description: string;
  basePrice: string | number;
  sku?: string | null;
  categories?: Array<{ id: string; name: string }>;
  attributes?: Array<{
    name: string;
    values: Array<{ value: string; meta: null | { hex?: string } }>;
  }>;
  variants?: Array<{
    id: string;
    sku: string;
    price: string | number;
    stock: number;
    attributes?: Array<{ attribute: string; value: string }>;
    images?: string[];
  }>;
  images?: string[];
};

export type FormAttribute = {
  attribute: string;
  value: string;
  meta?: { hex?: string };
};

export type FormVariant = {
  localId: string;
  id?: string;
  sku: string;
  price: string;
  stock: string;
  attributes: FormAttribute[];
};

export type FormState = {
  name: string;
  description: string;
  basePrice: string;
  sku: string;
  categoryIds: string[];
  variants: FormVariant[];
};

export type ImageItem = { url: string; file?: File };
