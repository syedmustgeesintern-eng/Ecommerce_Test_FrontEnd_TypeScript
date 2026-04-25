export interface BrandState {
  loading: boolean;
  error: string | null;
  success: boolean;
  // email: string | null;
  brand: any | null;
}

export type RegisterBrandPayload = FormData;

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type UpdateBrandPayload = {
  id: string;
  data: FormData;
};
