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
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const initialAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
};

const formatMoney = (value: number | string | undefined) =>
  `$${Number(value ?? 0).toFixed(2)}`;

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);
  const { placing } = useAppSelector((state) => state.order);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress>(initialAddress);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const items = cart?.items ?? [];
  const subtotal = Number(cart?.subtotal ?? 0);
  const canPlaceOrder = items.length > 0 && !placing;

  const itemPayload = useMemo(
    () =>
      items.map((item) => ({
        variantId: item.variant.id,
        quantity: item.quantity,
      })),
    [items],
  );

  const handleFieldChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!items.length) {
      notify("Your cart is empty.", "warning");
      navigate("/products");
      return;
    }

    try {
      const order = await dispatch(
        createOrder({
          items: itemPayload,
          shippingAddress: {
            ...shippingAddress,
            addressLine2: shippingAddress.addressLine2 || "",
          },
        }),
      ).unwrap();
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
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-[420px] animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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
        <Link
          to="/my-orders"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          My orders
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-950">
            Your cart is empty
          </h2>
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
          className="mx-auto flex max-w-2xl flex-col gap-6"
        >
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-800" />
              <h2 className="text-xl font-semibold text-gray-950">
                Shipping address
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-gray-700">
                Full name
                <Input
                  required
                  value={shippingAddress.fullName}
                  onChange={(event) =>
                    handleFieldChange("fullName", event.target.value)
                  }
                  placeholder="Mustaghees"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-gray-700">
                Phone
                <Input
                  required
                  value={shippingAddress.phone}
                  onChange={(event) =>
                    handleFieldChange("phone", event.target.value)
                  }
                  placeholder="03001234567"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-gray-700">
                City
                <Input
                  required
                  value={shippingAddress.city}
                  onChange={(event) =>
                    handleFieldChange("city", event.target.value)
                  }
                  placeholder="Lahore"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-gray-700">
                Postal code
                <Input
                  required
                  value={shippingAddress.postalCode}
                  onChange={(event) =>
                    handleFieldChange("postalCode", event.target.value)
                  }
                  placeholder="54000"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-gray-700 sm:col-span-2">
                Address line 1
                <Input
                  required
                  value={shippingAddress.addressLine1}
                  onChange={(event) =>
                    handleFieldChange("addressLine1", event.target.value)
                  }
                  placeholder="Canal City"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-gray-700 sm:col-span-2">
                Address line 2
                <Input
                  value={shippingAddress.addressLine2 ?? ""}
                  onChange={(event) =>
                    handleFieldChange("addressLine2", event.target.value)
                  }
                  placeholder="Near Park"
                />
              </label>
            </div>
          </section>

          <aside className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 p-5">
              <Package className="h-5 w-5 text-gray-800" />
              <h2 className="text-xl font-semibold text-gray-950">
                Order summary
              </h2>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                  >
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
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-950">
                            {item.product.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.variant.sku}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-950">
                          {formatMoney(item.lineTotal)}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                        {Object.entries(item.variant.attributes ?? {}).map(
                          ([key, value]) => (
                            <span
                              key={key}
                              className="rounded-md bg-gray-100 px-2 py-1"
                            >
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
            </div>

            <div className="shrink-0 border-t border-gray-100 p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatMoney(0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-950">
                  <span>Total</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
              </div>
              <Button
                type="submit"
                className="mt-4 h-10 w-full"
                disabled={!canPlaceOrder}
              >
                {placing ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}
