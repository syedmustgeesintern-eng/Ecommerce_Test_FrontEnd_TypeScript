import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { publicRoutes } from "./publicRoutes";
import { protectedRoutes } from "./protectedRoutes";
import ProtectedRoute from "./ProtectedRoute";
import { useAppSelector } from "@/store/hooks";
import BrandLayout from "@/layouts/BrandLayout";
import CustomerLayout from "@/layouts/CustomerLayout";

// ✅ IMPORT LAYOUTS

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

// ✅ ROLE BASED LAYOUT SWITCH
function RoleBasedLayout() {
  const { user } = useAppSelector((state) => state.user);

  if (!user) return null;

  // 🔥 BRAND OWNER → normal flow
  if (user.role === "BRAND_OWNER") {
    return <BrandLayout />;
  }

  return <CustomerLayout />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>

          {/* PUBLIC ROUTES */}
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          {/* PROTECTED ROUTES */}
          <Route
            element={
              <ProtectedRoute>
                <RoleBasedLayout />
              </ProtectedRoute>
            }
          >
            {protectedRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute allowedRoles={route.roles}>
                    {route.element}
                  </ProtectedRoute>
                }
              />
            ))}
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
