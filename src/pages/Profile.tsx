// src/pages/Profile.tsx

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notify } from "@/components/ui/notify";
import { getBrandMe, updateBrand } from "@/store/features/brand";
import { changePassword } from "@/store/features/auth";
import { Spinner } from "@/components/ui/spinner";
import FormField from "@/components/FormField";
import { getMe, updateUser } from "@/store/features/user";
import { changePasswordSchema } from "@/validation/schema/changePasswordSchema";

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.user);
  const { brand } = useAppSelector((state: any) => state.brand);
  const [brandLoading, setBrandLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [isBrandEditing, setIsBrandEditing] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUserEditing, setIsUserEditing] = useState(false);
  //  USER FORM
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  //  BRAND FORM
  const [brandForm, setBrandForm] = useState({
    brandName: "",
    support_email: "",
    phone: "",
    logo: null as File | null,
    logoUrl: "",
  });

  //  PASSWORD FORM
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
useEffect(() => {
  if (user && user.role !== "CUSTOMER") {
    dispatch(getBrandMe());
  }
}, [user]);

  //  SET USER
  useEffect(() => {
    if (user) {
      setUserForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (brand) {
      setBrandForm({
        brandName: brand?.name || "",
        support_email: brand?.support_email || "",
        phone: brand?.phone || "",
        logo: null,
        logoUrl: brand?.logo_url || "",
      });

      setPreview(brand?.logo_url || null);
    }
  }, [brand]);

  //  HANDLERS

  const handleUserChange = (e: any) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleBrandChange = (e: any) => {
    setBrandForm({ ...brandForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: any) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleImageClick = () => {
    if (isBrandEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleLogoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setBrandForm({ ...brandForm, logo: file });
      setPreview(objectUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleBrandSave = async () => {
    try {
      setBrandLoading(true);

      const formData = new FormData();

      formData.append("name", brandForm.brandName);
      formData.append("supportEmail", brandForm.support_email);
      formData.append("phone", brandForm.phone);

      if (brandForm.logo) {
        formData.append("logo", brandForm.logo);
      }

      const brandId = brand?.id || brand?._id;

      if (!brandId) {
        notify("Brand ID missing", "error");
        return;
      }

      const res = await dispatch(
        updateBrand({ id: brandId, data: formData }),
      ).unwrap();

      notify(res?.message || "Brand updated successfully", "success");

      await dispatch(getBrandMe()).unwrap();

      setIsBrandEditing(false);
    } catch (error: any) {
      notify(error?.message || "Update failed", "error");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleUserSave = async () => {
    try {
      if (!userForm.name) {
        notify("Name is required", "error");
        return;
      }

      setUserLoading(true);

      const res = await dispatch(updateUser({ name: userForm.name })).unwrap();

      dispatch(getMe());

      notify(res?.message || "User updated successfully", "success");
    } catch (error: any) {
      notify(error?.message || "Update failed", "error");
    } finally {
      setUserLoading(false);
    }
  };
  const handlePasswordSave = async () => {
    try {
      setPasswordLoading(true);
      setPasswordErrors({}); // clear previous errors

      await changePasswordSchema.validate(passwordForm, {
        abortEarly: false,
      });

      const res = await dispatch(
        changePassword({
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      ).unwrap();

      notify(res?.message || "Password updated successfully", "success");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      if (error.inner) {
        const formattedErrors: Record<string, string> = {};

        error.inner.forEach((err: any) => {
          if (!formattedErrors[err.path]) {
            formattedErrors[err.path] = err.message;
          }
        });

        setPasswordErrors(formattedErrors);
      } else {
        notify(error.message || "Something went wrong", "error");
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  const isCustomer = user?.role === "CUSTOMER";
  return (
    <div className="min-h-screen p-6">
      <div className="w-full bg-white shadow rounded-xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Profile</h2>

          {!isCustomer && (
            <div className="flex gap-2">
              {!isBrandEditing ? (
                <Button onClick={() => setIsBrandEditing(true)}>Edit</Button>
              ) : (
                <>
                  <Button onClick={handleBrandSave} disabled={brandLoading}>
                    {brandLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsBrandEditing(false)}
                    disabled={brandLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {!isCustomer && (
          <div className="space-y-6">
            {/* LOGO */}
            <div className="flex flex-col items-center gap-3">
              {preview ? (
                <img
                  src={preview}
                  alt="brand logo"
                  onClick={handleImageClick}
                  className={`h-32 w-32 rounded-full object-cover border ${
                    isBrandEditing ? "cursor-pointer hover:opacity-80" : ""
                  }`}
                />
              ) : (
                <div
                  onClick={handleImageClick}
                  className={`h-32 w-32 rounded-full border flex items-center justify-center bg-gray-200 text-gray-500 ${
                    isBrandEditing ? "cursor-pointer hover:bg-gray-300" : ""
                  }`}
                >
                  No Logo
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
            {/* FIELDS */}
            <div className="space-y-4">
              <FormField
                label="Brand Name"
                name="brandName"
                value={brandForm.brandName}
                onChange={handleBrandChange}
                disabled={!isBrandEditing}
              />

              <FormField
                label="Support Email"
                name="support_email"
                value={brandForm.support_email}
                onChange={handleBrandChange}
                disabled={!isBrandEditing}
              />

              <FormField
                label="Phone"
                name="phone"
                value={brandForm.phone}
                onChange={handleBrandChange}
                disabled={!isBrandEditing}
              />
            </div>
          </div>
        )}

        {/* ================= DIVIDER ================= */}
        <div className="border-t border-gray-300 my-6" />
        {/* ================= PERSONAL INFO ================= */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-left font-semibold">
              Personal Information
            </h3>

            <div className="flex gap-2">
              {!isUserEditing ? (
                <Button onClick={() => setIsUserEditing(true)}>Edit</Button>
              ) : (
                <>
                  <Button onClick={handleUserSave} disabled={userLoading}>
                    {userLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsUserEditing(false);
                      setUserForm({
                        name: user?.name || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                      });
                    }}
                    disabled={userLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Name"
              name="name"
              value={userForm.name}
              onChange={handleUserChange}
              disabled={!isUserEditing}
            />

            {isCustomer && (
              <>
                <FormField
                  label="Email"
                  name="email"
                  value={userForm.email}
                  disabled
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleUserChange}
                  disabled={!isUserEditing}
                />
              </>
            )}
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="border-t border-gray-300 my-6" />
        {/* ================= CHANGE PASSWORD ================= */}
        <div className="space-y-4">
          <h3 className="text-lg  text-left font-semibold">Change Password</h3>

          <div className="grid md:grid-cols-2 gap-2">
            <FormField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
            />

            <FormField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
            />

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePasswordSave} disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
