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
];