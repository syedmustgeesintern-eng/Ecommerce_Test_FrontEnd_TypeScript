import { BrowserRouter, Routes, Route } from "react-router-dom";
import BrandSignup from "@/pages/BrandSignup";
import VerifyOtp from "@/pages/VerifyOtp";
import LandingPage from "@/pages/LandingPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/brand/signup" element={<BrandSignup />} />
        <Route path="/brand/verify-otp" element={<VerifyOtp />} />
      </Routes>
    </BrowserRouter>
  );
}