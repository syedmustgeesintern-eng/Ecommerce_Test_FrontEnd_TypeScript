import { createSlice } from "@reduxjs/toolkit";
import { fetchMyProducts, fetchProducts } from "./product.thunk";
import type { ProductState } from "./product.types";

const initialState: ProductState = {
  products: [],
  myProducts: [],
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
      .addCase(fetchProducts.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action?.error?.message || "Something went wrong";
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.loading = false;

        const { products, nextCursor } = action.payload;

        if (!action.meta.arg?.cursor) {
          state.myProducts = products;
        } else {
          state.myProducts.push(...products);
        }

        state.myNextCursor = nextCursor;
      });
  },
});

export default productSlice.reducer;
