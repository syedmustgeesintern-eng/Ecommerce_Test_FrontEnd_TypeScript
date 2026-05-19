import client from "@/api/apiClient";
import { createAsyncThunkWrapper } from "@/store/utils/createAsyncThunkWrapper";
import type { CreateAddressPayload, UpdateAddressPayload, User, UserAddress } from "./user.types";

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

// ✅ FETCH ADDRESSES
export const fetchAddresses = createAsyncThunkWrapper<UserAddress[], void>(
  "user/fetchAddresses",
  async () => {
    const res = await client.get("/users/addresses");
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  },
);

// ✅ CREATE ADDRESS
export const createAddress = createAsyncThunkWrapper<UserAddress, CreateAddressPayload>(
  "user/createAddress",
  async (payload) => {
    const res = await client.post<{ data?: UserAddress } | UserAddress>("/users/addresses", payload);
    const body = res.data as { data?: UserAddress } & UserAddress;
    return body.data ?? body;
  },
);

// ✅ UPDATE ADDRESS
export const updateAddress = createAsyncThunkWrapper<
  UserAddress,
  { id: string; data: UpdateAddressPayload }
>("user/updateAddress", async ({ id, data }) => {
  const res = await client.patch(`/users/addresses/${id}`, data);
  const body = res.data as { data?: UserAddress } & UserAddress;
  return body.data ?? body;
});

// ✅ SET DEFAULT ADDRESS
export const setDefaultAddress = createAsyncThunkWrapper<UserAddress, string>(
  "user/setDefaultAddress",
  async (id) => {
    const res = await client.patch(`/users/addresses/${id}/default`);
    const body = res.data as { data?: UserAddress } & UserAddress;
    return body.data ?? body;
  },
);