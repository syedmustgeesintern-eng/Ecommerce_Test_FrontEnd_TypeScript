export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  loading: boolean;
  error: string | null;
  user: any | null;
  otp: {
    email: string | null;
    type: "brand" | "customer" | null;
  };
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
