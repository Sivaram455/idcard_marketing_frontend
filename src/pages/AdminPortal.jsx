import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { CreditCard, Megaphone, ShieldCheck, LogOut, Layers, Ticket, ArrowRight } from "lucide-react";

export default function AdminPortal() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const portals = [
        {
            key: "idcard",
            route: "/idcard/dashboard",
            icon: CreditCard,
            color: "text-indigo-600",
            bg: "bg-indigo-50/50",
            border: "border-indigo-100/50",
            title: "ID Cards",
            desc: "Requests & Production",
        },
        {
            key: "marketing",
            route: "/marketing",
            icon: Megaphone,
            color: "text-rose-600",
            bg: "bg-rose-50/50",
            border: "border-rose-100/50",
            title: "Marketing",
            desc: "Leads & Campaigns",
        },
        {
            key: "ticketing",
            route: "/ticketing",
            icon: Ticket,
            color: "text-amber-600",
            bg: "bg-amber-50/50",
            border: "border-amber-100/50",
            title: "Support",
            desc: "Technical Desk",
        },
        {
            key: "admin",
            route: "/admin/overview",
            icon: ShieldCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50/50",
            border: "border-emerald-100/50",
            title: "Systems",
            desc: "Global Controls",
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
            {/* ── Header ── */}
            <header className="h-14 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 flex items-center">
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                            <Layers size={16} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xs font-black text-slate-900 tracking-tight uppercase italic">GMMC-Admin</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control Center</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 py-0.5 px-0.5 pr-2.5 rounded-full bg-slate-100/50 border border-slate-200/50">
                            <div className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black text-[9px] shadow-sm border border-slate-200 uppercase">
                                {user?.full_name?.charAt(0) || "A"}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{user?.full_name?.split(' ')[0] || "Admin"}</span>
                        </div>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Sign out"
                        >
                            <LogOut size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 -mt-6">
                <div className="w-full max-w-6xl">
                    <div className="text-center mb-10 space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                            Centralized <span className="text-indigo-600">Workspace</span>
                        </h1>
                        <p className="text-slate-400 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em]">
                            Authorized Access Only &bull; Select Destination
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {portals.map(({ key, route, icon: Icon, color, bg, border, title, desc }) => (
                            <button
                                key={key}
                                onClick={() => navigate(route)}
                                className={`group relative bg-white border border-slate-100 rounded-[28px] p-5 text-left 
                                          hover:border-indigo-200 hover:shadow-[0_15px_40px_rgba(79,70,229,0.06)] 
                                          hover:-translate-y-0.5 transition-all duration-300 ease-out flex flex-col items-center text-center`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${bg} ${border} border flex items-center justify-center mb-4 
                                              group-hover:scale-110 group-hover:bg-white transition-all duration-500 shadow-sm`}>
                                    <Icon size={20} className={color} strokeWidth={2.5} />
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">
                                        {title}
                                    </h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {desc}
                                    </p>
                                </div>
                                
                                <div className="mt-5 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-indigo-100 group-hover:text-indigo-500 transition-all duration-300">
                                    <ArrowRight size={14} strokeWidth={3} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="py-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/60 shadow-sm shadow-slate-100/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] font-outfit">
                        &copy; {new Date().getFullYear()} GMMC System Network &bull; Secured Terminal
                    </span>
                </div>
            </footer>
        </div>
    );
}


