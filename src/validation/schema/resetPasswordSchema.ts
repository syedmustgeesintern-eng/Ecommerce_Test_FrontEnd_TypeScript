import * as yup from "yup";

export const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .max(13, "Maximum 13 characters")
    .matches(/[a-zA-Z]/, "At least one letter is required")
    .matches(/[0-9]/, "At least one number is required")
    .matches(/[^a-zA-Z0-9]/, "At least one special character is required"),

  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});