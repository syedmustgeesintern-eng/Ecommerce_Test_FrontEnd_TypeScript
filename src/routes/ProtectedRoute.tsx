import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAppSelector((state: any) => state.user);
  const location = useLocation();

  // ⏳ Wait for user
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  // ❌ Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
  if (user.role === "CUSTOMER") {
    return <Navigate to="/products" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

  return children;
}