import { createSlice } from "@reduxjs/toolkit";
import { createAddress, fetchAddresses, getMe, setDefaultAddress, updateAddress, updateUser } from "./user.thunk";
import type { UserState } from "./user.types";

const initialState: UserState = {
  user: null,
  loading: true,
  error: null,
  addresses: [],
  addressesLoading: false,
  addressMutating: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUser: () => initialState,
  },
  extraReducers: (builder) => {
    builder
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

      // UPDATE USER
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(updateUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action?.error?.message;
      })

      // FETCH ADDRESSES
      .addCase(fetchAddresses.pending, (state) => {
        state.addressesLoading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state) => {
        state.addressesLoading = false;
      })

      // CREATE ADDRESS
      .addCase(createAddress.pending, (state) => {
        state.addressMutating = true;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addressMutating = false;
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((a) => ({ ...a, isDefault: false }));
        }
        state.addresses = [action.payload, ...state.addresses];
      })
      .addCase(createAddress.rejected, (state) => {
        state.addressMutating = false;
      })

      // UPDATE ADDRESS
      .addCase(updateAddress.pending, (state) => {
        state.addressMutating = true;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addressMutating = false;
        state.addresses = state.addresses.map((a) =>
          a.id === action.payload.id ? action.payload : a,
        );
      })
      .addCase(updateAddress.rejected, (state) => {
        state.addressMutating = false;
      })

      // SET DEFAULT ADDRESS
      .addCase(setDefaultAddress.pending, (state) => {
        state.addressMutating = true;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addressMutating = false;
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isDefault: a.id === action.payload.id,
        }));
      })
      .addCase(setDefaultAddress.rejected, (state) => {
        state.addressMutating = false;
      });
  },
});

export const { resetUser } = userSlice.actions;
export default userSlice.reducer;