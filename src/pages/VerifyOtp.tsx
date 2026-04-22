import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { verifyBrandOtp } from "@/redux/slices/brandSlice";
import { useNavigate } from "react-router-dom";
import { notify } from "@/components/ui/notify";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const email = useAppSelector((state) => state.brand.email);

  const { loading } = useAppSelector((state) => state.brand);

  const handleVerify = async () => {
    if (!otp) return;

    try {
      const res = await dispatch(
        verifyBrandOtp({
          email: email!,
          otp,
        }),
      ).unwrap();
      if (res?.status == 201) {
        notify(res?.data?.message || "OTP Verification Successful", "success");
        navigate("/sign-in");
      }
    } catch (error) {
      notify(error?.errorMessage || "Otp verification failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 space-y-6 text-center">
          <h2 className="text-2xl font-bold text-black">Verify OTP</h2>

          <p className="text-gray-600">Enter the OTP sent to your email</p>

          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button className="w-full" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
