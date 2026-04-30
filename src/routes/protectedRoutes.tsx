import AllProducts from "@/pages/AllProducts";
import CreateProduct from "@/pages/CreateProduct";
import MyProducts from "@/pages/MyProducts";
import { lazy } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));

export const protectedRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    roles: ["BRAND_OWNER", "CUSTOMER"],
  },
  {
    path: "/profile",
    element: <Profile />,
    roles: ["BRAND_OWNER", "CUSTOMER"],
  },
    {
    path: "/products/create",
    element: <CreateProduct />,
    roles: ["BRAND_OWNER"], // 🔥 IMPORTANT
  },
   {
    path: "/products/allProducts",
    element: <AllProducts />,
    roles: ["CUSTOMER"], // 🔥 IMPORTANT
  },
  {
    path: "/my-products",
    element: <MyProducts />,
    roles: ["BRAND_OWNER"], 
  },
];
