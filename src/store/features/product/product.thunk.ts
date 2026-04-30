import client from "@/api/apiClient";
import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type { Product, ProductResponse } from "./product.types";

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
  FormData
>("product/create", async (formData) => {
  const res = await client.post("/products", formData, {
      "Content-Type": "multipart/form-data",
  });

  return res.data;
});