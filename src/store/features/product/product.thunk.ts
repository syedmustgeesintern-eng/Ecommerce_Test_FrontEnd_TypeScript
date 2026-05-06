import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type { Product, ProductResponse } from "./product.types";
import type { ProductFormPayload } from "@/lib/types";
import {
  createProduct as createProductApi,
  updateProduct as updateProductApi,
} from "./product.api";
import client from "@/api/apiClient";

export const fetchProducts = createAsyncThunkWrapper<
  ProductResponse,
  { cursor?: string }
>("product/fetchAll", async ({ cursor }) => {
  const res = await client.get("/products", {
    params: {
      limit: 2,
      cursor,
    },
  });

  return {
    products: res.data.data,
    nextCursor: res.data.nextCursor,
  };
});
export const fetchMyProducts = createAsyncThunkWrapper<
  { products: Product[]; nextCursor: string | null },
  { cursor?: string }
>("product/fetchMy", async ({ cursor }) => {
  const res = await client.get("/products/my", {
    params: {
      limit: 10,
      cursor,
    },
  });

  return {
    products: res.data.data,
    nextCursor: res.data.nextCursor,
  };
});
export const createProduct = createAsyncThunkWrapper<
  any,
  { payload: ProductFormPayload; files?: File[] }
>("product/create", async ({ payload, files }) => {
  return createProductApi(payload, files);
});

export const updateProduct = createAsyncThunkWrapper<
  any,
  { productId: string; payload: ProductFormPayload; files?: File[] }
>("product/update", async ({ productId, payload, files }) => {
  return updateProductApi(productId, payload, files);
});