import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";
import { notify } from "@/components/ui/notify";
import { verifyOtp } from "@/store/features/auth";
export default function VerifyOtp() {
  const [otpCode, setOtpCode] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { otp } = useAppSelector((state: any) => state.auth);
  const { loading: brandLoading } = useAppSelector((state: any) => state.brand);
  const { loading: authLoading } = useAppSelector((state: any) => state.auth);

  const loading = brandLoading || authLoading;
  const handleVerify = async () => {
    if (!otpCode) {
      notify("OTP is required", "error");
      return;
    }
    if (!otp?.email || !otp?.type) {
      notify("Invalid OTP session", "error");
      return;
    }
    try {
      let res;

      if (otp.type === "brand") {
        res = await dispatch(
          verifyOtp({
            email: otp.email,
            otp: otpCode,
          }),
        ).unwrap();
      } else if (otp.type === "customer") {
        res = await dispatch(
          verifyOtp({
            email: otp.email,
            otp: otpCode,
          }),
        ).unwrap();
      } else {
        notify("Invalid flow", "error");
        return;
      }
      notify(res?.message || "OTP Verification Successful", "success");
      navigate("/sign-in");
    } catch (error: any) {
      notify(error?.message || "OTP verification failed", "error");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 space-y-6 text-center">
          <h2 className="text-2xl font-bold text-black">Verify OTP</h2>
          <p className="text-gray-600">
            OTP sent to: <span className="font-medium">{otp?.email}</span>
          </p>
          <Input
            placeholder="Enter OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />
          <Button className="w-full" onClick={handleVerify} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
