import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageCheck, ShoppingCart } from "lucide-react";

import CartSheet from "@/components/CartSheet";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth";
import { fetchCart } from "@/store/features/cart";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.user);
  const itemCount = useAppSelector((state) => state.cart.cart?.itemCount ?? 0);

  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      dispatch(fetchCart());
    }
  }, [dispatch, user?.role]);

  const goHome = () => {
    if (user?.role === "CUSTOMER") {
      navigate("/products");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <header className="h-[100px] w-full bg-gray-200">
      <div className="mx-auto flex h-[100px] w-full items-center justify-between bg-gray-900 px-6 py-4 text-white">
        <h1
          className="cursor-pointer text-lg font-bold"
          onClick={goHome}
        >
          BrandHub
        </h1>

        <div className="flex items-center gap-6">
          {user?.role === "BRAND_OWNER" && (
            <>
              <button
                type="button"
                className="text-sm hover:underline"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
              <button
                type="button"
                className="text-sm hover:underline"
                onClick={() => navigate("/products/create")}
              >
                Create Product
              </button>
              <button
                type="button"
                className="text-sm hover:underline"
                onClick={() => navigate("/my-products")}
              >
                My Products
              </button>
              <button
                type="button"
                className="text-sm hover:underline"
                onClick={() => navigate("/brand")}
              >
                Brand
              </button>
            </>
          )}

          {/* {user?.role === "CUSTOMER" && (
            <button
              type="button"
              className="text-sm hover:underline"
              onClick={() => navigate("/products")}
            >
              Shop
            </button>
          )} */}
        </div>

        <div className="flex items-center gap-4">
          {user?.role === "CUSTOMER" && (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-white/10"
                onClick={() => navigate("/my-orders")}
              >
                <PackageCheck className="h-4 w-4" />
                Orders
              </button>
              <button
                type="button"
                className="relative rounded-md p-2 hover:bg-white/10"
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
              <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
            </>
          )}

          <span className="font-medium">{user?.name || "User"}</span>

          <button
            type="button"
            className="text-sm text-red-400 hover:underline"
            onClick={() => dispatch(logout(navigate))}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
