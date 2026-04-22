// src/pages/Profile.tsx

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getBrandMe, updateBrand } from "@/redux/slices/brandSlice";
import { notify } from "@/components/ui/notify";

export default function Profile() {
  const { user } = useAppSelector((state: any) => state.auth);
  const { brand } = useAppSelector((state: any) => state.brand);
  console.log(brand, "hello");
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"user" | "brand">("user");

  const [isUserEditing, setIsUserEditing] = useState(false);
  const [isBrandEditing, setIsBrandEditing] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);

  // ================= USER FORM =================
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // ================= BRAND FORM =================
  const [brandForm, setBrandForm] = useState({
    brandName: "",
    support_email: "",
    phone: "",
    logo: null as File | null,
    logoUrl: "",
  });

  // ================= SET DATA =================

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
        logoUrl: brand?.logo || "",
      });

      setPreview(brand?.logo || null);
    }
  }, [brand]);

  // ================= HANDLERS =================

  const handleUserChange = (e: any) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleBrandChange = (e: any) => {
    setBrandForm({ ...brandForm, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrandForm({ ...brandForm, logo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      if (activeTab === "user") {
        console.log("User Update:", userForm);
        setIsUserEditing(false);
      } else {
        // ✅ CREATE FORMDATA
        const formData = new FormData();

        formData.append("name", brandForm.brandName);
        formData.append("support_email", brandForm.support_email);
        formData.append("phone", brandForm.phone);

        if (brandForm.logo) {
          formData.append("logo", brandForm.logo);
        }

        // ✅ IMPORTANT: use brand id from API
        const brandId = brand?._id || brand?.id;

        const res = await dispatch(
          updateBrand({ id: brandId, data: formData }),
        ).unwrap();

        notify(res?.message || "Brand updated successfully", "success");
        await dispatch(getBrandMe()).unwrap();
        setIsBrandEditing(false);
      }
    } catch (error: any) {
      notify(error?.errorMessage || "Update failed", "error");
    }
  };

  const isEditing = activeTab === "user" ? isUserEditing : isBrandEditing;

  const setEditing = (value: boolean) => {
    if (activeTab === "user") setIsUserEditing(value);
    else setIsBrandEditing(value);
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-lg bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-center">Profile</h2>

        {/* 🔥 Tabs */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("user")}
            className={`w-full py-2 ${
              activeTab === "user" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            My Profile
          </button>

          <button
            onClick={() => setActiveTab("brand")}
            className={`w-full py-2 ${
              activeTab === "brand" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Brand Profile
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="transition-all duration-300">
          {/* USER TAB */}
          {activeTab === "user" && (
            <>
              <div>
                <label>Name</label>
                <Input
                  name="name"
                  value={userForm.name}
                  onChange={handleUserChange}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label>Email</label>
                <Input value={userForm.email} disabled />
              </div>

              <div>
                <label>Phone</label>
                <Input
                  name="phone"
                  value={userForm.phone}
                  onChange={handleUserChange}
                  disabled={!isEditing}
                />
              </div>
            </>
          )}

          {/* BRAND TAB */}
          {activeTab === "brand" && (
            <>
              <div>
                <label>Brand Name</label>
                <Input
                  name="brandName"
                  value={brandForm.brandName}
                  onChange={handleBrandChange}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label>Support Email</label>
                <Input
                  name="support_email"
                  value={brandForm.support_email}
                  onChange={handleBrandChange}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label>Phone</label>
                <Input
                  name="phone"
                  value={brandForm.phone}
                  onChange={handleBrandChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex justify-center mb-2 mt-2">
                {preview || brandForm.logoUrl ? (
                  <img
                    src={preview || brandForm.logoUrl}
                    alt="brand logo"
                    className="h-20 w-20 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                    No Logo
                  </div>
                )}
              </div>

              {isEditing && (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              )}
            </>
          )}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <>
              <Button className="w-full" onClick={handleSave}>
                Save
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
