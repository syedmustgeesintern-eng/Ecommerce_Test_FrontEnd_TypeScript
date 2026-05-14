import { createSlice } from "@reduxjs/toolkit";
import { createOrder, fetchMyOrders, fetchOrderById } from "./order.thunk";
import type { OrderState } from "./order.types";

const getErrorMessage = (
  payload: unknown,
  fallback: string,
  message?: string,
) =>
  (payload as { message?: string } | undefined)?.message || message || fallback;

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  nextCursor: null,
  hasMore: false,
  loading: false,
  detailsLoading: false,
  placing: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.placing = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.placing = false;
        state.error = null;
        state.selectedOrder = null;
        state.orders = [
          action.payload,
          ...state.orders.filter((order) => order.id !== action.payload.id),
        ];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.placing = false;
        state.error = getErrorMessage(
          action.payload,
          "Failed to place order",
          action.error.message,
        );
      })
      .addCase(fetchMyOrders.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        if (!action.meta.arg || !action.meta.arg.cursor) {
          state.orders = [];
          state.nextCursor = null;
          state.hasMore = false;
        }
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        const isNextPage = Boolean(action.meta.arg && action.meta.arg.cursor);
        state.orders = isNextPage
          ? [...state.orders, ...action.payload.data]
          : action.payload.data;
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(
          action.payload,
          "Failed to load orders",
          action.error.message,
        );
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
        state.selectedOrder = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = getErrorMessage(
          action.payload,
          "Failed to load order",
          action.error.message,
        );
      });
  },
});

export const { clearOrderError, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
