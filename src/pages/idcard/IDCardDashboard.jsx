import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequests } from "../../utils/api";
import {
    FileText, CheckCircle, Plus, ChevronRight,
    Loader2, AlertCircle, TrendingUp, Users,
    Activity, Zap, BarChart2
} from "lucide-react";
import CreateRequestModal from "./CreateRequestModal";

const STATUS_META = {
    SUBMITTED:           { label: "Submitted",        color: "bg-slate-100 text-slate-600 border-slate-200",       dot: "bg-slate-400"    },
    GMMC_APPROVED:       { label: "GMMC Approved",    color: "bg-indigo-50 text-indigo-700 border-indigo-200",      dot: "bg-indigo-500"   },
    GMMC_REJECTED:       { label: "GMMC Rejected",    color: "bg-red-50 text-red-600 border-red-200",               dot: "bg-red-400"      },
    PRINTER_APPROVED:    { label: "At Printer",        color: "bg-violet-50 text-violet-700 border-violet-200",     dot: "bg-violet-500"   },
    PRINTER_REJECTED:    { label: "Printer Rejected",  color: "bg-red-50 text-red-600 border-red-200",              dot: "bg-red-400"      },
    SAMPLE_UPLOADED:     { label: "Sample Ready",     color: "bg-amber-50 text-amber-700 border-amber-200",         dot: "bg-amber-500"    },
    SCHOOL_VERIFIED:     { label: "School Verified",  color: "bg-teal-50 text-teal-700 border-teal-200",            dot: "bg-teal-500"     },
    GMMC_VERIFIED:       { label: "GMMC Verified",    color: "bg-cyan-50 text-cyan-700 border-cyan-200",            dot: "bg-cyan-500"     },
    BULK_PRINT_APPROVED: { label: "Dispatched ✓",     color: "bg-emerald-50 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500"  },
};

const StatCard = ({ title, value, sub, icon: Icon, colorClass, loading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
        <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon size={14} />
            </div>
        </div>
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
            {loading ? <span className="text-gray-300">—</span> : value}
        </p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-1 truncate">{sub}</p>}
    </div>
);

export default function IDCardDashboard() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const [requests, setRequests]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);
    const [isCreateModalOpen, setIsCreate]  = useState(false);

    const loadData = () => {
        setLoading(true);
        apiGetRequests()
            .then(r  => setRequests(r.data || []))
            .catch(() => setError("Failed to load dashboard data."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const isSchool = useMemo(() => ["school", "SCHOOL_ADMIN"].includes(user?.role), [user?.role]);
    const isAdmin  = useMemo(() => ["admin",  "GMMC_ADMIN"].includes(user?.role),   [user?.role]);

    const stats = useMemo(() => {
        const total         = requests.length;
        const completed     = requests.filter(r => r.status === "BULK_PRINT_APPROVED").length;
        const rejected      = requests.filter(r => r.status?.includes("REJECTED")).length;
        const inProgress    = total - completed - rejected;
        const totalStudents = requests.reduce((s, r) => s + (Number(r.total_students) || 0), 0);
        const printedStudents = requests
            .filter(r => r.status === "BULK_PRINT_APPROVED")
            .reduce((s, r) => s + (Number(r.total_students) || 0), 0);

        let actionableCount = 0;
        if (isAdmin)              actionableCount = requests.filter(r => ["SUBMITTED","SCHOOL_VERIFIED"].includes(r.status)).length;
        else if (user?.role === "printer") actionableCount = requests.filter(r => ["GMMC_APPROVED","PRINTER_APPROVED"].includes(r.status)).length;
        else if (isSchool)        actionableCount = requests.filter(r => r.status === "SAMPLE_UPLOADED").length;

        return { total, completed, rejected, inProgress, totalStudents, printedStudents, actionableCount };
    }, [requests, isAdmin, isSchool, user?.role]);

    const pipeline = useMemo(() => [
        { label: "New / Review",          count: requests.filter(r => ["SUBMITTED","GMMC_APPROVED"].includes(r.status)).length,                                         color: "bg-indigo-500" },
        { label: "Sample & Verify",       count: requests.filter(r => ["PRINTER_APPROVED","SAMPLE_UPLOADED","SCHOOL_VERIFIED","GMMC_VERIFIED"].includes(r.status)).length, color: "bg-amber-500" },
        { label: "Approved for Print",    count: stats.completed,                                                                                                        color: "bg-emerald-500" },
        { label: "Rejected",              count: stats.rejected,                                                                                                         color: "bg-red-400"    },
    ].filter(i => i.count > 0), [requests, stats]);

    const fmtDate = (d) => {
        if (!d) return "—";
        const dt = new Date(d);
        return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    };

    const firstName = user?.full_name?.split(" ")[0] || "there";

    return (
        <div className="p-5 space-y-5">

            {/* ── Hero Strip ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_60%)] pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">
                        {isSchool ? (user?.tenant_name || "School Portal") : isAdmin ? "Admin Portal" : "Operations"}
                    </p>
                    <h1 className="text-xl font-extrabold tracking-tight leading-tight">
                        Welcome back, {firstName} 👋
                    </h1>
                    <p className="text-indigo-200 text-xs mt-1 max-w-md leading-relaxed">
                        {isSchool
                            ? "Track your ID card requests from submission through to printing."
                            : "Manage the full ID card pipeline or initiate new production batches for schools."}
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 shrink-0">
                    {(isSchool || isAdmin) && (
                        <button
                            onClick={() => setIsCreate(true)}
                            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-900/30"
                        >
                            <Plus size={13} strokeWidth={2.5} /> New Request
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/idcard/requests")}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/10"
                    >
                        View All <ChevronRight size={13} />
                    </button>
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs font-medium">
                    <AlertCircle size={13} /> {error}
                </div>
            )}

            {/* ── Action Alert ── */}
            {!loading && stats.actionableCount > 0 && (
                <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Zap size={14} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-800">
                                {stats.actionableCount} request{stats.actionableCount > 1 ? "s" : ""} need{stats.actionableCount === 1 ? "s" : ""} your attention
                            </p>
                            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Review and take action to keep the pipeline moving.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate("/idcard/requests")}
                        className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                        Review
                    </button>
                </div>
            )}

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard title="Total Requests"    value={stats.total}          icon={FileText}     colorClass="bg-blue-50 text-blue-600"    loading={loading} />
                <StatCard title="In Progress"       value={stats.inProgress}     icon={TrendingUp}   colorClass="bg-amber-50 text-amber-600"   loading={loading} />
                <StatCard title="Completed"         value={stats.completed}      icon={CheckCircle}  colorClass="bg-emerald-50 text-emerald-600" loading={loading} />
                <StatCard title="Students Enrolled" value={stats.totalStudents}  sub={`${stats.printedStudents} dispatched`} icon={Users} colorClass="bg-purple-50 text-purple-600" loading={loading} />
            </div>

            {/* ── Bottom Grid: Pipeline + Recent ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Pipeline Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 size={14} className="text-gray-400" />
                        <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Pipeline Breakdown</h2>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                    ) : stats.total === 0 ? (
                        <div className="flex flex-col items-center py-8 text-gray-300">
                            <Activity size={24} strokeWidth={1.5} className="mb-2" />
                            <p className="text-xs font-medium">No data yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pipeline.map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">{item.label}</span>
                                        <span className="text-gray-900 font-bold">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-1.5 rounded-full ${item.color} transition-all duration-700 ease-out`}
                                            style={{ width: `${(item.count / stats.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Requests */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Recent Requests</h2>
                        <button onClick={() => navigate("/idcard/requests")}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5">
                            View all <ChevronRight size={12} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-gray-400">
                            <FileText size={24} strokeWidth={1.5} className="mb-2 opacity-40" />
                            <p className="text-sm font-medium text-gray-500">No requests yet</p>
                            {isSchool && (
                                <button onClick={() => setIsCreate(true)}
                                    className="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                                    Create First Request
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {requests.slice(0, 6).map(r => {
                                const meta = STATUS_META[r.status] || STATUS_META.SUBMITTED;
                                return (
                                    <div
                                        key={r.id}
                                        onClick={() => navigate(`/idcard/requests/${r.id}`)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">{r.request_no}</p>
                                            {isAdmin && <p className="text-[10px] text-gray-400 truncate">{r.tenant_name}</p>}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <Users size={10} className="text-gray-400" />
                                                {r.total_students ?? 0}
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${meta.color}`}>
                                                <span className={`w-1 h-1 rounded-full ${meta.dot}`} />
                                                {meta.label}
                                            </span>
                                            <span className="text-[10px] text-gray-400 w-14 text-right">{fmtDate(r.created_at)}</span>
                                            <ChevronRight size={12} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <CreateRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreate(false)}
                onCreated={loadData}
            />
        </div>
    );
}