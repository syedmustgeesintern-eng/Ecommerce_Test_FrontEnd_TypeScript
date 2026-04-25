import client from "@/api/apiClient";
import type {
  RegisterBrandPayload,
  VerifyOtpPayload,
  UpdateBrandPayload,
} from "./brand.types";
import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";

// 🔥 UPDATE BRAND
export const updateBrand = createAsyncThunkWrapper<any, UpdateBrandPayload>(
  "brand/update",
  async ({ id, data }) => {
    const response = await client.patch(`/brand/${id}`, data, {
      "Content-Type": "multipart/form-data",
    });

    return response.data;
  },
);

// REGISTER BRAND
export const registerBrand = createAsyncThunkWrapper<any, RegisterBrandPayload>(
  "brand/register",
  async (formData) => {
    const response = await client.post("/brand/register", formData, {
      "Content-Type": "multipart/form-data",
    });

    return response.data;
  },
);

// GET BRAND
export const getBrandMe = createAsyncThunkWrapper<any, void>(
  "brand/getMe",
  async () => {
    const response = await client.get("/brand/me");
    return response.data;
  },
);
