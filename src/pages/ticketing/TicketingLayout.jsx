import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
    LayoutDashboard, Ticket, PlusCircle,
    Settings, LogOut, ShieldCheck, User, ChevronLeft,
    Clock, CheckCircle, AlertCircle, MessageSquare,
    Zap, Headphones
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
        {(navProps) => (
            <>
                <Icon size={14} strokeWidth={navProps.isActive ? 2.5 : 2} />
                {label}
            </>
        )}
    </NavLink>
);

const poppins = { fontFamily: "'Poppins', sans-serif" };

export default function TicketingLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={poppins} className="min-h-screen bg-slate-50/50 flex flex-col">

            {/* ── Top Navigation (Fixed 48px) ── */}
            <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                        <Headphones size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-black text-slate-900 text-xs tracking-tight uppercase italic">Support-Sync</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ticketing Terminal</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-6 w-px bg-slate-100 mx-1" />
                    <button
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50"
                    >
                        <LogOut size={14} /> Exit
                    </button>
                </div>
            </header>

            <div className="flex flex-1">

                {/* ── Premium Sidebar (192px) ── */}
                <aside className="w-48 bg-white border-r border-slate-200 flex flex-col sticky top-12 h-[calc(100vh-48px)] z-30 shrink-0">

                    <div className="p-4 space-y-6 flex-1 overflow-y-auto scrollbar-none">

                        {/* Context Switcher */}
                        {(['admin', 'GMMC_ADMIN'].includes(user?.role)) && (
                            <button
                                onClick={() => navigate("/admin-portal")}
                                className="w-full flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 px-2 py-1.5 transition-all uppercase tracking-widest group bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 rounded-lg"
                            >
                                <ChevronLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                                Portals
                            </button>
                        )}

                        {/* Navigation Section */}
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 px-2">Workspace</p>
                            <NavItem to="/ticketing" icon={LayoutDashboard} label="Overview" end />
                            <NavItem to="/ticketing/list" icon={Ticket} label="Tickets" />
                            <NavItem to="/ticketing/new" icon={PlusCircle} label="Create Case" />
                        </div>

                    </div>

                    {/* ── User Profile Pinned (Bottom) ── */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50/40">
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-sm transition-all">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                                <User size={14} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-slate-900 truncate leading-none uppercase italic">
                                    {user?.full_name?.split(' ')[0] || 'User'}
                                </p>
                                <p className="text-[9px] text-slate-400 truncate uppercase mt-1 font-bold tracking-widest">
                                    {user?.role === 'GMMC_ADMIN' ? 'Root' : user?.role || 'Staff'}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Main Canvas (p-5 for 20px padding) ── */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50">
                    <div className="max-w-[1600px] p-5 mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
