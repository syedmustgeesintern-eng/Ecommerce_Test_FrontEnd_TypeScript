import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type { Product, ProductResponse } from "./product.types";
import type { ProductFormPayload } from "@/lib/types";
import {
  createProduct as createProductApi,
  updateProduct as updateProductApi,
} from "./product.api";
import client from "@/api/apiClient";

type ProductMutationResponse = {
  message?: string;
};

export const fetchProducts = createAsyncThunkWrapper<
  ProductResponse,
  { cursor?: string }
>("product/fetchAll", async ({ cursor }) => {
  const res = await client.get("/products", {
    params: {
      limit: 10,
      cursor,
    },
  });

  return {
    products: res.data?.data ?? [],
    nextCursor: res.data?.nextCursor ?? null,
  };
});
export const fetchMyProducts = createAsyncThunkWrapper<
  { products: Product[]; nextCursor: string | null },
  { cursor?: string | null; limit?: number }
>("product/fetchMy", async ({ cursor, limit = 20 }) => {
  const res = await client.get("/products/my", {
    params: {
      limit,
      cursor: cursor || undefined,
    },
  });

  return {
    products: res.data?.data ?? [],
    nextCursor: res.data?.nextCursor ?? null,
  };
});
export const createProduct = createAsyncThunkWrapper<
  ProductMutationResponse,
  { payload: ProductFormPayload; files?: File[] }
>("product/create", async ({ payload, files }) => {
  return (await createProductApi(payload, files)) as ProductMutationResponse;
});

export const updateProduct = createAsyncThunkWrapper<
  ProductMutationResponse,
  { productId: string; payload: ProductFormPayload; files?: File[] }
>("product/update", async ({ productId, payload, files }) => {
  return (await updateProductApi(
    productId,
    payload,
    files,
  )) as ProductMutationResponse;
});

export const fetchProductById = createAsyncThunkWrapper<
  Product,
  string
>("product/fetchById", async (productId) => {
  const res = await client.get(`/products/${productId}`);

  return res.data?.data ?? res.data;
});
