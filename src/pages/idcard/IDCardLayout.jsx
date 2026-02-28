import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { LayoutDashboard, FileText, LogOut, CreditCard, Plus, User, ChevronLeft } from "lucide-react";

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

const ROLE_LABELS = { admin: "GMMC Admin", school: "School Admin", printer: "Printer", GMMC_ADMIN: "GMMC Admin", SCHOOL_ADMIN: "School Admin", PRINTER: "Printer" };

export default function IDCardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top bar */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <CreditCard size={14} className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">ID-PRO</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm text-gray-500">ID Cards</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden sm:block">{user?.full_name}</span>
                    <button
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={15} /> Sign out
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-52 bg-white border-r border-gray-200 p-3 space-y-1 flex-shrink-0">
                    {user?.role === "admin" && (
                        <button
                            onClick={() => navigate("/admin-portal")}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 px-3 py-2 mb-1 transition-colors"
                        >
                            <ChevronLeft size={13} /> All portals
                        </button>
                    )}
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-1">Menu</p>
                    <NavItem to="/idcard/dashboard" icon={LayoutDashboard} label="Dashboard" end />
                    <NavItem to="/idcard/requests" icon={FileText} label="Requests" />
                    {(user?.role === "school" || user?.role === "SCHOOL_ADMIN") && (
                        <NavItem to="/idcard/create-request" icon={Plus} label="New Request" />
                    )}
                    <div className="border-t border-gray-100 my-2 pt-2">
                        <div className="flex items-center gap-2.5 px-3 py-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <User size={13} className="text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{user?.full_name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{ROLE_LABELS[user?.role] || user?.role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
