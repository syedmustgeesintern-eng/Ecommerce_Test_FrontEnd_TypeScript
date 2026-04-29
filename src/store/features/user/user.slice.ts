import { createSlice } from "@reduxjs/toolkit";
import { getMe, updateUser } from "./user.thunk";
import type { UserState } from "./user.types";

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
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
      });
  },
});

export const { resetUser } = userSlice.actions;
export default userSlice.reducer;