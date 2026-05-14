import client from "@/api/apiClient";
import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type {
  CreateOrderPayload,
  FetchOrdersParams,
  Order,
  OrdersResponse,
} from "./order.types";

const unwrapData = <T>(raw: unknown): T => {
  const record = raw as { data?: unknown };
  return (record?.data ?? raw) as T;
};

const normalizeOrdersResponse = (raw: unknown): OrdersResponse => {
  const data = raw as Partial<OrdersResponse>;
  return {
    data: Array.isArray(data.data) ? data.data : [],
    nextCursor: data.nextCursor ?? null,
    limit: Number(data.limit ?? 5),
    hasMore: Boolean(data.hasMore),
  };
};
export type CreateOrderResponse = {
  orderId: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingFee: string;
  totalAmount: string;
};

export const createOrder = createAsyncThunkWrapper<Order, CreateOrderPayload>(
  "orders/create",
  async (payload) => {
    const res = await client.post("/orders", payload);
    const raw = unwrapData<CreateOrderResponse>(res.data);
    return { ...raw, id: raw.orderId } as unknown as Order;
  },
);

export const fetchMyOrders = createAsyncThunkWrapper<
  OrdersResponse,
  FetchOrdersParams | void
>("orders/fetchMine", async (params) => {
  const search = new URLSearchParams();
  search.set("limit", String(params?.limit ?? 5));
  if (params?.cursor) {
    search.set("cursor", params.cursor);
  }

  const res = await client.get(`/orders/my-orders?${search.toString()}`);
  return normalizeOrdersResponse(res.data);
});

export const fetchOrderById = createAsyncThunkWrapper<Order, string>(
  "orders/fetchById",
  async (orderId) => {
    const res = await client.get(`/orders/${orderId}`);
    return unwrapData<Order>(res.data);
  },
);
