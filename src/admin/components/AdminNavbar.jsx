import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Search, UserCircle } from "lucide-react";

export default function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search for schools or orders..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="text-slate-400 hover:text-indigo-600 relative">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700 leading-none">Admin Name</p>
            <p className="text-xs text-slate-400 mt-1">Super Admin</p>
          </div>
          <button 
            onClick={() => { logout(); navigate("/"); }}
            className="p-2 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}