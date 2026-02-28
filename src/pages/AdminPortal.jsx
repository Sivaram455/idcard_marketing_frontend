import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { CreditCard, Megaphone, ShieldCheck, LogOut, ChevronRight, Layers } from "lucide-react";

export default function AdminPortal() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const portals = [
        {
            key: "idcard",
            route: "/idcard/dashboard",
            icon: CreditCard,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            gradient: "from-indigo-500 to-indigo-600",
            hoverRing: "hover:ring-indigo-100",
            title: "ID Cards Portal",
            desc: "Manage school ID card requests, approvals, samples and bulk printing pipelines.",
        },
        {
            key: "marketing",
            route: "/marketing",
            icon: Megaphone,
            color: "text-rose-600",
            bg: "bg-rose-50",
            gradient: "from-rose-500 to-rose-600",
            hoverRing: "hover:ring-rose-100",
            title: "Marketing Portal",
            desc: "Track daily school visits, follow-up timelines, and overall campaign activity.",
        },
        {
            key: "admin",
            route: "/admin/overview",
            icon: ShieldCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            gradient: "from-emerald-500 to-emerald-600",
            hoverRing: "hover:ring-emerald-100",
            title: "Admin Settings",
            desc: "System management: Configure tenants, create users, and assign access roles.",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* ── Header ── */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center shadow-inner">
                            <Layers size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-900 tracking-tight">GMMC PORTAL</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {user?.full_name?.charAt(0) || "A"}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900 leading-tight">{user?.full_name || "Admin"}</p>
                                <p className="text-xs text-gray-500">{user?.role === "GMMC_ADMIN" || user?.role === "admin" ? "Super Admin" : user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">

                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Welcome back, {user?.full_name?.split(" ")[0] || "Admin"}
                    </h1>
                    <p className="text-base text-gray-500 max-w-lg mx-auto">
                        Select a portal below to manage your operations. Each workspace is specifically tailored for your workflow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 sm:px-0">
                    {portals.map(({ key, route, icon: Icon, color, bg, gradient, hoverRing, title, desc }) => (
                        <button
                            key={key}
                            onClick={() => navigate(route)}
                            className={`group relative bg-white border border-gray-200 rounded-3xl p-6 text-left 
                                      hover:border-transparent hover:shadow-xl hover:shadow-gray-200/50 
                                      hover:ring-4 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col items-start ${hoverRing}`}
                        >
                            {/* Decorative background circle on hover */}
                            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />

                            {/* Icon block */}
                            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-6 
                                          group-hover:scale-110 transition-transform duration-300 ease-out shadow-sm`}>
                                <Icon size={24} className={color} />
                            </div>

                            {/* Text block */}
                            <div className="flex-1 relative z-10 w-full">
                                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-900 transition-colors">{title}</h2>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">{desc}</p>
                            </div>

                            {/* Arrow footer */}
                            <div className="flex items-center text-sm font-semibold tracking-wide gap-1.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>Go to portal</span>
                                <ChevronRight size={16} className={color} />
                            </div>
                        </button>
                    ))}
                </div>

            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-xs text-gray-400">
                <p>&copy; {new Date().getFullYear()} GMMC. All rights reserved.</p>
            </footer>
        </div>
    );
}
