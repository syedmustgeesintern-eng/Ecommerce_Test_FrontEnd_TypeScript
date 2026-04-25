import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { login, getMe, changePassword } from "./auth.thunk";
import type { AuthState, AuthTokensPayload } from "./auth.types";

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  loading: false,
  error: null,
  user: null,
  otp: {
    email: null,
    type: null, // "brand" | "customer"
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOtpData: (state, action) => {
      state.otp = action.payload;
    },
    updateAuthInfo(state, action: PayloadAction<AuthTokensPayload>) {
      const payload = action.payload;
      if (!payload) return;

      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.expiresIn = payload.expiresIn ?? state.expiresIn;
    },

    resetAuth: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn ?? null;
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action?.meta?.errorMessage ||
          action?.error?.message ||
          "Login failed";
      })

      // GET ME
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })

      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(changePassword.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action?.meta?.errorMessage ||
          action?.error?.message ||
          "Password change failed";
      });
  },
});

export const { updateAuthInfo, resetAuth, setOtpData } = authSlice.actions;
export default authSlice.reducer;
