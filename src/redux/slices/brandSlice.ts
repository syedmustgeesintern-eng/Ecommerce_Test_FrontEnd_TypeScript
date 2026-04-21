/* eslint-disable @typescript-eslint/no-unused-expressions */

import { createSlice } from "@reduxjs/toolkit";
import client from "@/api/apiClient";
import { createAsyncThunkWrapper } from "@/redux/utils/createAsyncThunkWrapper";



export interface BrandState {
  loading: boolean;
  error: string | null;
  success: boolean;
  email: string | null; 
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
};



// Register Brand (FormData)
export const registerBrand = createAsyncThunkWrapper<
  any,
  RegisterBrandPayload
>("brand/register", async (formData) => {
  const response = await client.post("/brand/register", formData, {
    "Content-Type": "multipart/form-data",
  });

  console.log("🚀 ~ response.data:", response.data)
  return response.data;
});


export const verifyBrandOtp = createAsyncThunkWrapper<
  any,
  VerifyOtpPayload
>("brand/verify-otp", async (payload) => {
  const response = await client.post("/brand/verify-otp", payload);
  return response.data;
});



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
          action?.meta?.errorMessage || action?.error?.message || "Registration failed";
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
          action?.meta?.errorMessage || action?.error?.message || "OTP verification failed";
      });
  },
});


// ================= EXPORTS =================

export const { setBrandEmail, resetBrandState } = brandSlice.actions;

export default brandSlice.reducer;