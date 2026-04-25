// src/redux/store.ts

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/auth/auth.slice";
import brandReducer from "./features/brand/brand.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  brand: brandReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
