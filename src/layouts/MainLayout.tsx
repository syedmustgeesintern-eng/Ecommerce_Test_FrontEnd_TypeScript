// src/layouts/AppLayout.tsx

import { useAppSelector } from "@/store/hooks";
import { Outlet } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { user } = useAppSelector((state: any) => state.user);

  if (!user) return null;

  const isBrand = user.role === "BRAND_OWNER";

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ✅ BRAND → SIDEBAR */}
      {isBrand && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {/* ✅ CUSTOMER → NAVBAR */}
        {!isBrand && <Navbar />}

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}