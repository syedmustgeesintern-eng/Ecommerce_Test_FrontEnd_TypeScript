import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "My Products", path: "/my-products" },
    // { name: "Create Product", path: "/products/create" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col justify-between bg-gray-900 p-4 text-white">
      {/* TOP */}
      <div>
        <h2
          className="text-xl font-bold mb-8 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Brand Panel
        </h2>

        <nav className="space-y-2">
          {menu.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`block w-full text-left px-4 py-2 rounded-lg transition 
                ${
                  location.pathname === item.path
                    ? "bg-white text-black"
                    : "hover:bg-gray-700"
                }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* BOTTOM */}
      <button
        onClick={() => dispatch(logout(navigate))}
        className="text-red-400 hover:text-red-600 text-left px-4 py-2"
      >
        Logout
      </button>
    </aside>
  );
}