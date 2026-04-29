import * as yup from "yup";

export const brandSignupSchema = yup.object({
  name: yup.string().required("Brand name is required").min(2, "Too short"),

  email: yup
    .string()
    .email("Invalid email")
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"),

  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[0-9]+$/, "Only numbers allowed")
    .min(10, "Too short"),
});
