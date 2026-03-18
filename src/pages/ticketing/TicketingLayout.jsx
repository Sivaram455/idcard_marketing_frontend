import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { 
    LayoutDashboard, Ticket, PlusCircle, 
    Settings, LogOut, ShieldCheck, User, ChevronLeft,
    Clock, CheckCircle, AlertCircle
} from "lucide-react";

const NavItem = ({ to, icon: Icon, label, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-amber-50 text-amber-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`
        }
    >
        <Icon size={16} />
        {label}
    </NavLink>
);

export default function TicketingLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-base tracking-tight italic">SUPPORT-SYNC</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm text-gray-500 font-medium">Ticketing Portal</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-semibold text-gray-900">{user?.full_name}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{user?.role}</span>
                    </div>
                    <button
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-100 hover:border-red-100"
                    >
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 p-4 space-y-1 flex-shrink-0 flex flex-col h-[calc(100vh-57px)]">
                    {(user?.role === "admin" || user?.role === "GMMC_ADMIN") && (
                        <button
                            onClick={() => navigate("/admin-portal")}
                            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 px-3 py-2 mb-4 transition-colors uppercase tracking-widest group"
                        >
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                            Back to Portals
                        </button>
                    )}
                    
                    <div className="px-3 pb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Main Navigation</p>
                    </div>
                    
                    <NavItem to="/ticketing" icon={LayoutDashboard} label="Support Overview" end />
                    <NavItem to="/ticketing/list" icon={Ticket} label="All Tickets" />
                    <NavItem to="/ticketing/new" icon={PlusCircle} label="Create Ticket" />
                    
                    <div className="px-3 pt-6 pb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Quick Filters</p>
                    </div>
                    <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg w-full text-left">
                        <Clock size={16} className="text-blue-500" /> Open Tickets
                    </button>
                    <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg w-full text-left">
                        <CheckCircle size={16} className="text-emerald-500" /> Resolved
                    </button>
                    <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg w-full text-left">
                        <AlertCircle size={16} className="text-rose-500" /> High Priority
                    </button>

                    <div className="mt-auto pt-4">
                        <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl text-white shadow-lg shadow-amber-200/50 mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Support Access</p>
                            <p className="text-sm font-bold mt-1 leading-tight">Need technical help?</p>
                            <p className="text-[10px] mt-2 opacity-80 leading-relaxed font-medium">Contact development team for direct DB access requests.</p>
                        </div>

                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-200">
                                <User size={14} className="text-amber-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{user?.full_name}</p>
                                <p className="text-[10px] text-gray-400 truncate capitalize font-semibold">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
