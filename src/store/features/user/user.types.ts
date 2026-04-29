export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "CUSTOMER" | "BRAND_OWNER";
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}