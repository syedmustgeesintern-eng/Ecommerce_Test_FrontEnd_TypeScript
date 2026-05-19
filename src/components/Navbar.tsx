import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageCheck, ShoppingCart, Store } from "lucide-react";

import CartSheet from "@/components/CartSheet";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth";
import { fetchCart } from "@/store/features/cart";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, loading } = useAppSelector((state: any) => state.user);
  const itemCount = useAppSelector((state) => state.cart.cart?.itemCount ?? 0);

  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      dispatch(fetchCart());
    }
  }, [dispatch, user?.role]);

  return (
    <header className="w-full bg-gray-900 text-white">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-6">

        {/* ── Logo ─────────────────────────────────────────── */}
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
          onClick={() => {
            if (user?.role === "BRAND_OWNER") navigate("/dashboard");
            else navigate("/products");
          }}
        >
          <Store className="h-5 w-5" />
          BrandHub
        </button>

        {/* ── Right side — depends on auth state ───────────── */}

        {/* Loading skeleton — prevents flicker while getMe resolves */}
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 rounded-full bg-white/10 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-white/10 animate-pulse" />
          </div>
        ) : !user ? (
          /* ── GUEST ─────────────────────────────────────── */
          <nav className="flex items-center gap-2">
            <button
              type="button"
              className="text-sm text-white/80 hover:text-white px-3 py-1.5 rounded-md transition-colors"
              onClick={() => navigate("/products")}
            >
              Products
            </button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 rounded-full px-4"
              onClick={() => navigate("/sign-in")}
            >
              Login
            </Button>

            <Button
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-4 font-semibold"
              onClick={() => navigate("/customer/signup")}
            >
              Sign Up
            </Button>
          </nav>
        ) : user.role === "BRAND_OWNER" ? (
          /* ── BRAND OWNER ────────────────────────────────── */
          <div className="flex items-center gap-5">
            <nav className="flex items-center gap-4">
              {[
                { label: "Dashboard", path: "/dashboard" },
                { label: "Create Product", path: "/products/create" },
                { label: "My Products", path: "/my-products" },
                { label: "Brand", path: "/brand" },
              ].map(({ label, path }) => (
                <button
                  key={path}
                  type="button"
                  className="text-sm text-white/80 hover:text-white transition-colors"
                  onClick={() => navigate(path)}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 border-l border-white/20 pl-5">
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                onClick={() => navigate("/profile")}
              >
                {user.name || "Profile"}
              </button>
              <button
                type="button"
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                onClick={() => dispatch(logout(navigate))}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          /* ── CUSTOMER ───────────────────────────────────── */
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-sm text-white/80 hover:text-white transition-colors"
              onClick={() => navigate("/products")}
            >
              Products
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white rounded-md px-2 py-1.5 transition-colors"
              onClick={() => navigate("/my-orders")}
            >
              <PackageCheck className="h-4 w-4" />
              Orders
            </button>

            {/* Cart icon with badge */}
            <button
              type="button"
              className="relative rounded-md p-2 hover:bg-white/10 transition-colors"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />

            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                onClick={() => navigate("/profile")}
              >
                {user.name || "Profile"}
              </button>
              <button
                type="button"
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                onClick={() => dispatch(logout(navigate))}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
