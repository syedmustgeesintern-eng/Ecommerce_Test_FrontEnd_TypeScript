import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Package, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/components/ui/notify";
import { clearCart, fetchCart } from "@/store/features/cart";
import { createOrder } from "@/store/features/order";
import type { ShippingAddress } from "@/store/features/order";
import { fetchAddresses } from "@/store/features/user";
import type { UserAddress } from "@/store/features/user";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { normalizeAttributes } from "@/lib/utils";

const MANUAL_KEY = "__manual__";

const emptyAddress: ShippingAddress = {
  fullName: "",
  phoneNumber: "",
  country: "",
  city: "",
  state: "",
  postalCode: "",
  streetAddress: "",
};

const mapUserAddressToShipping = (a: UserAddress): ShippingAddress => ({
  fullName: a.fullName,
  phoneNumber: a.phoneNumber,
  country: a.country,
  city: a.city,
  state: a.state,
  postalCode: a.postalCode,
  streetAddress: a.streetAddress,
});

const formatMoney = (value: number | string | undefined) =>
  `$${Number(value ?? 0).toFixed(2)}`;

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { cart, loading } = useAppSelector((state) => state.cart);
  const { placing } = useAppSelector((state) => state.order);
  const { addresses, addressesLoading } = useAppSelector((state: any) => state.user);

  const [selectedAddressId, setSelectedAddressId] = useState<string>(MANUAL_KEY);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(emptyAddress);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
  }, [dispatch]);

  // When addresses load, pre-select the default one and fill the form
  useEffect(() => {
    if (!addresses?.length) return;
    const defaultAddr: UserAddress | undefined =
      addresses.find((a: UserAddress) => a.isDefault) ?? addresses[0];
    setSelectedAddressId(defaultAddr.id);
    setShippingAddress(mapUserAddressToShipping(defaultAddr));
  }, [addresses]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === MANUAL_KEY) {
      setShippingAddress(emptyAddress);
    } else {
      const found: UserAddress | undefined = addresses.find((a: UserAddress) => a.id === id);
      if (found) setShippingAddress(mapUserAddressToShipping(found));
    }
  };

  const handleFieldChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const items = cart?.items ?? [];
  const subtotal = Number(cart?.subtotal ?? 0);
  const canPlaceOrder = items.length > 0 && !placing;
  const isManual = selectedAddressId === MANUAL_KEY;

  const itemPayload = useMemo(
    () => items.map((item) => ({ variantId: item.variant.id, quantity: item.quantity })),
    [items],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!items.length) {
      notify("Your cart is empty.", "warning");
      navigate("/products");
      return;
    }

    try {
      const payload = isManual
        ? { items: itemPayload, shippingAddress }
        : { items: itemPayload, addressId: selectedAddressId };

      const order = await dispatch(createOrder(payload)).unwrap();
      await dispatch(clearCart()).unwrap();
      notify("Order placed successfully.", "success");
      navigate(`/orders/${order.id}`);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "Failed to place order";
      notify(message, "error");
    }
  };

  if (loading && !cart) {
    return (
      <div className="w-full px-6 py-10 xl:px-10">
        <div className="h-[420px] animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  const selectedAddr: UserAddress | undefined = addresses?.find(
    (a: UserAddress) => a.id === selectedAddressId,
  );

  return (
    <div className="w-full px-6 py-8 xl:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
            Checkout
          </h1>
        </div>
        <Link to="/my-orders" className="text-sm font-medium text-gray-600 hover:text-black">
          My orders
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-950">Your cart is empty</h2>
          <p className="mt-2 text-sm text-gray-500">
            Add products to your cart before checking out.
          </p>
          <Button className="mt-5" onClick={() => navigate("/products")}>
            Shop products
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]"
        >
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* SHIPPING ADDRESS */}
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-800" />
                <h2 className="text-xl font-semibold text-gray-950">Shipping address</h2>
              </div>

              {/* Saved address dropdown */}
              {addressesLoading ? (
                <div className="mb-4 h-10 animate-pulse rounded-lg bg-gray-100" />
              ) : addresses?.length > 0 ? (
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Select an address
                  </label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => handleAddressSelect(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {addresses.map((addr: UserAddress) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.addressLabel} — {addr.streetAddress}, {addr.city}
                        {addr.isDefault ? " (Default)" : ""}
                      </option>
                    ))}
                    <option value={MANUAL_KEY}>+ Enter a new address</option>
                  </select>
                </div>
              ) : null}

              {/* Read-only summary for saved address */}
              {!isManual && selectedAddr ? (
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-1 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">{selectedAddr.fullName}</p>
                  <p>{selectedAddr.phoneNumber}</p>
                  <p>{selectedAddr.streetAddress}</p>
                  <p>
                    {selectedAddr.city}, {selectedAddr.state} {selectedAddr.postalCode}
                  </p>
                  <p>{selectedAddr.country}</p>
                </div>
              ) : (
                /* Manual inline form */
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-medium text-gray-700">
                    Full name
                    <Input
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      placeholder="Mustaghees"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium text-gray-700">
                    Phone number
                    <Input
                      required
                      value={shippingAddress.phoneNumber}
                      onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                      placeholder="+923001234567"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium text-gray-700">
                    Country
                    <Input
                      required
                      value={shippingAddress.country}
                      onChange={(e) => handleFieldChange("country", e.target.value)}
                      placeholder="Pakistan"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium text-gray-700">
                    City
                    <Input
                      required
                      value={shippingAddress.city}
                      onChange={(e) => handleFieldChange("city", e.target.value)}
                      placeholder="Lahore"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium text-gray-700">
                    State
                    <Input
                      required
                      value={shippingAddress.state}
                      onChange={(e) => handleFieldChange("state", e.target.value)}
                      placeholder="Punjab"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium text-gray-700">
                    Postal code
                    <Input
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                      placeholder="54000"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium text-gray-700 sm:col-span-2">
                    Street address
                    <Input
                      required
                      value={shippingAddress.streetAddress}
                      onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
                      placeholder="Canal City Lahore"
                    />
                  </label>
                </div>
              )}
            </section>

            {/* ITEMS */}
            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 p-5">
                <Package className="h-5 w-5 text-gray-800" />
                <h2 className="text-xl font-semibold text-gray-950">Items</h2>
                <span className="ml-auto text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-gray-100 p-5">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-950">{item.product.name}</h3>
                          <p className="mt-0.5 text-xs text-gray-500">{item.variant.sku}</p>
                        </div>
                        <p className="shrink-0 font-semibold text-gray-950">
                          {formatMoney(item.lineTotal)}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                        {Object.entries(normalizeAttributes(item.variant.attributes ?? {})).map(
                          ([key, value]) => (
                            <span key={key} className="rounded-md bg-gray-100 px-2 py-1">
                              {key}: {value}
                            </span>
                          ),
                        )}
                        <span className="rounded-md bg-gray-100 px-2 py-1">
                          Qty: {item.quantity}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2 py-1">
                          Unit: {formatMoney(item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — Order summary */}
          <aside className="sticky top-6 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 p-5">
              <Package className="h-5 w-5 text-gray-800" />
              <h2 className="text-xl font-semibold text-gray-950">Order summary</h2>
            </div>
            <div className="p-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-950">
                  <span>Total</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
              </div>
              <Button type="submit" className="mt-5 h-11 w-full text-sm" disabled={!canPlaceOrder}>
                {placing ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}
