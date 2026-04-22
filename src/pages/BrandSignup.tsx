import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { registerBrand, setBrandEmail } from "@/redux/slices/brandSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { notify } from "@/components/ui/notify";
import { yupResolver } from "@hookform/resolvers/yup";
import { brandSignupSchema } from "@/validation/brandSchema";

export default function BrandSignup() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    // setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(brandSignupSchema) });
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.brand);
  const onSubmit = async (data: any) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("support_email", data.support_email);
    formData.append("logo", data.logo);

    try {
      const res = await dispatch(registerBrand(formData)).unwrap();
      console.log("🚀 ~ onSubmit ~ res:", res);
      if (res?.status == 201) {
        console.log("coming here");
        dispatch(setBrandEmail(data.email));
        notify(res?.data?.message || "Registered successfully", "success");

        navigate("/brand/verify-otp");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);

      notify(error?.message || "Registration failed", "error");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-8  space-y-6">
          <h2 className="text-2xl font-bold text-center text-foreground">
            Register Your Brand
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 ">
            <Input placeholder="Brand Name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-left text-sm">
                {errors.name.message}
              </p>
            )}

            <Input placeholder="Email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-left text-sm">
                {errors.email.message}
              </p>
            )}

            <Input placeholder="Phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-red-500 text-left text-sm">
                {errors.phone.message}
              </p>
            )}
            <Button type="submit" className="w-full">
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
