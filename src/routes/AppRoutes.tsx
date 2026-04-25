import { BrowserRouter, Routes, Route } from "react-router-dom";
import BrandSignup from "@/pages/BrandSignup";
import VerifyOtp from "@/pages/VerifyOtp";
import LandingPage from "@/pages/LandingPage";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import CustomerSignup from "@/pages/CustomerSignup";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/brand/signup" element={<BrandSignup />} />
        <Route path="/brand/verify-otp" element={<VerifyOtp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/customer/signup" element={<CustomerSignup />} />
      </Routes>
    </BrowserRouter>
  );
} //for enterprise level how to manage routes .
//exception error normalize function.
