import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchOrderById } from "@/store/features/order";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const formatMoney = (value: string | number | undefined) =>
  `$${Number(value ?? 0).toFixed(2)}`;

const formatDate = (value: string | undefined) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "";

export default function OrderDetails() {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const { selectedOrder: order, detailsLoading, error } = useAppSelector(
    (state) => state.order,
  );

  useEffect(() => {
    
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  if (detailsLoading || (!order && !error)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-[520px] animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-950">Order not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          {error || "We could not load this order."}
        </p>
        <Button className="mt-5" asChild>
          <Link to="/my-orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              {order.orderNumber}
            </h1>
            <Badge>{order.status}</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <Button asChild>
          <Link to="/products">Continue shopping</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-800" />
            <h2 className="text-xl font-semibold text-gray-950">Items</h2>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {(item.variant.product.images?.[0]?.url ?? item.variant.images?.[0]?.url) ? (
                    <img
                      src={item.variant.product.images?.[0]?.url ?? item.variant.images?.[0]?.url}
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
                      <p className="mt-1 text-xs text-gray-500">{item.variant.sku}</p>
                    </div>
                    <p className="font-semibold text-gray-950">
                      {formatMoney(Number(item.unitPrice) * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    {Object.entries(item.selectedAttributes ?? {}).map(
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
        </section>

        <aside className="space-y-6">
          {order.statusHistory?.length ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-950">
                Status history
              </h2>
              <div className="space-y-3">
                {order.statusHistory.map((history) => (
                  <div key={history.id} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-950">
                        {history.newStatus}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(history.changedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-800" />
              <h2 className="text-xl font-semibold text-gray-950">Shipping</h2>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-950">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 ? (
                <p>{order.shippingAddress.addressLine2}</p>
              ) : null}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-950">
              Payment summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatMoney(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-bold text-gray-950">
                <span>Total</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
