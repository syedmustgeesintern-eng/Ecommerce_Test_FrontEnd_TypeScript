// src/pages/Profile.tsx

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notify } from "@/components/ui/notify";
import { getBrandMe, updateBrand } from "@/store/features/brand";
import { changePassword } from "@/store/features/auth";
import { Spinner } from "@/components/ui/spinner";
import FormField from "@/components/FormField";
import {
  createAddress,
  fetchAddresses,
  getMe,
  setDefaultAddress,
  updateAddress,
  updateUser,
} from "@/store/features/user";
import type { CreateAddressPayload, UserAddress } from "@/store/features/user";
import { changePasswordSchema } from "@/validation/schema/changePasswordSchema";

const emptyAddressForm = (): CreateAddressPayload => ({
  fullName: "",
  phoneNumber: "",
  country: "",
  city: "",
  state: "",
  postalCode: "",
  streetAddress: "",
  addressLabel: "Home",
  isDefault: false,
});

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user, addresses, addressesLoading, addressMutating } = useAppSelector(
    (state: any) => state.user,
  );
  const { brand } = useAppSelector((state: any) => state.brand);
  const [brandLoading, setBrandLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [isBrandEditing, setIsBrandEditing] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUserEditing, setIsUserEditing] = useState(false);

  // ADDRESS STATE
  const [expandedAddressId, setExpandedAddressId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserAddress>>({});
  const [addForm, setAddForm] = useState<CreateAddressPayload>(emptyAddressForm());
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

  // Fetch addresses on mount for customers
  useEffect(() => {
    if (isCustomer) dispatch(fetchAddresses());
  }, [isCustomer, dispatch]);

  // ADDRESS HANDLERS
  const handleCreateAddress = async () => {
    const required: (keyof CreateAddressPayload)[] = [
      "fullName", "phoneNumber", "country", "city", "state", "postalCode", "streetAddress",
    ];
    for (const key of required) {
      if (!addForm[key]) {
        notify(`${key} is required`, "error");
        return;
      }
    }
    try {
      await dispatch(createAddress(addForm)).unwrap();
      notify("Address added", "success");
      setShowAddForm(false);
      setAddForm(emptyAddressForm());
    } catch (e: any) {
      notify(e?.message || "Failed to add address", "error");
    }
  };

  const handleUpdateAddress = async (id: string) => {
    try {
      await dispatch(updateAddress({ id, data: editForm })).unwrap();
      notify("Address updated", "success");
      setEditingAddressId(null);
    } catch (e: any) {
      notify(e?.message || "Failed to update address", "error");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap();
      notify("Default address updated", "success");
    } catch (e: any) {
      notify(e?.message || "Failed to set default", "error");
    }
  };

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

        {/* ================= ADDRESSES (CUSTOMER ONLY) ================= */}
        {isCustomer && (
          <>
            <div className="border-t border-gray-300 my-6" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Saved Addresses</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm((v) => !v);
                    setAddForm(emptyAddressForm());
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Address
                </Button>
              </div>

              {/* ADD FORM */}
              {showAddForm && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <h4 className="font-medium text-gray-800">New Address</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(
                      [
                        { label: "Full Name", key: "fullName" },
                        { label: "Phone Number", key: "phoneNumber" },
                        { label: "Street Address", key: "streetAddress" },
                        { label: "City", key: "city" },
                        { label: "State", key: "state" },
                        { label: "Country", key: "country" },
                        { label: "Postal Code", key: "postalCode" },
                        { label: "Label (Home / Work)", key: "addressLabel" },
                      ] as { label: string; key: keyof CreateAddressPayload }[]
                    ).map(({ label, key }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">{label}</label>
                        <Input
                          value={String(addForm[key] ?? "")}
                          onChange={(e) =>
                            setAddForm((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder={label}
                        />
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.isDefault}
                      onChange={(e) =>
                        setAddForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                      }
                    />
                    Set as default address
                  </label>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" disabled={addressMutating} onClick={handleCreateAddress}>
                      {addressMutating ? <Spinner className="mr-1" /> : null}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* ADDRESS LIST */}
              {addressesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-sm text-gray-500">No addresses saved yet.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr: UserAddress) => {
                    const isExpanded = expandedAddressId === addr.id;
                    const isEditing = editingAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                      >
                        {/* HEADER ROW — always visible */}
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
                          onClick={() =>
                            setExpandedAddressId(isExpanded ? null : addr.id)
                          }
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-900 text-sm">
                                {addr.addressLabel}
                              </span>
                              {addr.isDefault && (
                                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-xs text-white">
                                  <Star className="h-3 w-3" />
                                  Default
                                </span>
                              )}
                              <p className="text-xs text-gray-500 truncate">
                                {addr.streetAddress}, {addr.city}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                        </button>

                        {/* EXPANDED CONTENT */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                            {!isEditing ? (
                              <>
                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                                  {[
                                    ["Full Name", addr.fullName],
                                    ["Phone", addr.phoneNumber],
                                    ["Street", addr.streetAddress],
                                    ["City", addr.city],
                                    ["State", addr.state],
                                    ["Country", addr.country],
                                    ["Postal Code", addr.postalCode],
                                  ].map(([label, value]) => (
                                    <div key={label}>
                                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                                        {label}
                                      </span>
                                      <p className="font-medium">{value}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingAddressId(addr.id);
                                      setEditForm({
                                        fullName: addr.fullName,
                                        phoneNumber: addr.phoneNumber,
                                        streetAddress: addr.streetAddress,
                                        city: addr.city,
                                        state: addr.state,
                                        country: addr.country,
                                        postalCode: addr.postalCode,
                                        addressLabel: addr.addressLabel,
                                      });
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  {!addr.isDefault && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={addressMutating}
                                      onClick={() => handleSetDefault(addr.id)}
                                    >
                                      {addressMutating ? (
                                        <Spinner className="mr-1" />
                                      ) : (
                                        <Star className="h-3.5 w-3.5 mr-1" />
                                      )}
                                      Set as Default
                                    </Button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {(
                                    [
                                      { label: "Full Name", key: "fullName" },
                                      { label: "Phone Number", key: "phoneNumber" },
                                      { label: "Street Address", key: "streetAddress" },
                                      { label: "City", key: "city" },
                                      { label: "State", key: "state" },
                                      { label: "Country", key: "country" },
                                      { label: "Postal Code", key: "postalCode" },
                                      { label: "Label", key: "addressLabel" },
                                    ] as { label: string; key: keyof UserAddress }[]
                                  ).map(({ label, key }) => (
                                    <div key={key} className="space-y-1">
                                      <label className="text-xs font-medium text-gray-600">
                                        {label}
                                      </label>
                                      <Input
                                        value={String(editForm[key] ?? "")}
                                        onChange={(e) =>
                                          setEditForm((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    disabled={addressMutating}
                                    onClick={() => handleUpdateAddress(addr.id)}
                                  >
                                    {addressMutating ? <Spinner className="mr-1" /> : null}
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingAddressId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
