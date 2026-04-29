import { lazy } from "react";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const CustomerSignup = lazy(() => import("@/pages/CustomerSignup"));
const BrandSignup = lazy(() => import("@/pages/BrandSignup"));
const VerifyOtp = lazy(() => import("@/pages/VerifyOtp"));

export const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/sign-in", element: <SignIn /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/customer/signup", element: <CustomerSignup /> },
  { path: "/brand/signup", element: <BrandSignup /> },
  { path: "/brand/verify-otp", element: <VerifyOtp /> },
];