import client from "@/api/apiClient";
import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type { User } from "./user.types";

// ✅ GET ME
export const getMe = createAsyncThunkWrapper<User, void>(
  "user/getMe",
  async () => {
    const res = await client.get("/user/me");
    return res.data;
  }
);

// ✅ UPDATE USER
export const updateUser = createAsyncThunkWrapper<
  { message: string; data: User },
  { name: string }
>("user/updateUser", async (payload) => {
  const res = await client.patch("/user/me", payload);
  return res.data;
});