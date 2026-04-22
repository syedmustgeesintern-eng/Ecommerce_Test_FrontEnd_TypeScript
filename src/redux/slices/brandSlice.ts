/* eslint-disable @typescript-eslint/no-unused-expressions */

import { createSlice } from "@reduxjs/toolkit";
import client from "@/api/apiClient";
import { createAsyncThunkWrapper } from "@/redux/utils/createAsyncThunkWrapper";

export interface BrandState {
  loading: boolean;
  error: string | null;
  success: boolean;
  email: string | null;
  brand: any | null;
}

export type RegisterBrandPayload = FormData;

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

const initialState: BrandState = {
  loading: false,
  error: null,
  success: false,
  email: null,
  brand: null,
};

//update brand
// 🔥 UPDATE BRAND
export const updateBrand = createAsyncThunkWrapper<
  any,
  { id: string; data: FormData }
>("brand/update", async ({ id, data }) => {
  const response = await client.patch(`/brand/${id}`, data, {
    "Content-Type": "multipart/form-data",
  });

  return response.data;
});

// Register Brand (FormData)
export const registerBrand = createAsyncThunkWrapper<any, RegisterBrandPayload>(
  "brand/register",
  async (formData) => {
    const response = await client.post("/brand/register", formData, {
      "Content-Type": "multipart/form-data",
    });
    const { data, status } = response || {};
    console.log("🚀 ~ response.data:", response);
    return { data, status };
  },
);

export const verifyBrandOtp = createAsyncThunkWrapper<any, VerifyOtpPayload>(
  "brand/verify-otp",
  async (payload) => {
    const response = await client.post("/auth/verify-otp", payload);
    const { data, status } = response;
    return { data, status };
  },
);
//brand info
export const getBrandMe = createAsyncThunkWrapper<any, void>(
  "brand/getMe",
  async () => {
    const response = await client.get("/brand/me");
    return response.data;
  },
);

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    setBrandEmail: (state, action) => {
      state.email = action.payload;
    },

    resetBrandState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ================= REGISTER BRAND =================
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

      // ================= VERIFY OTP =================
      .addCase(verifyBrandOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(verifyBrandOtp.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      .addCase(verifyBrandOtp.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action?.meta?.errorMessage ||
          action?.error?.message ||
          "OTP verification failed";
      })
      // 🔥 GET BRAND
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
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // ✅ update brand in store
        state.brand = action.payload;
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

// ================= EXPORTS =================

export const { setBrandEmail, resetBrandState } = brandSlice.actions;

export default brandSlice.reducer;
