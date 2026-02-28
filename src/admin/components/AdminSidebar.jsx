import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext"; 
import { 
  LayoutDashboard, 
  School, 
  ShoppingBag, 
  BarChart3, 
  CreditCard, 
  ChevronRight,
  LogOut,
  Megaphone,
  Globe,
  ArrowLeftRight
} from "lucide-react";

export default function AdminSidebar({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const idCardMenuItems = [
    { path: "/admin/id-card", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/id-card/schools", label: "Schools", icon: School },
    { path: "/admin/id-card/orders", label: "Orders", icon: ShoppingBag },
    { path: "/admin/id-card/reports", label: "Reports", icon: BarChart3 },
    { path: "/admin/id-card/payments", label: "Payments", icon: CreditCard },
  ];

  const marketingMenuItems = [
    { path: "/admin/marketing", label: "Marketing Home", icon: LayoutDashboard },
    { path: "/admin/marketing/leads", label: "Inquiries", icon: Megaphone },
    { path: "/admin/marketing/site-content", label: "Web Content", icon: Globe },
  ];

  const menuItems = mode === "marketing" ? marketingMenuItems : idCardMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-4 z-20 shadow-sm">
      <div className="flex items-center gap-3 px-3 py-6 mb-2">
        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-sm rotate-45"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">ID-Pro</h2>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">
            {mode === "marketing" ? "Marketing Portal" : "Admin Suite"}
          </p>
        </div>
      </div>

      <button 
        onClick={() => navigate("/admin")}
        className="mx-3 mb-6 flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-lg transition-colors"
      >
        <ArrowLeftRight size={14} />
        Switch Workspace
      </button>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} />
                <span className="font-semibold text-[15px]">{item.label}</span>
              </div>
              {active && <ChevronRight size={14} className="text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-100 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-semibold"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}