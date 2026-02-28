import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequests } from "../../utils/api";
import {
    FileText, Plus, RefreshCw, ChevronRight,
    Search, Filter, AlertCircle
} from "lucide-react";

const STATUS_CONFIG = {
    SUBMITTED: { label: "Submitted", color: "bg-blue-50 text-blue-700 border-blue-100" },
    GMMC_APPROVED: { label: "GMMC Approved", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    GMMC_REJECTED: { label: "GMMC Rejected", color: "bg-red-50 text-red-700 border-red-100" },
    PRINTER_APPROVED: { label: "Printer Approved", color: "bg-purple-50 text-purple-700 border-purple-100" },
    PRINTER_REJECTED: { label: "Printer Rejected", color: "bg-red-50 text-red-700 border-red-100" },
    SAMPLE_UPLOADED: { label: "Sample Uploaded", color: "bg-amber-50 text-amber-700 border-amber-100" },
    SCHOOL_VERIFIED: { label: "School Verified", color: "bg-teal-50 text-teal-700 border-teal-100" },
    GMMC_VERIFIED: { label: "GMMC Verified", color: "bg-cyan-50 text-cyan-700 border-cyan-100" },
    BULK_PRINT_APPROVED: { label: "Print Approved ✓", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

export default function RequestList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiGetRequests();
            setRequests(res.data || []);
            setFiltered(res.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    useEffect(() => {
        let data = [...requests];
        if (statusFilter !== "ALL") {
            data = data.filter(r => r.current_status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(r =>
                r.request_no.toLowerCase().includes(q) ||
                (r.tenant_name || "").toLowerCase().includes(q)
            );
        }
        setFiltered(data);
    }, [search, statusFilter, requests]);

    const canCreate = user?.role === 'SCHOOL_ADMIN' || user?.role === 'school';

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        ID Card <span className="text-indigo-600">Requests</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} request{filtered.length !== 1 ? 's' : ''} found</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchRequests} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors" title="Refresh">
                        <RefreshCw size={16} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {canCreate && (
                        <button
                            onClick={() => navigate('/idcard/create-request')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                            <Plus size={18} /> New Request
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-600">
                    <AlertCircle size={18} />
                    <span className="text-sm font-semibold">{error}</span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by request no. or school..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition-colors"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        className="pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition-colors appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-slate-400">
                        <RefreshCw size={28} className="animate-spin mx-auto mb-4" />
                        <p className="text-sm font-semibold">Loading requests...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <FileText size={36} className="mx-auto mb-4 opacity-30" />
                        <p className="text-sm font-semibold">No requests found</p>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <div>Request No.</div>
                            <div>School / Tenant</div>
                            <div>Status</div>
                            <div>Created By</div>
                            <div>Date</div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {filtered.map((req) => {
                                const cfg = STATUS_CONFIG[req.current_status] || { label: req.current_status, color: "bg-slate-50 text-slate-600 border-slate-100" };
                                return (
                                    <div
                                        key={req.id}
                                        onClick={() => navigate(`/idcard/requests/${req.id}`)}
                                        className="px-6 py-4 grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 items-center hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                                                <FileText size={14} className="text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">{req.request_no}</span>
                                        </div>
                                        <div className="text-sm text-slate-600 font-medium pl-11 md:pl-0">
                                            {req.tenant_name || "—"}
                                            <span className="text-slate-400 text-xs ml-1">({req.tenant_code})</span>
                                        </div>
                                        <div>
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 pl-11 md:pl-0">{req.created_by_name || "—"}</div>
                                        <div className="flex items-center justify-between pl-11 md:pl-0">
                                            <span className="text-[11px] text-slate-400">
                                                {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all ml-2" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
