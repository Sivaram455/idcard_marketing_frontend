import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequests } from "../../utils/api";
import {
    FileText, Plus, RefreshCw, ChevronRight, ChevronLeft,
    Search, AlertCircle, Users, CheckCircle,
    Clock, XCircle, Zap, TrendingUp, Activity, Loader2, Package, Check, Filter
} from "lucide-react";
import CreateRequestModal from "./CreateRequestModal";

const STATUS_CONFIG = {
    SUBMITTED:           { label: "Submitted",        color: "bg-blue-50 text-blue-700 border-blue-100",           dot: "bg-blue-500"    },
    GMMC_APPROVED:       { label: "GMMC Approved",    color: "bg-indigo-50 text-indigo-700 border-indigo-100",         dot: "bg-indigo-500"   },
    GMMC_REJECTED:       { label: "GMMC Rejected",    color: "bg-rose-50 text-rose-700 border-rose-100",             dot: "bg-rose-500"      },
    PRINTER_APPROVED:    { label: "Printer Approved", color: "bg-purple-50 text-purple-700 border-purple-100",       dot: "bg-purple-500"   },
    PRINTER_REJECTED:    { label: "Printer Rejected", color: "bg-rose-50 text-rose-700 border-rose-100",             dot: "bg-rose-500"      },
    SAMPLE_UPLOADED:     { label: "Sample Ready",     color: "bg-amber-50 text-amber-700 border-amber-100",          dot: "bg-amber-500"    },
    SCHOOL_VERIFIED:     { label: "School Verified",  color: "bg-teal-50 text-teal-700 border-teal-100",            dot: "bg-teal-500"     },
    GMMC_VERIFIED:       { label: "Final Verified",   color: "bg-cyan-50 text-cyan-700 border-cyan-100",            dot: "bg-cyan-500"     },
    DISPATCHED:          { label: "Dispatched",       color: "bg-emerald-50 text-emerald-700 border-emerald-100",   dot: "bg-emerald-500"  },
    BULK_PRINT_APPROVED: { label: "Completed",        color: "bg-emerald-50 text-emerald-700 border-emerald-100",   dot: "bg-emerald-500"  },
};

const STAGES = [
    { key: "ALL",                label: "All Cycles",  icon: Activity    },
    { key: "SUBMITTED",          label: "Awaiting",      icon: Clock       },
    { key: "active",             label: "In Progress",  icon: TrendingUp  },
    { key: "SAMPLE_UPLOADED",    label: "Needs Action",  icon: Zap         },
    { key: "DISPATCHED",         label: "Completed",    icon: Package     },
];

export default function RequestList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [search, setSearch]       = useState("");
    const [stage, setStage]         = useState("ALL");
    const [page, setPage]           = useState(1);
    const PER_PAGE = 10;

    const fetchRequests = async () => {
        setLoading(true); setError(null);
        try {
            const res = await apiGetRequests();
            setRequests(res.data || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRequests(); }, []);
    useEffect(() => { setPage(1); }, [search, stage]);

    const canCreate  = ["school"].includes(user?.role);
    const isAdmin    = ["admin"].includes(user?.role);

    const isActionable = (status) => {
        if (isAdmin)                  return ["SUBMITTED", "SCHOOL_VERIFIED"].includes(status);
        if (user?.role === "printer") return ["GMMC_APPROVED", "PRINTER_APPROVED", "GMMC_VERIFIED"].includes(status);
        if (user?.role === "school")  return status === "SAMPLE_UPLOADED";
        return false;
    };

    const filtered = useMemo(() => {
        let d = [...requests];
        if (stage === "active")
            d = d.filter(r => ["GMMC_APPROVED","PRINTER_APPROVED","SAMPLE_UPLOADED","SCHOOL_VERIFIED","GMMC_VERIFIED"].includes(r.current_status));
        else if (stage === "rejected")
            d = d.filter(r => r.current_status?.includes("REJECTED"));
        else if (stage !== "ALL")
            d = d.filter(r => r.current_status === stage || (stage === "DISPATCHED" && r.current_status === "BULK_PRINT_APPROVED"));
        
        if (search.trim()) {
            const q = search.toLowerCase();
            d = d.filter(r =>
                (r.request_no   || "").toLowerCase().includes(q) ||
                (r.tenant_name  || "").toLowerCase().includes(q) ||
                (r.tenant_code  || "").toLowerCase().includes(q)
            );
        }
        return d;
    }, [search, stage, requests]);

    const counts = useMemo(() => ({
        ALL:                 requests.length,
        SUBMITTED:           requests.filter(r => r.current_status === "SUBMITTED").length,
        active:              requests.filter(r => ["GMMC_APPROVED","PRINTER_APPROVED","SAMPLE_UPLOADED","SCHOOL_VERIFIED","GMMC_VERIFIED"].includes(r.current_status)).length,
        SAMPLE_UPLOADED:     requests.filter(r => isActionable(r.current_status)).length,
        DISPATCHED:          requests.filter(r => r.current_status === "DISPATCHED" || r.current_status === "BULK_PRINT_APPROVED").length,
    }), [requests, user?.role]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const pageItems  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const fmtDate = (d) => {
        if (!d) return "—";
        const dt = new Date(d);
        return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-white">

            {/* ── Page Heading ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Cycle <span className="text-blue-600">Tracking</span></h1>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest opacity-60">
                        Operational pipeline management
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchRequests} 
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    {(canCreate || isAdmin) && (
                        <button 
                            onClick={() => navigate("/idcard/create")}
                            className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-100 flex items-center gap-2"
                        >
                            <Plus size={14} strokeWidth={3} /> New Request
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filters & Search ── */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl overflow-x-auto scrollbar-hide border border-slate-100">
                    {STAGES.map(({ key, label, icon: Icon }) => {
                        const count  = counts[key] ?? 0;
                        const active = stage === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setStage(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    active ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-900 hover:bg-white/50"
                                }`}
                            >
                                <Icon size={12} strokeWidth={2.5} />
                                {label}
                                {count > 0 && (
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ml-1 ${
                                        active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="relative flex-1 group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="SEARCH NODES..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 placeholder-slate-300 outline-none focus:bg-white focus:border-blue-600 transition-all shadow-inner"
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-rose-600 text-white rounded-lg px-4 py-2 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 italic">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* ── Request Table ── */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="px-6 py-4 animate-pulse border-b border-slate-50 flex gap-6">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-3 bg-slate-50 rounded w-1/4" />
                                        <div className="h-2 bg-slate-50 rounded w-1/6" />
                                    </div>
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <FileText size={48} strokeWidth={1} className="opacity-10 mb-4" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">Zero Records</p>
                            </div>
                        ) : (
                            pageItems.map((req) => {
                                const cfg = STATUS_CONFIG[req.current_status] || STATUS_CONFIG.SUBMITTED;
                                const actionable = isActionable(req.current_status);
                                
                                return (
                                    <div
                                        key={req.id}
                                        onClick={() => navigate(`/idcard/requests/${req.id}`)}
                                        className="flex flex-col md:flex-row md:items-center px-6 py-4 hover:bg-slate-50 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-500 ${
                                                actionable ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 text-slate-200 group-hover:border-blue-200 group-hover:text-blue-600"
                                            }`}>
                                                {actionable ? <Zap size={18} fill="currentColor" /> : <FileText size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[11px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic tracking-tight">
                                                        {req.request_no}
                                                    </p>
                                                    {actionable && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 text-white text-[7px] font-black uppercase rounded animate-pulse tracking-widest">
                                                            Action
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{req.tenant_name}</p>
                                                    <span className="text-slate-200 text-[8px]">/</span>
                                                    <p className="text-[8px] text-blue-500 font-black uppercase tracking-widest italic">{req.tenant_code}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-8 mt-4 md:mt-0 shrink-0 ml-14 md:ml-0">
                                            <div className="min-w-[110px]">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${cfg.color}`}>
                                                    <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-end min-w-[50px]">
                                                <div className="flex items-center gap-1 text-[11px] font-black text-slate-900 italic">
                                                    {req.total_students ?? 0}
                                                </div>
                                                <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest italic">NODES</p>
                                            </div>

                                            <div className="flex flex-col items-end min-w-[70px]">
                                                <p className="text-[9px] text-slate-900 font-black uppercase italic">
                                                    {fmtDate(req.created_at)}
                                                </p>
                                                <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest italic">DATE</p>
                                            </div>

                                            <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Pagination ── */}
                {!loading && filtered.length > 0 && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                            Range: <span className="text-slate-900">{(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)}</span> / <span className="text-slate-900 italic">{filtered.length}</span>
                        </p>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 transition-all shadow-sm"
                            >
                                <ChevronLeft size={14} strokeWidth={3} />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                    <button
                                        key={pg}
                                        onClick={() => setPage(pg)}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[8px] font-black uppercase transition-all ${
                                            page === pg 
                                                ? "bg-slate-900 text-white shadow-lg" 
                                                : "text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200"
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                ))}
                            </div>

                            <button 
                                disabled={page === totalPages} 
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 transition-all shadow-sm"
                            >
                                <ChevronRight size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
