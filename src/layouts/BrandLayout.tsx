import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function BrandLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <div className="flex-1">
        <main className="mx-auto w-full max-w-7xl p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}