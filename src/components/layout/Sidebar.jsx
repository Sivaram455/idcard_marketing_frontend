import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Truck, 
  LogOut,
  ChevronRight,
  CreditCard,
  Ticket
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/create-order", label: "Create Order", icon: PlusCircle },
    { path: "/orders", label: "Order History", icon: History },
    { path: "/payments", label: "Make Payment", icon: CreditCard },
    { path: "/track", label: "Track Order", icon: Truck },
    { path: "/ticketing", label: "Support", icon: Ticket },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-4 shadow-sm z-20">
      <div className="flex items-center gap-3 px-3 py-8 mb-6">
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-full"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">SchoolHub</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Student ID Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon 
                  size={20} 
                  className={`transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} 
                />
                <span className="font-semibold text-[15px]">{item.label}</span>
              </div>
              {active && <ChevronRight size={14} className="text-blue-400 animate-in slide-in-from-left-1" />}
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
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}