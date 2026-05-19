import { useEffect } from "react";
import { ShoppingBag, X, Trash2, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { normalizeAttributes } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "@/store/features/cart";

type CartSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartSheet({ open, onClose }: CartSheetProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, loading, mutationLoading } = useAppSelector(
    (state) => state.cart,
  );

  useEffect(() => {
    if (open) dispatch(fetchCart());
  }, [open, dispatch]);

  const items = cart?.items ?? [];

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close cart"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Your cart</h2>
            {(cart?.itemCount ?? 0) > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {cart!.itemCount} items
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && !cart ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300" />
              <p className="text-base font-medium text-gray-500">Your cart is empty</p>
              <Button
                variant="outline"
                size="sm"
                className="text-black"
                onClick={() => { onClose(); navigate("/products"); }}
              >
                Browse products
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  {/* Product image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {line.product.imageUrl ? (
                      <img
                        src={line.product.imageUrl}
                        alt={line.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 leading-tight">
                          {line.product.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">{line.variant.sku}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void dispatch(removeCartItem(line.id)).unwrap()}
                        disabled={mutationLoading}
                        className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Attribute chips */}
                    {line.variant.attributes && Object.keys(line.variant.attributes).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(normalizeAttributes(line.variant.attributes)).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Qty controls + line total */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          disabled={mutationLoading || line.quantity <= 1}
                          onClick={() =>
                            void dispatch(
                              updateCartItem({
                                cartItemId: line.id,
                                quantity: Math.max(1, line.quantity - 1),
                              }),
                            ).unwrap()
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5 text-gray-700" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          disabled={mutationLoading || line.quantity >= line.variant.stock}
                          onClick={() =>
                            void dispatch(
                              updateCartItem({
                                cartItemId: line.id,
                                quantity: Math.min(line.variant.stock, line.quantity + 1),
                              }),
                            ).unwrap()
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-700" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        ${line.lineTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-white px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">
                ${Number(cart?.subtotal ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => { onClose(); navigate("/checkout"); }}
              >
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                disabled={mutationLoading}
                onClick={() => void dispatch(clearCart()).unwrap()}
              >
                Clear cart
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
