import { useState, useEffect, useMemo } from "react";
import {
    Ticket, Clock, CheckCircle, AlertCircle,
    Search, Plus, Hammer, MessageSquare,
    ChevronRight, ChevronLeft, ChevronDown, User, Calendar, Settings, Zap,
    RefreshCw, Loader2, MoreVertical, LayoutGrid, List,
    ArrowUpRight, Target, Layout, Code2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGetTickets, apiUpdateTicket } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../auth/AuthContext";

const STATUS_CONFIG = {
    OPEN: { label: "Incoming", color: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400" },
    IN_PROGRESS: { label: "Coding", color: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-400" },
    RESOLVED: { label: "Fixed", color: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400" },
    CLOSED: { label: "Merged", color: "bg-slate-50 text-slate-500 border-slate-100", dot: "bg-slate-300" },
};

const PRIORITY_CONFIG = {
    CRITICAL: { label: "Blocker", color: "text-rose-600 bg-rose-50 border-rose-100" },
    HIGH: { label: "Hotfix", color: "text-orange-600 bg-orange-50 border-orange-100" },
    MEDIUM: { label: "Sprint", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    LOW: { label: "Backlog", color: "text-slate-500 bg-slate-50 border-slate-100" },
};

export default function DeveloperDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // Increased for more visibility

    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await apiGetTickets();
            if (data.success) {
                const myTickets = (data.tickets || []).filter(t => String(t.assigned_to) === String(user?.id));
                setTickets(myTickets);
            }
        } catch (err) {
            toast.error(err.message || "Sync Error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (e, ticketId, newStatus) => {
        e.stopPropagation();
        try {
            const data = await apiUpdateTicket(ticketId, { status: newStatus });
            if (data.success) {
                toast.success("Updated");
                fetchTickets();
            }
        } catch (err) {
            toast.error(err.message || "Failed");
        }
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toString().includes(searchTerm);
            const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [tickets, searchTerm, filterStatus]);

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTickets.slice(start, start + itemsPerPage);
    }, [filteredTickets, currentPage]);

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const stats = useMemo(() => ({
        total: tickets.length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        pendingReview: tickets.filter(t => t.status === 'OPEN').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    }), [tickets]);

    const poppins = { fontFamily: "'Poppins', sans-serif" };

    return (
        <div style={poppins} className="p-3 space-y-3 animate-in fade-in duration-500">
            {/* Direct Header */}
            <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
                        <Code2 className="text-white" size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">Dev Terminal</h1>
                            <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black rounded border border-slate-200 uppercase">Live</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                             Payload: {stats.total} Assigned Tasks
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchTickets} className="p-2 text-slate-400 hover:text-emerald-600 transition-all">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => navigate('/ticketing/new')}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                    >
                        <Plus size={12} strokeWidth={3} /> Bug Log
                    </button>
                </div>
            </div>

            {/* Tight Stats */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: "Active", value: stats.inProgress, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending", value: stats.pendingReview, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Resolved", value: stats.resolved, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center group">
                        <span className={`text-xl font-black ${s.color} italic leading-none`}>{loading ? "—" : s.value}</span>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Compact Task Workspace */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/20">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                        <input
                            type="text"
                            placeholder="Filter board..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-0.5">
                        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.1em] transition-all ${filterStatus === st ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                {st === 'IN_PROGRESS' ? 'Coding' : st === 'OPEN' ? 'Queue' : st.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-lg" />
                        ))
                    ) : filteredTickets.length === 0 ? (
                        <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-300">
                             <p className="text-[10px] font-black uppercase tracking-widest">No Active Payloads</p>
                        </div>
                    ) : (
                        paginatedTickets.map((t) => {
                            const st = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
                            const pr = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.LOW;
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => navigate(`/ticketing/${t.id}`)}
                                    className="p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 transition-all group relative cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-mono font-black text-slate-400">#TX-{t.id}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${st.color}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${pr.color}`}>
                                            {pr.label}
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 leading-tight uppercase italic mb-2 truncate group-hover:text-emerald-700">
                                        {t.title}
                                    </h3>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest truncate max-w-[100px]">
                                            {t.tenant_name || 'Global'}
                                        </span>
                                        <div onClick={e => e.stopPropagation()} className="flex items-center gap-1.5">
                                            {t.status === 'OPEN' && (
                                                <button
                                                    onClick={(e) => handleUpdateStatus(e, t.id, 'IN_PROGRESS')}
                                                    className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                                                >
                                                    Start
                                                </button>
                                            )}
                                            {t.status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={(e) => handleUpdateStatus(e, t.id, 'RESOLVED')}
                                                    className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                                                >
                                                    Fix
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Compact Pagination */}
                {!loading && filteredTickets.length > itemsPerPage && (
                    <div className="px-3 py-2 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            Page {currentPage} / {totalPages}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-2 py-1 rounded border border-slate-200 text-slate-400 text-[8px] font-black uppercase disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 rounded border border-slate-200 text-slate-400 text-[8px] font-black uppercase disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
