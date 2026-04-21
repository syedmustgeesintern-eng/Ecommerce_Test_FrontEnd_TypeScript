import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerBrand, setBrandEmail } from "@/redux/slices/brandSlice";
import { useAppDispatch } from "@/redux/hooks";
import { notify } from "@/components/ui/notify";

export default function BrandSignup() {
  const navigate = useNavigate();

  const { register, handleSubmit, setValue } = useForm();
  const [preview, setPreview] = useState<string | null>(null);
const dispatch=useAppDispatch()
 
const onSubmit = async (data: any) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("phone", data.phone);
  formData.append("support_email", data.support_email);
  formData.append("logo", data.logo);

  try {
     const res = await dispatch(registerBrand(formData)).unwrap();

    dispatch(setBrandEmail(data.email));
  notify(res?.message || "Registered successfully", "success");

  navigate("/brand/verify-otp");
  } catch (error: any) {
  console.error("Registration failed:", error);

  notify(
    error?.errorMessage || "Registration failed",
    "error"
  );
}
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-8 space-y-6">
<h2 className="text-2xl font-bold text-center text-foreground">
             Register Your Brand
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Brand Name" {...register("name")} />

            <Input placeholder="Email" {...register("email")} />

            <Input placeholder="Phone" {...register("phone")} />

            {/* File Upload */}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue("logo", file); // 👈 manually set file
                  setPreview(URL.createObjectURL(file)); // preview
                }
              }}
            />

            {/* Preview */}
            {preview && (
              <img
                src={preview}
                alt="logo preview"
                className="h-20 w-20 object-cover rounded-md"
              />
            )}

            <Input
              placeholder="Support Email"
              {...register("support_email")}
            />

            <Button type="submit" className="w-full">
              Register & Send OTP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}