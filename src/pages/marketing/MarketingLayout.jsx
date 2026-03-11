import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { 
    LayoutDashboard, Users, UserPlus, 
    FileText, Calendar, LogOut, 
    Shield, User, ChevronLeft 
} from "lucide-react";

const NavItem = ({ to, icon: Icon, label, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`
        }
    >
        <Icon size={16} />
        {label}
    </NavLink>
);

export default function MarketingLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-base tracking-tight">MARKET-PRO</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm text-gray-500 font-medium">Marketing Portal</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-semibold text-gray-900">{user?.full_name}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">{user?.role}</span>
                    </div>
                    <button
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-56 bg-white border-r border-gray-200 p-4 space-y-1 flex-shrink-0 sticky top-[57px] h-[calc(100vh-57px)]">
                    {user?.role === "admin" && (
                        <button
                            onClick={() => navigate("/admin-portal")}
                            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 px-3 py-2 mb-2 transition-colors uppercase tracking-wider"
                        >
                            <ChevronLeft size={14} /> Back to Portals
                        </button>
                    )}
                    
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-3 pt-4 pb-2">Main Menu</p>
                    <NavItem to="/marketing" icon={LayoutDashboard} label="Dashboard" end />
                    <NavItem to="/marketing/leads" icon={Users} label="School Leads" />
                    <NavItem to="/marketing/add" icon={UserPlus} label="Add School" />
                    {(user?.role === 'admin' || user?.role === 'GMMC_ADMIN') && (
                        <NavItem to="/marketing/assign" icon={UserPlus} label="Assign Leads" />
                    )}
                    
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-3 pt-6 pb-2">Activities</p>
                    <NavItem to="/marketing/visits" icon={FileText} label="Log Visit" />
                    <NavItem to="/marketing/followups" icon={Calendar} label="Follow-ups" />

                    <div className="border-t border-gray-100 mt-auto pt-4 absolute bottom-6 left-4 right-4">
                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                                <User size={14} className="text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{user?.full_name}</p>
                                <p className="text-[10px] text-gray-400 truncate capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}