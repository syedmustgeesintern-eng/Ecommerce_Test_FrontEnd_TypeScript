import Checkout from "@/pages/Checkout";
import CreateProduct from "@/pages/CreateProduct";
import MyProducts from "@/pages/MyProducts";
import MyOrders from "@/pages/MyOrders";
import OrderDetails from "@/pages/OrderDetails";
import { lazy } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));

export const protectedRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    roles: ["BRAND_OWNER"],
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
    path: "/products/:productId",
    element: <CreateProduct />,
    roles: ["BRAND_OWNER"],
  },
  {
    path: "/products/edit/:productId",
    element: <CreateProduct />,
    roles: ["BRAND_OWNER"],
  },
  {
  path: "/checkout",
  element: <Checkout />,
  roles: ["CUSTOMER"],
},
{
  path: "/my-orders",
  element: <MyOrders />,
  roles: ["CUSTOMER"],
},
{
  path: "/orders/:orderId",
  element: <OrderDetails />,
  roles: ["CUSTOMER"],
},

  {
    path: "/my-products",
    element: <MyProducts />,
    roles: ["BRAND_OWNER"], 
  },
];
