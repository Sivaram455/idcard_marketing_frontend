import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetAdminStats, apiGetRequests } from "../../utils/api";
import { Building2, Users, FileText, Loader2, ArrowRight, TrendingUp, ShieldCheck, Activity } from "lucide-react";

const ROLE_LABELS = { GMMC_ADMIN: "GMMC Admin", SCHOOL_ADMIN: "School Admin", PRINTER: "Printer" };

const STATUS_COLORS = {
    SUBMITTED: "bg-slate-100 text-slate-600 border-slate-200",
    GMMC_APPROVED: "bg-indigo-50 text-indigo-700 border-indigo-100",
    GMMC_REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
    PRINTER_APPROVED: "bg-violet-50 text-violet-700 border-violet-100",
    SAMPLE_UPLOADED: "bg-amber-50 text-amber-700 border-amber-100",
    SCHOOL_VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    BULK_PRINT_APPROVED: "bg-green-50 text-green-700 border-green-100",
};

export default function AdminOverview() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [reqs, setReqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([apiGetAdminStats(), apiGetRequests()])
            .then(([s, r]) => {
                setStats(s.data);
                setReqs((r.data || []).slice(0, 10)); // Show more requests
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statConfig = [
        { icon: Building2, label: "Total Tenants", value: stats?.tenants, color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: Users, label: "Active Users", value: stats?.users, color: "text-violet-600", bg: "bg-violet-50" },
        { icon: FileText, label: "All Requests", value: stats?.requests, color: "text-blue-600", bg: "bg-blue-50" },
        { icon: Activity, label: "System Health", value: "99.9%", color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50/30 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm">System-wide overview and management.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => window.location.reload()}
                        className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm transition-all"
                    >
                        <Activity size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statConfig.map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`${bg} ${color} p-3 rounded-xl`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                                {loading ? (
                                    <div className="h-6 w-16 bg-slate-100 rounded animate-pulse mt-1" />
                                ) : (
                                    <p className="text-xl font-bold text-slate-900">{value ?? "—"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content - Recent Requests */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-500" />
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Recent ID Card Requests</h2>
                            </div>
                            <button 
                                onClick={() => navigate("/idcard/requests")} 
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                View full history <ArrowRight size={14} />
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-3">
                                <Loader2 size={28} className="animate-spin text-indigo-500" />
                                <p className="text-sm text-slate-400">Loading requests...</p>
                            </div>
                        ) : reqs.length === 0 ? (
                            <div className="p-16 text-center">
                                <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-slate-400 text-sm font-medium">No recent requests found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            {["ID", "Tenant/School", "Students", "Status", "Created"].map(h => (
                                                <th key={h} className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reqs.map((r) => (
                                            <tr
                                                key={r.id}
                                                onClick={() => navigate(`/idcard/requests/${r.id}`)}
                                                className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                                            >
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-indigo-600 group-hover:underline">
                                                        #{r.request_no}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-700">{r.tenant_name || "Unknown Tenant"}</span>
                                                        <span className="text-[10px] text-slate-400 italic">Institutional Client</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-slate-400" />
                                                        <span className="text-sm text-slate-600 font-medium">{r.total_students ?? 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[r.status] || "bg-slate-100 text-slate-600"}`}>
                                                        {r.status?.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-400 text-xs">
                                                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Role Breakdown & System info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* User Distribution */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={18} className="text-violet-500" />
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">User Distribution</h2>
                        </div>
                        
                        <div className="space-y-3">
                            {stats?.roleBreakdown?.map((r) => (
                                <div key={r.role} className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{ROLE_LABELS[r.role] || r.role}</span>
                                        <span className="text-[10px] text-slate-400">System Access Level</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-slate-900">{r.count}</span>
                                        <div className="h-4 w-1 bg-slate-200 rounded-full group-hover:bg-indigo-300 transform transition-transform" />
                                    </div>
                                </div>
                            )) || (
                                <p className="text-xs text-slate-400 text-center py-4 italic">No role data available</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Info Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity size={18} />
                            <h2 className="text-sm font-bold uppercase tracking-wider">Quick Note</h2>
                        </div>
                        <p className="text-indigo-100 text-xs leading-relaxed mb-4">
                            Total requests have grown by 12% this month. Ensure all pending GMMC approvals are cleared by EOD.
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition-all">
                            Review Performance
                        </button>
                    </div>

                    {/* Pending Action Items Placeholder */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Action Pipeline</h2>
                        <div className="space-y-4">
                            {[
                                { title: "Approve New Tenant", desc: "Singhabahini School", time: "2h ago" },
                                { title: "Audit User Logs", desc: "Routine security check", time: "5h ago" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{item.title}</p>
                                        <p className="text-[10px] text-slate-400">{item.desc} • {item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

