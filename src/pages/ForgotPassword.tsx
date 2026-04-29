import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/ui/notify";
import { useAppDispatch } from "@/store/hooks";
import { forgotPassword, verifyOtp } from "@/store/features/auth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // ================= STEP 1 =================
  const handleSendOtp = async () => {
    try {
      setSendOtpLoading(true);

      const res = await dispatch(forgotPassword({ email })).unwrap();

      notify(res?.message || "OTP sent to your email", "success");
      setStep(2);
    } catch (err: any) {
      notify(err?.errorMessage || "Failed to send OTP", "error");
    } finally {
      setSendOtpLoading(false);
    }
  };

  // ================= STEP 2 =================
  const handleVerifyOtp = async () => {
    try {
      setVerifyOtpLoading(true);

      const res = await dispatch(verifyOtp({ email, otp })).unwrap();

      notify(
        res?.message || "OTP verified. Check your email for reset link",
        "success",
      );

      navigate("/sign-in");
    } catch (err: any) {
      notify(err?.errorMessage || "Invalid OTP", "error");
    } finally {
      setVerifyOtpLoading(false);
    }
  };

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

            <Button
              onClick={handleSendOtp}
              className="w-full"
              disabled={sendOtpLoading}
            >
              {sendOtpLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Sending...
                </>
              ) : (
                "Send OTP"
              )}
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

            <Button
              onClick={handleVerifyOtp}
              className="w-full"
              disabled={verifyOtpLoading}
            >
              {verifyOtpLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
