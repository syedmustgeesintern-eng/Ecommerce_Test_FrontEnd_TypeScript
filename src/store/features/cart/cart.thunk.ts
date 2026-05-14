import client from "@/api/apiClient";
import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type { CartResponse } from "./cart.types";

const normalizeCart = (raw: unknown): CartResponse => {
  const data = raw as Record<string, unknown>;
  return {
    cartId: String(data.cartId ?? ""),
    items: Array.isArray(data.items) ? (data.items as CartResponse["items"]) : [],
    itemCount: Number(data.itemCount ?? 0),
    subtotal: Number(data.subtotal ?? 0),
  };
};

export const fetchCart = createAsyncThunkWrapper<CartResponse, void>(
  "cart/fetch",
  async () => {
    const res = await client.get("/cart");
    const payload = res.data?.data ?? res.data;
    return normalizeCart(payload);
  },
);

const isCartPayload = (v: unknown): v is Record<string, unknown> =>
  Boolean(v && typeof v === "object" && "cartId" in (v as object));

const resolveCartAfterWrite = async (writeResponseData: unknown) => {
  if (isCartPayload(writeResponseData)) {
    return normalizeCart(writeResponseData);
  }
  const res = await client.get("/cart");
  const payload = res.data?.data ?? res.data;
  return normalizeCart(payload);
};

export const addToCart = createAsyncThunkWrapper<
  CartResponse,
  { variantId: string; quantity: number }
>("cart/addItem", async ({ variantId, quantity }) => {
  const res = await client.post<unknown>("/cart/items", { variantId, quantity });
  const responseData = res.data as { data?: unknown };
  const body = responseData?.data ?? res.data;
  return resolveCartAfterWrite(body);
});

export const updateCartItem = createAsyncThunkWrapper<
  CartResponse,
  { cartItemId: string; quantity: number }
>("cart/updateItem", async ({ cartItemId, quantity }) => {
  const res = await client.patch(`/cart/items/${cartItemId}`, { quantity });
  const body = res.data?.data ?? res.data;
  return resolveCartAfterWrite(body);
});

export const removeCartItem = createAsyncThunkWrapper<CartResponse, string>(
  "cart/removeItem",
  async (cartItemId) => {
    await client.delete(`/cart/items/${cartItemId}`);
    const res = await client.get("/cart");
    const payload = res.data?.data ?? res.data;
    return normalizeCart(payload);
  },
);

export const clearCart = createAsyncThunkWrapper<CartResponse, void>(
  "cart/clear",
  async () => {
    await client.delete("/cart");
    const res = await client.get("/cart");
    const payload = res.data?.data ?? res.data;
    return normalizeCart(payload);
  },
);
