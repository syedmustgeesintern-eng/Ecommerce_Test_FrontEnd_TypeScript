import type { FormState, FormVariant } from "./types";

const createLocalId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `variant-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const DEFAULT_ATTRIBUTE_OPTIONS = [
  { label: "Size", value: "size" },
  { label: "Color", value: "color" },
];

export const SIZE_OPTIONS = [
  { label: "XS", value: "xs" },
  { label: "S", value: "s" },
  { label: "M", value: "m" },
  { label: "L", value: "l" },
  { label: "XL", value: "xl" },
];

export const createEmptyVariant = (): FormVariant => ({
  localId: createLocalId(),
  sku: "",
  price: "",
  stock: "",
  attributes: [{ attribute: "", value: "", meta: { hex: "" } }],
});

export const INITIAL_FORM_STATE: FormState = {
  name: "",
  description: "",
  basePrice: "",
  sku: "",
  categoryIds: [],
  variants: [],
};

export const createResetFormState = (): FormState => ({
  ...INITIAL_FORM_STATE,
  variants: [createEmptyVariant()],
});
