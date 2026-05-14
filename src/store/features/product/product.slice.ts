import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMyProducts,
  fetchProductById,
  fetchProducts,
} from "./product.thunk";
import type { ProductState } from "./product.types";

const initialState: ProductState = {
  products: [],
  myProducts: [],
  selectedProduct: null,
  detailsLoading: false,
  nextCursor: null,
  myNextCursor: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null; // good practice
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        const { products, nextCursor } = action.payload;

        // 👉 check if it's first fetch or "load more"
        if (!action.meta.arg?.cursor) {
          state.products = products; // first load
        } else {
          state.products.push(...products); // append
        }

        state.nextCursor = nextCursor;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.error?.message || "Something went wrong";
      })
      .addCase(fetchMyProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.loading = false;

        const { products, nextCursor } = action.payload;
        state.myProducts = products;
        state.myNextCursor = nextCursor;
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.error?.message || "Failed to fetch products";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailsLoading = true;
        state.selectedProduct = null;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action?.error?.message || "Failed to fetch product";
      });
  },
});

export default productSlice.reducer;
