export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "CUSTOMER" | "BRAND_OWNER";
}

export interface UserAddress {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  streetAddress: string;
  addressLabel: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateAddressPayload = Omit<
  UserAddress,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type UpdateAddressPayload = Partial<
  Omit<UserAddress, "id" | "userId" | "createdAt" | "updatedAt">
>;

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  addresses: UserAddress[];
  addressesLoading: boolean;
  addressMutating: boolean;
}