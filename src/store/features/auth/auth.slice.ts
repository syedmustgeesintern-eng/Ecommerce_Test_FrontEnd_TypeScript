import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { login,  changePassword } from "./auth.thunk";
import type { AuthState, AuthTokensPayload } from "./auth.types";

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  loading: false,
  error: null,
  otp: {
    email: null,
    type: null,
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
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action?.error?.message;
      });
  },
});

export const { updateAuthInfo, resetAuth, setOtpData } = authSlice.actions;
export default authSlice.reducer;
