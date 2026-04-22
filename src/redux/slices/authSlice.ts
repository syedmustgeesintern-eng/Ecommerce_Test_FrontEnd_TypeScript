import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import client from "@/api/apiClient";

import type { AxiosResponse } from "axios";
import type { AppDispatch, RootState } from "@/redux/store";
import type { NavigateFunction } from "react-router-dom";
import { setLocalStorage } from "@/lib/helpers";
import { createAsyncThunkWrapper } from "../utils/createAsyncThunkWrapper";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  loading: boolean;
  error: string | null;
  user: any | null;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthTokensPayload = {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  loading: false,
  error: null,
  user: null,
};

// LOGIN
export const login = createAsyncThunkWrapper<AuthTokensPayload, LoginPayload>(
  "auth/login",
  async (payload) => {
    const response: AxiosResponse<AuthTokensPayload> = await client.post(
      "/auth/login",
      payload,
    );

    const { accessToken, refreshToken } = response.data;

    setLocalStorage("token", response.data);
    client.setToken(accessToken, refreshToken);

    return response.data; // ✅ IMPORTANT
  },
);
//get user infoo
export const getMe = createAsyncThunkWrapper<any, void>(
  "auth/getMe",
  async () => {
    const response = await client.get("/user/me");
    return response.data;
  },
);
// 🔥 LOGOUT
export const logout =
  (navigate?: NavigateFunction, hideToast?: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const refreshToken = state?.auth?.refreshToken || "";

      await client.post("/auth/logout", { refreshToken });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(resetAuth());
      client.clearTokens();
      navigate?.("/sign-in");
    }
  };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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

        // ✅ FIX: payload directly contains tokens
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn ?? null;
      })

      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;

        // ⚠️ because your wrapper uses rejectWithValue in a non-standard way
        state.error =
          action?.meta?.errorMessage ||
          action?.error?.message ||
          "Login failed";
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })

      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // ✅ store user
      })

      .addCase(getMe.rejected, (state) => {
        state.loading = false;
      });
  },
});

// ================= EXPORTS =================

export const { updateAuthInfo, resetAuth } = authSlice.actions;

export default authSlice.reducer;
