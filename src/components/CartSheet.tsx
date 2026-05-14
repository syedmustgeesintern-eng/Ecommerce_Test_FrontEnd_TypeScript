import { useEffect } from "react";
import { ShoppingBag, X, Trash2, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
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
    if (open) {
      dispatch(fetchCart());
    }
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
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-black">Your cart</h2>
            {cart != null && cart.itemCount > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {cart.itemCount} items
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && !cart ? (
            <p className="text-sm text-gray-500 text-black">Loading cart…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500 text-black">
              Your cart is empty.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((line) => (
                <li
                  key={line.id}
                  className="rounded-lg border border-gray-100 p-3 shadow-sm"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium leading-tight">
                        {line.product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {line.variant.sku}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(removeCartItem(line.id)).unwrap()}
                      disabled={mutationLoading}
                      className="shrink-0 rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border">
                      <button
                        type="button"
                        className="p-1.5 hover:bg-gray-50 disabled:opacity-50"
                        disabled={mutationLoading || line.quantity <= 1}
                        onClick={() =>
                          dispatch(
                            updateCartItem({
                              cartItemId: line.id,
                              quantity: Math.max(1, line.quantity - 1),
                            }),
                          ).unwrap()
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4 text-black" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="p-1.5 hover:bg-gray-50 disabled:opacity-50"
                        disabled={
                          mutationLoading || line.quantity >= line.variant.stock
                        }
                        onClick={() =>
                          dispatch(
                            updateCartItem({
                              cartItemId: line.id,
                              quantity: Math.min(
                                line.variant.stock,
                                line.quantity + 1,
                              ),
                            }),
                          ).unwrap()
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4 text-black" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-black">
                      ${Number(line.lineTotal).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-lg font-bold text-black">
                ${Number(cart?.subtotal ?? 0).toFixed(2)}
              </span>
            </div>
            <Button
              variant="outline"
              className="mb-2 w-full text-black"
              disabled={mutationLoading}
              onClick={() => {
                dispatch(clearCart()).unwrap();
              }}
            >
              Clear cart
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
