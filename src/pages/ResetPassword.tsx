// ResetPassword.tsx

import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/ui/notify";
import { useAppDispatch } from "@/store/hooks";
import { resetPassword } from "@/store/features/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // ✅ IMPORTANT

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    try {
      if (!token) {
        notify("Invalid or missing token", "error");
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        notify("Passwords do not match", "error");
        return;
      }

      const res = await dispatch(
        resetPassword({
          token,
          newPassword: form.newPassword,
        })
      ).unwrap();

      notify(res?.message || "Password reset successful", "success");

      navigate("/sign-in");
    } catch (err: any) {
      notify(err?.errorMessage || "Reset failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Reset Password</h2>

        <Input
          type="password"
          placeholder="New Password"
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
        />

        <Input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <Button onClick={handleSubmit} className="w-full">
          Update Password
        </Button>
      </div>
    </div>
  );
}