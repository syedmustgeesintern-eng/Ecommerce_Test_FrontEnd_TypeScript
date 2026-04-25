import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notify } from "@/components/ui/notify";
import { signInSchema } from "@/validation/signInSchema";
import { login } from "@/store/features/auth";
import { Spinner } from "@/components/ui/spinner";
export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await dispatch(login(data)).unwrap();
      notify(res?.message || "Login successful", "success");
      navigate("/home");
    } catch (error: any) {
      notify(error?.errorMessage || "Login failed", "error");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-foreground">
            Sign In
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div>
              <Input
                placeholder="Email"
                disabled={loading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                disabled={loading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
              <div className="text-right mt-1">
                <span
                  className="text-sm text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-sm text-center text-gray-500">
              Don’t have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Register
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
