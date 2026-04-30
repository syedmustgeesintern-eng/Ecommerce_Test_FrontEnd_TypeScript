// src/components/layout/Navbar.tsx
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.user);

  return (
    <header className="bg-gray-200 rounded h-[100px] border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-[100px] px-6 py-4 flex content-center  justify-between items-center">
        {/* LOGO */}
        <h1
          className="text-l  font-bold cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Ecommerce
        </h1>

        {/* NAV LINKS */}
        <div className="flex gap-6">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
          {user?.role === "BRAND_OWNER" && (
            <button
              onClick={() => navigate("/products/create")}
              className="hover:text-black transition"
            >
              Create Product
            </button>
          )}
          {user?.role === "CUSTOMER" && (
            <button
              onClick={() => navigate("/products/allProducts")}
              className="hover:text-black transition"
            >
              View All Products
            </button>
          )}
          {user?.role === "BRAND_OWNER" && (
  <button onClick={() => navigate("/my-products")}>
    My Products
  </button>
)}

          {/* Role-based */}
          {user?.role === "BRAND_OWNER" && (
            <button onClick={() => navigate("/brand")}>Brand</button>
          )}
        </div>

        {/* USER INFO */}
        <div className="flex items-center gap-4">
          <span className="font-medium">{user?.name || "User"}</span>

          <button
            onClick={() => dispatch(logout(navigate))}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
