import * as yup from "yup";

export const customerSignupSchema = yup.object({
  name: yup.string().required("Name is required"),
   email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Enter a valid email address"
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .max(13, "Maximum 13 characters")
    .matches(/[a-zA-Z]/, "At least one letter is required")
    .matches(/[0-9]/, "At least one number is required")
    .matches(/[^a-zA-Z0-9]/, "At least one special character is required"),
});
