import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, PackageOpen, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchMyOrders } from "@/store/features/order";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const formatMoney = (value: string | number) => `$${Number(value).toFixed(2)}`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function MyOrders() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, loading, nextCursor, hasMore, error } = useAppSelector(
    (state) => state.order,
  );

  useEffect(() => {
    dispatch(fetchMyOrders({ limit: 5 }));
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            My orders
          </h1>
          <p className="text-sm text-gray-500">
            Track placed orders and review your purchase details.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/products")}>
          <ShoppingBag className="h-4 w-4" />
          Shop
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <PackageOpen className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-950">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your placed orders will appear here.
          </p>
          <Button className="mt-5" onClick={() => navigate("/products")}>
            Browse products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-950">
                      {order.orderNumber}
                    </h2>
                    <Badge>{order.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(order.createdAt)} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 md:min-w-52">
                  <div className="text-left md:text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Total
                    </p>
                    <p className="text-lg font-bold text-gray-950">
                      {formatMoney(order.totalAmount)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() =>
                  dispatch(fetchMyOrders({ limit: 5, cursor: nextCursor }))
                }
              >
                {loading ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
