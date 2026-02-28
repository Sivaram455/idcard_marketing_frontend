import React from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Settings,
  LogOut,
  HelpCircle
} from "lucide-react";

export default function Header() {
  const location = useLocation();
  const schoolName = "Arunodaya School";

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/track") return "Track Shipment";
    if (path === "/payment") return "Make Payment";
    if (path === "/orders") return "Order History";
    return "Portal";
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
            Academic Portal
          </p>
          <h2 className="text-xl font-bold text-slate-900">{getPageTitle()}</h2>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 max-w-md mx-12">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search orders, students, or help..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors group">
          <Bell size={20} className="group-hover:shake" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        <button className="hidden sm:block p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
          <HelpCircle size={20} />
        </button>

        <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block"></div>

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none">{schoolName}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
            <User size={20} strokeWidth={2.5} />
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}