import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderOpen, LogOut
} from "lucide-react";
import { FiGlobe as Globe } from "react-icons/fi";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Clients", icon: Users, path: "/client-info" },
  { label: "Dossiers", icon: FolderOpen, path: "/dossiers" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
          <Globe className="text-white" size={15} />
        </div>
        <span className="font-bold text-gray-900 text-base tracking-tight">Al Bouraq</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => { localStorage.clear(); navigate("/"); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <LogOut size={16} />
        Déconnexion
      </button>
    </aside>
  );
};

export default Sidebar;