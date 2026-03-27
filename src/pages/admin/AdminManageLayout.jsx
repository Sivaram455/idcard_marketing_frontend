import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
    LayoutDashboard, Building2, Users, LogOut,
    CreditCard, ArrowLeft, Ticket, Settings,
    Shield, ChevronRight, Bell
} from "lucide-react";

const NavItem = ({ to, icon: Icon, label, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`
        }
    >
        {({ isActive }) => (
            <>
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                {label}
            </>
        )}
    </NavLink>
);

export default function AdminManageLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

            {/* ── Sidebar (Slim 192px) ── */}
            <aside className="w-[192px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-sm">

                {/* Branding Area */}
                <div className="h-[48px] flex items-center px-4 border-b border-slate-100 bg-white/50 backdrop-blur-md">
                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/admin-portal')}>
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                            <Shield size={14} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[11px] font-black text-slate-900 tracking-tighter uppercase italic">GMMC-Admin</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control Panel</span>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    <button
                        onClick={() => navigate("/admin-portal")}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 px-3 py-1 mb-2 transition-all uppercase tracking-widest group"
                    >
                        <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> Exit to Nexus
                    </button>

                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-2 italic">Standard OPS</p>
                        <NavItem to="/admin/overview" icon={LayoutDashboard} label="System Metrics" end />
                        <NavItem to="/admin/tenants" icon={Building2} label="Tenants" />
                        <NavItem to="/admin/users" icon={Users} label="Users & Roles" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-2 italic">Utility</p>
                        <NavItem to="/ticketing" icon={Ticket} label="Support Desk" />
                        <NavItem to="/settings" icon={Settings} label="Global Config" />
                    </div>
                </div>

                {/* Pinned User Profile */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                                    {user?.full_name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black text-slate-900 truncate uppercase leading-none italic">{user?.full_name?.split(' ')[0]}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest truncate">{user?.role || 'Operator'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="w-full mt-2.5 py-1.5 rounded-lg text-[9px] font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-[0.2em] border border-transparent hover:border-rose-100"
                        >
                            Termination
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Canvas ── */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Minimal Header (48px) */}
                <header className="h-[48px] bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Admin Network</span>
                        <span className="text-slate-200">/</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Status: Operational</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={14} />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
