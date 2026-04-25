import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/ui/notify";
import { useAppDispatch } from "@/store/hooks";
import {
  forgotPassword,
  verifyOtp,
} from "@/store/features/auth";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // ================= STEP 1 =================
  const handleSendOtp = async () => {
    try {
      const res = await dispatch(forgotPassword({ email })).unwrap();

      notify(res?.message || "OTP sent to your email", "success");
      setStep(2);
    } catch (err: any) {
      notify(err?.errorMessage || "Failed to send OTP", "error");
    }
  };

  // ================= STEP 2 =================
  const handleVerifyOtp = async () => {
    try {
      const res = await dispatch(
        verifyOtp({ email, otp })
      ).unwrap();

      notify(
        res?.message || "OTP verified. Check your email for reset link",
        "success"
      );

      // ✅ OPTIONAL: reset state or redirect
      setStep(1);
      setEmail("");
      setOtp("");

    } catch (err: any) {
      notify(err?.errorMessage || "Invalid OTP", "error");
    }
  };

  // ================= UI =================

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow space-y-4">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold">Forgot Password</h2>

            <Input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button onClick={handleSendOtp} className="w-full">
              Send OTP
            </Button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold">Verify OTP</h2>

            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button onClick={handleVerifyOtp} className="w-full">
              Verify OTP
            </Button>
          </>
        )}
      </div>
    </div>
  );
}