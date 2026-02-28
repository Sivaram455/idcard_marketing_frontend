import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Calendar, Bell, MessageSquare,
  UserCircle, UserPlus, PieChart, LogOut,
  ShieldCheck, PhoneForwarded
} from "lucide-react";
import { logoutUser } from "../../auth/authService";
import { useAuth } from "../../auth/AuthContext";

export default function MarketingLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/marketing", icon: <Home size={20} /> },
    { name: "School Visits", path: "/marketing/visits", icon: <Calendar size={20} /> },
    { name: "Follow-ups", path: "/marketing/followups", icon: <PhoneForwarded size={20} /> },
    { name: "Messages", path: "/marketing/messages", icon: <MessageSquare size={20} /> },
    { name: "Profile", path: "/marketing/profile", icon: <UserCircle size={20} /> },

  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-[#00D1C1] p-2 rounded-xl text-white shadow-md">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-black text-slate-800 text-xl tracking-tighter uppercase">Marketing</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${isActive
                  ? "bg-black text-white shadow-xl shadow-slate-200"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
              >
                {link.icon}
                <span className="tracking-tight">{link.name}</span>
              </Link>
            );
          })}

          {/* Add a link back to Admin Portal if the user is an admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin-portal"
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm mt-4 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200"
            >
              <Home size={20} />
              <span className="tracking-tight">Admin Portal</span>
            </Link>
          )}

        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-5 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl font-bold text-sm transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-72">
        <header className="h-16 bg-[#00D1C1] flex items-center px-10 text-white font-bold shadow-md sticky top-0 z-10">
          <span className="tracking-wider uppercase text-sm">GMMC SchoolsVisited Portal</span>
        </header>

        <main className="p-10 min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}