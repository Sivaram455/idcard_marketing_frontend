import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Truck, 
  LogOut,
  ChevronRight,
  CreditCard,
  Ticket,
  X
} from "lucide-react";

export default function Sidebar({ onClose }) {
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
    <aside className="w-72 md:w-64 bg-white border-r border-slate-200 h-screen flex flex-col p-4 shadow-sm">
      <div className="flex items-center justify-between px-3 py-6 lg:py-8 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">ID <span className="text-indigo-600">MARKET</span></h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">Intelligence Hub</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                active
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon 
                  size={18} 
                  strokeWidth={active ? 2.5 : 2}
                  className={`transition-colors ${active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-600"}`} 
                />
                <span className="font-bold text-[13px] uppercase tracking-wider">{item.label}</span>
              </div>
              {active && <ChevronRight size={14} className="text-white/40 animate-in slide-in-from-left-1" strokeWidth={3} />}
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