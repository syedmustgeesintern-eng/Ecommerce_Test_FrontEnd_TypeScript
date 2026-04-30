import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/ui/notify";
import { useAppDispatch } from "@/store/hooks";
import { resetPassword } from "@/store/features/auth";
import { Spinner } from "@/components/ui/spinner";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "@/validation/schema/resetPasswordSchema";
import { useState } from "react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      if (!token) {
        notify("Invalid or missing token", "error");
        return;
      }

      setLoading(true);

      const res = await dispatch(
        resetPassword({
          token,
          newPassword: data.newPassword,
        })
      ).unwrap();

      notify(res?.message || "Password reset successful", "success");

      navigate("/sign-in");
    } catch (err: any) {
      notify(err?.errorMessage || "Reset failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Reset Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* NEW PASSWORD */}
          <Input
            type="password"
            placeholder="New Password"
            {...register("newPassword")}
            className={errors.newPassword ? "border-red-500" : ""}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">
              {errors.newPassword.message}
            </p>
          )}

          {/* CONFIRM PASSWORD */}
          <Input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}