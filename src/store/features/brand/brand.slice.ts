import { createSlice } from "@reduxjs/toolkit";
import { registerBrand, getBrandMe, updateBrand } from "./brand.thunk";
import type { BrandState } from "./brand.types";

const initialState: BrandState = {
  loading: false,
  error: null,
  success: false,
  brand: null,
};

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    resetBrandState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ================= REGISTER =================
      .addCase(registerBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerBrand.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(registerBrand.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action?.meta?.errorMessage ||
          action?.error?.message ||
          "Registration failed";
      })

      // ================= GET BRAND =================
      .addCase(getBrandMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBrandMe.fulfilled, (state, action) => {
        state.loading = false;
        state.brand = action.payload;
      })
      .addCase(getBrandMe.rejected, (state) => {
        state.loading = false;
      })

      // ================= UPDATE BRAND =================
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // ⚠️ IMPORTANT FIX (your backend returns { message, data })
        state.brand = action.payload.data;
      })
      .addCase(updateBrand.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action?.meta?.errorMessage ||
          action?.error?.message ||
          "Update failed";
      });
  },
});

export const { resetBrandState } = brandSlice.actions;
export default brandSlice.reducer;
