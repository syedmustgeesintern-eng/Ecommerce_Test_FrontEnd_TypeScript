import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";



import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notify } from "@/components/ui/notify";
import { Spinner } from "@/components/ui/spinner";

import * as yup from "yup";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registerCustomer, setOtpData } from "@/store/features/auth";
import { Button } from "@/components/ui/button";

// ✅ Validation
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6).required("Password is required"),
});

export default function CustomerSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state: any) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await dispatch(registerCustomer(data)).unwrap();
dispatch(setOtpData({ email: data.email, type: "customer" }));
      notify(res?.message || "Registered successfully", "success");

      navigate("/brand/verify-otp");
    } catch (error: any) {
      notify(error?.message || "Signup failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Customer Sign Up
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input placeholder="Name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}

            <Input placeholder="Email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}

            <Input
              type="password"
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-sm text-center">
              Already have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/sign-in")}
              >
                Login
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}