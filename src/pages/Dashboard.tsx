// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Button onClick={() => navigate("/profile")}>Go to Profile</Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Welcome 👋</h2>
        <p className="text-gray-600">You are successfully logged in.</p>
      </div>
    </div>
  );
}
