import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { LayoutDashboard, Building2, Users, LogOut, CreditCard, ArrowLeft } from "lucide-react";

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
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

export default function AdminManageLayout() {
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
                    <span className="text-sm text-gray-500">Admin Panel</span>
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
                    <button
                        onClick={() => navigate("/admin-portal")}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 px-3 py-2 mb-2 transition-colors"
                    >
                        <ArrowLeft size={13} /> Back to portals
                    </button>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-1">Overview</p>
                    <NavItem to="/admin/overview" icon={LayoutDashboard} label="Dashboard" />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-3 pb-1">Management</p>
                    <NavItem to="/admin/tenants" icon={Building2} label="Tenants" />
                    <NavItem to="/admin/users" icon={Users} label="Users & Roles" />
                </aside>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
