import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
}