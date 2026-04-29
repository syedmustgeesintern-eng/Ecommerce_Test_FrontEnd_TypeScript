import client from "@/api/apiClient";
import { setLocalStorage } from "@/lib/helpers";
import type { AxiosResponse } from "axios";
import type { LoginPayload, AuthTokensPayload } from "./auth.types";
import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type { NavigateFunction } from "react-router-dom";
import type { AppDispatch, RootState } from "@/store";
import { resetAuth } from "./auth.slice";
import type { VerifyOtpPayload } from "../brand";

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
export const changePassword = createAsyncThunkWrapper<
  any,
  { oldPassword: string; newPassword: string }
>("auth/changePassword", async (payload) => {
  const response = await client.patch("/auth/change-password", payload);
  return response.data;
});
//forgot passwrod
// 1
export const forgotPassword = createAsyncThunkWrapper<
  { message: string },
  { email: string }
>("auth/forgotPassword", async (payload) => {
  const res = await client.post<{ message: string }>(
    "/auth/forgot-password",
    payload,
  );
  return res.data;
});


// 3
export const resetPassword = createAsyncThunkWrapper<
  { message: string },
  { token: string; newPassword: string }
>("auth/resetPassword", async (payload) => {
  const res = await client.post<{ message: string }>(
    "/auth/reset-password",
    payload,
  );
  return res.data;
});
//register customer
export const registerCustomer = createAsyncThunkWrapper<
  { message: string },
  { name: string; email: string; password: string }
>("auth/registerCustomer", async (payload) => {
  const response = await client.post<{ message: string }>(
    "/auth/signup",
    payload,
  );

  return response.data;
});
export const verifyOtp = createAsyncThunkWrapper<any, VerifyOtpPayload>(
  "brand/verify-otp",
  async (payload) => {
    const response = await client.post("/auth/verify-otp", payload);
    return response.data;
  },
);
