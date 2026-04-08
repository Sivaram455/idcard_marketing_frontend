import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequests } from "../../utils/api";
import {
    FileText, CheckCircle, Plus, ChevronRight,
    Loader2, AlertCircle, TrendingUp, Users,
    Activity, Zap, BarChart2, Package
} from "lucide-react";
import CreateRequestModal from "./CreateRequestModal";

const STATUS_META = {
    SUBMITTED:           { label: "Submitted",        color: "bg-blue-50 text-blue-700 border-blue-100",           dot: "bg-blue-500"    },
    GMMC_APPROVED:       { label: "GMMC Approved",    color: "bg-indigo-50 text-indigo-700 border-indigo-100",         dot: "bg-indigo-500"   },
    GMMC_REJECTED:       { label: "GMMC Rejected",    color: "bg-rose-50 text-rose-700 border-rose-100",             dot: "bg-rose-500"      },
    PRINTER_APPROVED:    { label: "Printer Approved", color: "bg-purple-50 text-purple-700 border-purple-100",       dot: "bg-purple-500"   },
    PRINTER_REJECTED:    { label: "Printer Rejected", color: "bg-rose-50 text-rose-700 border-rose-100",             dot: "bg-rose-500"      },
    SAMPLE_UPLOADED:     { label: "Sample Uploaded",  color: "bg-amber-50 text-amber-700 border-amber-100",          dot: "bg-amber-500"    },
    SCHOOL_VERIFIED:     { label: "School Verified",  color: "bg-teal-50 text-teal-700 border-teal-100",            dot: "bg-teal-500"     },
    GMMC_VERIFIED:       { label: "GMMC Verified",    color: "bg-cyan-50 text-cyan-700 border-cyan-100",            dot: "bg-cyan-500"     },
    DISPATCHED:          { label: "Dispatched",       color: "bg-blue-600 text-white border-blue-600",             dot: "bg-white"        },
    BULK_PRINT_APPROVED: { label: "Print Approved",   color: "bg-green-50 text-green-700 border-green-100",         dot: "bg-green-500"    },
};

const StatCard = ({ title, value, sub, icon: Icon, colorClass, loading }) => (
    <div className="bg-slate-50/50 rounded-lg border border-slate-100 p-3 hover:border-indigo-200 transition-all group">
        <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${colorClass.split(' ')[0]} bg-opacity-20`}>
                <Icon size={12} className={colorClass.split(' ')[1]} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] italic">{title}</p>
        </div>
        <div className="flex items-baseline gap-2">
            <p className="text-xl font-black text-slate-900 leading-none italic uppercase">
                {loading ? <span className="text-slate-200 animate-pulse">···</span> : value}
            </p>
            {sub && <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter truncate italic">{sub}</p>}
        </div>
    </div>
);

export default function IDCardDashboard() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const [requests, setRequests]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);

    const loadData = () => {
        setLoading(true);
        apiGetRequests()
            .then(r  => setRequests(r.data || []))
            .catch(() => setError("Failed to load dashboard data."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const isSchool = useMemo(() => ["school"].includes(user?.role), [user?.role]);
    const isAdmin  = useMemo(() => ["admin"].includes(user?.role),   [user?.role]);

    const stats = useMemo(() => {
        const total         = requests.length;
        const completed     = requests.filter(r => ["DISPATCHED", "BULK_PRINT_APPROVED"].includes(r.status)).length;
        const rejected      = requests.filter(r => r.status?.includes("REJECTED")).length;
        const inProgress    = total - completed - rejected;
        const totalStudents = requests.reduce((s, r) => s + (Number(r.total_students) || 0), 0);
        const printedStudents = requests
            .filter(r => ["DISPATCHED", "BULK_PRINT_APPROVED"].includes(r.status))
            .reduce((s, r) => s + (Number(r.total_students) || 0), 0);

        let actionableCount = 0;
        if (isAdmin)                  actionableCount = requests.filter(r => ["SUBMITTED","SCHOOL_VERIFIED"].includes(r.status)).length;
        else if (user?.role === "printer") actionableCount = requests.filter(r => ["GMMC_APPROVED","PRINTER_APPROVED", "GMMC_VERIFIED", "BULK_PRINT_APPROVED"].includes(r.status)).length;
        else if (user?.role === "school")  actionableCount = requests.filter(r => r.status === "SAMPLE_UPLOADED").length;

        return { total, completed, rejected, inProgress, totalStudents, printedStudents, actionableCount };
    }, [requests, isAdmin, user?.role]);

    const pipeline = useMemo(() => [
        { label: "Under Review",          count: requests.filter(r => ["SUBMITTED","GMMC_APPROVED", "PRINTER_APPROVED"].includes(r.status)).length,                     color: "bg-blue-600" },
        { label: "Sample & Verify",       count: requests.filter(r => ["SAMPLE_UPLOADED","SCHOOL_VERIFIED","GMMC_VERIFIED"].includes(r.status)).length,                 color: "bg-indigo-600" },
        { label: "Dispatched",            count: stats.completed,                                                                                                        color: "bg-emerald-600" },
        { label: "Rejected",              count: stats.rejected,                                                                                                         color: "bg-rose-600"    },
    ].filter(i => i.count > 0), [requests, stats]);

    const fmtDate = (d) => {
        if (!d) return "—";
        const dt = new Date(d);
        return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    };

    const firstName = user?.full_name?.split(" ")[0] || "User";

    return (
        <div className="p-3 space-y-4 min-h-screen bg-white">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight italic uppercase leading-none">ID Card <span className="text-indigo-600">Hub</span></h1>
                    <p className="text-[8px] text-slate-400 mt-1 font-bold uppercase tracking-[0.2em] opacity-60">
                        {isSchool ? `School: ${user?.tenant_name}` : "Central Ops Control"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {(isSchool || isAdmin) && (
                        <button
                            onClick={() => navigate("/idcard/create")}
                            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-100 flex items-center gap-2"
                        >
                            <Plus size={12} strokeWidth={3} /> Create
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/idcard/requests")}
                        className="bg-white hover:bg-slate-50 text-slate-900 px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-slate-100 flex items-center gap-2"
                    >
                        Index <ChevronRight size={12} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* ── Action Alert ── */}
            {!loading && stats.actionableCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-600 text-white rounded-xl px-4 py-3 shadow-xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                            <Activity size={16} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-tight leading-none italic">
                                {stats.actionableCount} Pending Actions
                            </p>
                            <p className="text-[8px] font-bold text-indigo-100 mt-1 opacity-80 uppercase tracking-widest italic leading-none">Sync Required</p>
                        </div>
                    </div>
                    <button onClick={() => navigate("/idcard/requests")}
                        className="shrink-0 bg-white text-indigo-600 px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg relative z-10">
                        Authorize
                    </button>
                </div>
            )}

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title="Total"    value={stats.total}          icon={FileText}     colorClass="bg-blue-600 text-blue-600"    loading={loading} />
                <StatCard title="Active"   value={stats.inProgress}     icon={TrendingUp}   colorClass="bg-indigo-600 text-indigo-600"   loading={loading} />
                <StatCard title="Ready"    value={stats.completed}      icon={CheckCircle}  colorClass="bg-emerald-600 text-emerald-600" loading={loading} />
                <StatCard title="Nodes"    value={stats.totalStudents}  sub={`${stats.printedStudents} SYNCED`} icon={Users} colorClass="bg-slate-900 text-slate-900" loading={loading} />
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">

                {/* Left: Pipeline */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                        <h2 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-4">Pipeline</h2>
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-slate-200" /></div>
                        ) : stats.total === 0 ? (
                            <div className="flex flex-col items-center py-4 text-slate-300">
                                <Activity size={24} strokeWidth={1} className="mb-2 opacity-10" />
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">Null</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pipeline.map(item => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1.5">
                                            <span className="text-slate-400">{item.label}</span>
                                            <span className="text-slate-900 italic">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-slate-200/50 rounded-full h-1 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                                                style={{ width: `${(item.count / stats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden group shadow-lg">
                        <h3 className="text-[11px] font-black uppercase italic tracking-tight mb-1">Ops Sync</h3>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-4 opacity-80">
                            Request production support.
                        </p>
                        <button className="w-full bg-white text-slate-900 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                            Connect
                        </button>
                    </div>
                </div>

                {/* Right: Recent Activity */}
                <div className="lg:col-span-9 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/30">
                        <h2 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Live Stream</h2>
                        <button onClick={() => navigate("/idcard/requests")}
                            className="text-[8px] font-black text-indigo-600 hover:text-indigo-700 transition-all uppercase tracking-widest flex items-center gap-1 group">
                            Full Index <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-slate-200" /></div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-slate-300 text-center px-6">
                            <FileText size={24} strokeWidth={1} className="opacity-10 mb-3" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Zero Nodes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {requests.slice(0, 8).map(r => {
                                const meta = STATUS_META[r.current_status] || STATUS_META.SUBMITTED;
                                return (    
                                    <div
                                        key={r.id}
                                        onClick={() => navigate(`/idcard/requests/${r.id}`)}
                                        className="flex items-center gap-4 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-7 h-7 rounded border ${meta.color} bg-opacity-10 flex items-center justify-center shrink-0`}>
                                                <FileText size={12} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors truncate italic leading-none">
                                                    {r.request_no}
                                                </p>
                                                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest truncate mt-1 leading-none">{r.tenant_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${meta.color}`}>
                                                <span className={`w-0.5 h-0.5 rounded-full ${meta.dot}`} />
                                                {meta.label}
                                            </span>
                                            <div className="flex flex-col items-end min-w-[40px]">
                                                <p className="text-[10px] font-black text-slate-900 leading-none italic uppercase">{r.total_students ?? 0}</p>
                                                <p className="text-[6px] font-black text-slate-400 uppercase tracking-tighter mt-0.5 italic leading-none">Units</p>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase italic w-10 text-right">{fmtDate(r.created_at)}</span>
                                            <ChevronRight size={12} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}