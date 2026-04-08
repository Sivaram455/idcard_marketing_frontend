import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
    LayoutDashboard, Users, UserPlus,
    FileText, Calendar, LogOut,
    Megaphone, ChevronLeft, User, ShoppingCart, BarChart3
} from "lucide-react";

const ROLE_LABELS = {
    admin: "GMMC Admin", GMMC_ADMIN: "GMMC Admin",
    marketing: "Marketing", MARKETING: "Marketing",
};

const NavItem = ({ to, icon: Icon, label, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`
        }
    >
        {({ isActive }) => (
            <>
                <Icon size={15} className={isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"} />
                {label}
            </>
        )}
    </NavLink>
);

export default function MarketingLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const initials = user?.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "U";
    const roleLabel = ROLE_LABELS[user?.role] || user?.role;
    const isAdmin = ["admin", "GMMC_ADMIN"].includes(user?.role);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* ── Top Header ── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-12 flex items-center px-5 justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/marketing")}>
                        <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-rose-700 rounded-lg flex items-center justify-center shadow-sm shadow-rose-300">
                            <Megaphone size={13} className="text-white" />
                        </div>
                        <span className="font-extrabold text-gray-900 text-sm tracking-tight">MARKET-PRO</span>
                    </div>
                    <span className="text-gray-200 text-sm select-none">/</span>
                    <span className="text-sm text-gray-500 font-medium">Marketing Portal</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-[10px] font-black select-none">
                            {initials}
                        </div>
                        <div className="text-right leading-tight">
                            <p className="text-xs font-semibold text-gray-800">{user?.full_name}</p>
                            <p className="text-[10px] text-gray-400">{roleLabel}</p>
                        </div>
                    </div>
                    <div className="w-px h-5 bg-gray-200" />
                    <button
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all font-medium"
                    >
                        <LogOut size={13} /> Sign out
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Sidebar ── */}
                <aside className="w-48 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto">
                    <div className="flex-1 p-3 space-y-0.5">
                        {isAdmin && (
                            <button
                                onClick={() => navigate("/admin-portal")}
                                className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-indigo-600 px-3 py-2 mb-2 transition-colors font-bold uppercase tracking-widest w-full"
                            >
                                <ChevronLeft size={11} /> All Portals
                            </button>
                        )}

                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-3 pb-1.5 pt-1">Main Menu</p>
                        <NavItem to="/marketing" icon={LayoutDashboard} label="Dashboard" end />
                        <NavItem to="/marketing/leads" icon={Users} label="School Leads" />
                        <NavItem to="/marketing/add" icon={UserPlus} label="Add School" />
                        {isAdmin && (
                            <NavItem to="/marketing/assign" icon={UserPlus} label="Assign Leads" />
                        )}

                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-3 pb-1.5 pt-3">Activities</p>
                        <NavItem to="/marketing/visits" icon={FileText} label="Log Visit" />
                        <NavItem to="/marketing/followups" icon={Calendar} label="Follow-ups" />

                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-3 pb-1.5 pt-3">Sales</p>
                        <NavItem to="/marketing/orders" icon={ShoppingCart} label="Order Booking" />
                        <NavItem to="/marketing/agent-analytics/me" icon={BarChart3} label="Performance" />
                    </div>

                    {/* User card at bottom */}
                    <div className="p-3 border-t border-gray-100">
                        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-gray-50">
                            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-[10px] font-black shrink-0 select-none">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">{user?.full_name}</p>
                                <p className="text-[9px] text-gray-400 truncate">{roleLabel}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Page Content ── */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}