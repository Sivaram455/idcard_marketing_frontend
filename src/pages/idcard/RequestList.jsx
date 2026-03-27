import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequests } from "../../utils/api";
import {
    FileText, Plus, RefreshCw, ChevronRight,
    Search, AlertCircle, Users, CheckCircle,
    Clock, XCircle, Zap, TrendingUp, Activity, Loader2
} from "lucide-react";
import CreateRequestModal from "./CreateRequestModal";

const STATUS_CONFIG = {
    SUBMITTED:           { label: "Submitted",        color: "bg-slate-100 text-slate-600 border-slate-200",           dot: "bg-slate-400"    },
    GMMC_APPROVED:       { label: "GMMC Approved",    color: "bg-indigo-50 text-indigo-700 border-indigo-200",           dot: "bg-indigo-500"   },
    GMMC_REJECTED:       { label: "GMMC Rejected",    color: "bg-red-50 text-red-600 border-red-200",                   dot: "bg-red-400"      },
    PRINTER_APPROVED:    { label: "At Printer",        color: "bg-violet-50 text-violet-700 border-violet-200",          dot: "bg-violet-500"   },
    PRINTER_REJECTED:    { label: "Printer Rejected",  color: "bg-red-50 text-red-600 border-red-200",                   dot: "bg-red-400"      },
    SAMPLE_UPLOADED:     { label: "Sample Ready",     color: "bg-amber-50 text-amber-700 border-amber-200",              dot: "bg-amber-500"    },
    SCHOOL_VERIFIED:     { label: "School Verified",  color: "bg-teal-50 text-teal-700 border-teal-200",                dot: "bg-teal-500"     },
    GMMC_VERIFIED:       { label: "GMMC Verified",    color: "bg-cyan-50 text-cyan-700 border-cyan-200",                dot: "bg-cyan-500"     },
    BULK_PRINT_APPROVED: { label: "Dispatched ✓",     color: "bg-emerald-50 text-emerald-700 border-emerald-200",       dot: "bg-emerald-500"  },
};

const STAGES = [
    { key: "ALL",                label: "All",         icon: Activity    },
    { key: "SUBMITTED",          label: "Pending",      icon: Clock       },
    { key: "active",             label: "In Progress",  icon: TrendingUp  },
    { key: "SAMPLE_UPLOADED",    label: "Action Req.",  icon: Zap         },
    { key: "BULK_PRINT_APPROVED",label: "Completed",    icon: CheckCircle },
    { key: "rejected",           label: "Rejected",     icon: XCircle     },
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
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const PER_PAGE = 20;

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

    const canCreate  = ["SCHOOL_ADMIN", "school"].includes(user?.role);
    const isAdmin    = ["admin", "GMMC_ADMIN"].includes(user?.role);

    const isActionable = (status) => {
        if (isAdmin)                  return ["SUBMITTED", "SCHOOL_VERIFIED"].includes(status);
        if (user?.role === "printer") return ["GMMC_APPROVED", "PRINTER_APPROVED"].includes(status);
        if (canCreate)                return status === "SAMPLE_UPLOADED";
        return false;
    };

    const filtered = useMemo(() => {
        let d = [...requests];
        if (stage === "active")
            d = d.filter(r => ["GMMC_APPROVED","PRINTER_APPROVED","SAMPLE_UPLOADED","SCHOOL_VERIFIED","GMMC_VERIFIED"].includes(r.status));
        else if (stage === "rejected")
            d = d.filter(r => r.status?.includes("REJECTED"));
        else if (stage !== "ALL")
            d = d.filter(r => r.status === stage);
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
        SUBMITTED:           requests.filter(r => r.status === "SUBMITTED").length,
        active:              requests.filter(r => ["GMMC_APPROVED","PRINTER_APPROVED","SAMPLE_UPLOADED","SCHOOL_VERIFIED","GMMC_VERIFIED"].includes(r.status)).length,
        SAMPLE_UPLOADED:     requests.filter(r => isActionable(r.status)).length,
        BULK_PRINT_APPROVED: requests.filter(r => r.status === "BULK_PRINT_APPROVED").length,
        rejected:            requests.filter(r => r.status?.includes("REJECTED")).length,
    }), [requests]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const pageItems  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const fmtDate = (d) => {
        if (!d) return "—";
        const dt = new Date(d);
        return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
    };

    return (
        <div className="p-5 space-y-4">

            {/* ── Page Heading + Actions ── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-base font-black text-slate-900 tracking-tighter uppercase italic">Production Registry</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        ID Card Requests <span className="text-slate-200">|</span> <span className="text-indigo-600">{filtered.length} active records</span>
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button 
                        onClick={fetchRequests} 
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-40 transition-all shadow-sm"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                    {(canCreate || isAdmin) && (
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100/50"
                        >
                            <Plus size={14} strokeWidth={3} /> New Request
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filter Row ── */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100/50 border border-slate-200 p-1 rounded-2xl overflow-x-auto shadow-inner">
                    {STAGES.map(({ key, label, icon: Icon }) => {
                        const count  = counts[key] ?? 0;
                        const active = stage === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setStage(key)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${
                                    active ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600" : "text-slate-400 hover:text-slate-900"
                                }`}
                            >
                                <Icon size={12} />
                                {label}
                                {count > 0 && (
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg min-w-[20px] text-center ${
                                        active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="relative flex-1 min-w-[240px] max-w-sm group">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by Request ID, School Code, or Name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* ── Request Table ── */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
                <div className="overflow-x-auto min-h-[450px]">
                    {!loading && filtered.length > 0 && (
                        <div
                            className="grid px-6 py-3.5 bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]"
                            style={{ gridTemplateColumns: isAdmin
                                ? "1.6fr 2fr 1.3fr 100px 100px 100px 40px"
                                : "1.6fr 1.3fr 100px 100px 100px 40px" }}
                        >
                            <span>Case Identifier</span>
                            {isAdmin && <span>School Association</span>}
                            <span>Registry Status</span>
                            <span>Scale</span>
                            <span>Lodged</span>
                            <span>Sync</span>
                            <span />
                        </div>
                    )}

                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="px-6 py-4 animate-pulse">
                                    <div className="h-10 bg-slate-50 rounded-2xl" />
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                                <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-[0.2em]">Registry Vault Empty</p>
                                <p className="text-[10px] mt-1 font-bold">No active requests found in the current buffer</p>
                            </div>
                        ) : (
                            pageItems.map((req) => {
                                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.SUBMITTED;
                                const actionable = isActionable(req.status);
                                const cols = isAdmin
                                    ? "1.6fr 2fr 1.3fr 100px 100px 100px 40px"
                                    : "1.6fr 1.3fr 100px 100px 100px 40px";

                                return (
                                    <div
                                        key={req.id}
                                        onClick={() => navigate(`/idcard/requests/${req.id}`)}
                                        className="grid items-center px-6 py-3.5 hover:bg-slate-50 cursor-pointer transition-all group"
                                        style={{ gridTemplateColumns: cols }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                                actionable ? "bg-amber-50 border-amber-200 text-amber-500 shadow-sm shadow-amber-100" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-500"
                                            }`}>
                                                <FileText size={14} className={actionable ? "animate-pulse" : ""} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 truncate transition-colors uppercase italic tracking-tighter">
                                                    {req.request_no}
                                                </p>
                                                {!isAdmin && req.tenant_name && (
                                                    <p className="text-[9px] text-slate-400 font-bold truncate uppercase">{req.tenant_name}</p>
                                                )}
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="min-w-0 pr-6">
                                                <p className="text-[11px] text-slate-700 font-black truncate uppercase italic">{req.tenant_name || "—"}</p>
                                                <p className="text-[9px] text-indigo-500 font-black tracking-widest">{req.tenant_code || "UNKNOWN_NODE"}</p>
                                            </div>
                                        )}

                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase tracking-tight ${cfg.color}`}>
                                                <span className={`w-1 h-1 rounded-full ${cfg.dot} shadow-sm`} />
                                                {cfg.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-black italic">
                                            <Users size={12} className="text-slate-300 shrink-0" />
                                            {req.total_students ?? 0}
                                        </div>

                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{fmtDate(req.created_at)}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">{fmtDate(req.updated_at)}</div>

                                        <div className="flex justify-end">
                                            <div className="p-1.5 text-slate-200 group-hover:text-indigo-500 group-hover:bg-white rounded-xl transition-all">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── High-Density Pagination Footer ── */}
                {!loading && filtered.length > 0 && (
                    <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Buffer <span className="text-slate-900">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)}</span> <span className="text-slate-200">/</span> Registry Source <span className="text-indigo-600">{filtered.length} total</span>
                        </p>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={page === 1} 
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-20 transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                <div className="flex items-center gap-1.5 px-2">
                                    {(() => {
                                        const pages = [];
                                        const delta = 2;
                                        const left = page - delta;
                                        const right = page + delta + 1;
                                        
                                        for (let i = 1; i <= totalPages; i++) {
                                            if (i === 1 || i === totalPages || (i >= left && i < right)) {
                                                pages.push(i);
                                            } else if (i === left - 1 || i === right) {
                                                pages.push('...');
                                            }
                                        }
                                        
                                        return pages.map((pg, i) => pg === '...' ? (
                                            <span key={`dots-${i}`} className="text-slate-300 px-1 font-bold text-[10px]">...</span>
                                        ) : (
                                            <button
                                                key={pg}
                                                onClick={() => setPage(pg)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${
                                                    page === pg 
                                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 border border-indigo-600" 
                                                        : "text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200"
                                                }`}
                                            >
                                                {pg}
                                            </button>
                                        ));
                                    })()}
                                </div>

                                <button 
                                    disabled={page === totalPages} 
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-20 transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateRequestModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={fetchRequests}
            />
        </div>
    );
}
