import { useState, useEffect, useMemo } from "react";
import {
    Ticket, Clock, CheckCircle, AlertCircle,
    Search, Plus, Filter, MessageSquare,
    ChevronRight, ChevronLeft, ChevronDown, User, Calendar, Settings, Zap,
    RefreshCw, Loader2, MoreVertical, LayoutGrid, List,
    ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGetTickets, apiUpdateTicket, apiGetDevelopers } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../auth/AuthContext";

const STATUS_CONFIG = {
    OPEN: { label: "Open", color: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400" },
    IN_PROGRESS: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-400" },
    RESOLVED: { label: "Resolved", color: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400" },
    CLOSED: { label: "Closed", color: "bg-gray-50 text-gray-500 border-gray-100", dot: "bg-gray-300" },
};

const PRIORITY_CONFIG = {
    CRITICAL: { label: "Critical", color: "text-rose-600 bg-rose-50 border-rose-100" },
    HIGH: { label: "High", color: "text-orange-600 bg-orange-50 border-orange-100" },
    MEDIUM: { label: "Medium", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    LOW: { label: "Low", color: "text-slate-500 bg-slate-50 border-slate-100" },
};

export default function TicketingDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterDev, setFilterDev] = useState("");
    const [filterMe, setFilterMe] = useState(false);
    const [developers, setDevelopers] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    useEffect(() => {
        fetchTickets();
        fetchDevelopers();
        if (['DEVELOPER', 'SUPPORT'].includes(user?.role)) {
            setFilterMe(true);
        }
    }, [user]);

    const fetchDevelopers = async () => {
        try {
            const data = await apiGetDevelopers();
            if (data.success) setDevelopers(data.data);
        } catch (err) {
            console.error("Failed to fetch developers:", err);
        }
    };

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await apiGetTickets();
            if (data.success) {
                setTickets(data.tickets || []);
            }
        } catch (err) {
            toast.error(err.message || "Failed to fetch tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAssign = async (e, ticketId, developerId) => {
        e.stopPropagation();
        try {
            const data = await apiUpdateTicket(ticketId, {
                assigned_to: developerId,
                status: 'IN_PROGRESS'
            });
            if (data.success) {
                toast.success("Ticket assigned successfully!");
                fetchTickets();
            }
        } catch (err) {
            toast.error(err.message || "Failed to assign ticket");
        }
    };

    const isInternal = ['admin', 'GMMC_ADMIN', 'SUPPORT', 'DEVELOPER'].includes(user?.role);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toString().includes(searchTerm);
            const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
            const matchesDev = filterMe 
                ? (t.assigned_to && String(t.assigned_to) === String(user?.id))
                : (!filterDev || String(t.assigned_to) === String(filterDev));
            return matchesSearch && matchesStatus && matchesDev;
        });
    }, [tickets, searchTerm, filterStatus, filterDev, filterMe, user?.id]);

    // Paginated sub-slice
    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTickets.slice(start, start + itemsPerPage);
    }, [filteredTickets, currentPage]);

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterDev]);

    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        critical: tickets.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').length,
    }), [tickets]);

    const poppins = { fontFamily: "'Poppins', sans-serif" };

    return (
        <div style={poppins} className="p-5 space-y-5 animate-in fade-in duration-500">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin-portal')}
                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-base font-extrabold text-gray-900 tracking-tight leading-none uppercase italic">Support Dashboard</h1>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            System Ticketing Center <span className="text-gray-200">|</span> {stats.total} total cases
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchTickets}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync Data
                    </button>
                </div>
            </div>

            {/* ── Stats Strip ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { label: "Total Cases", value: stats.total, icon: Ticket, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Pending Pool", value: stats.open, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Active Ops", value: stats.progress, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Escalated", value: stats.critical, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 group hover:border-indigo-100 transition-all shadow-sm">
                        <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                            <s.icon size={16} className={s.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{s.label}</p>
                            <p className="text-base font-black text-gray-900 leading-none mt-1 italic tracking-tight">{loading ? "—" : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Workspace ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

                {/* ── Filter Bar ── */}
                <div className="px-5 py-3.5 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/20">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                                type="text"
                                placeholder="Search by ID, title, or keywords..."
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:border-indigo-400 outline-none transition-all shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filterStatus === st ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {st.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        {isInternal && (
                            <button
                                onClick={() => setFilterMe(!filterMe)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${filterMe ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-100" : "bg-white text-gray-400 border-gray-100 hover:text-indigo-600"
                                    }`}
                            >
                                <User size={12} strokeWidth={3} /> {filterMe ? "My Assignments" : "All Tickets"}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {isInternal && (
                            <div className="relative">
                                <select
                                    className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none appearance-none hover:border-gray-300 transition-all cursor-pointer"
                                    value={filterDev}
                                    onChange={(e) => setFilterDev(e.target.value)}
                                >
                                    <option value="">All Assignees</option>
                                    {developers.map(dev => (
                                        <option key={dev.id} value={dev.id.toString()}>{dev.full_name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                        <div className="h-4 w-px bg-gray-200 mx-1" />
                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-all">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* ── High Density Table ── */}
                <div className="overflow-x-auto min-h-[400px]">
                    <div
                        className="grid px-5 py-2.5 bg-gray-50/50 border-b border-gray-100 text-[8px] font-black text-gray-400 uppercase tracking-widest"
                        style={{ gridTemplateColumns: "100px 1fr 120px 100px 140px 140px 40px" }}
                    >
                        <span>Case ID</span>
                        <span>Ticket Overview</span>
                        <span>Status</span>
                        <span>Priority</span>
                        <span>Assignment</span>
                        <span className="text-right pr-4">Team</span>
                        <span />
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            Array(10).fill(0).map((_, i) => (
                                <div key={i} className="px-5 py-3 animate-pulse">
                                    <div className="h-6 bg-gray-50 rounded-xl" />
                                </div>
                            ))
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                                <Ticket size={40} strokeWidth={1} className="mb-3 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-[0.2em]">No cases tracking</p>
                                <p className="text-[9px] mt-0.5">Try adjusting your workspace filters</p>
                            </div>
                        ) : (
                            paginatedTickets.map((t) => {
                                const st = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
                                const pr = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.LOW;
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => navigate(`/ticketing/${t.id}`)}
                                        className="grid items-center px-5 py-2 hover:bg-white hover:shadow-lg hover:shadow-indigo-900/5 cursor-pointer transition-all group z-10 relative"
                                        style={{ gridTemplateColumns: "100px 1fr 120px 100px 140px 140px 40px" }}
                                    >
                                        <div className="font-mono text-[10px] font-black tracking-tighter text-gray-400">
                                            #TK-{t.id.toString().padStart(4, '0')}
                                        </div>

                                        <div className="min-w-0 pr-6">
                                            <p className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors uppercase italic tracking-tight">
                                                {t.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(t.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-gray-200 select-none">·</span>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase truncate max-w-[120px]">
                                                    {t.tenant_name || 'System Base'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tight ${st.color}`}>
                                                <span className={`w-1 h-1 rounded-full ${st.dot} shadow-sm`} />
                                                {st.label}
                                            </span>
                                        </div>

                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${pr.color}`}>
                                                {pr.label}
                                            </span>
                                        </div>

                                        <div className="pr-4" onClick={e => e.stopPropagation()}>
                                            {(isInternal && !t.assigned_to) ? (
                                                <div className="relative">
                                                    <select
                                                        className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg text-[9px] font-bold py-1 pl-2 pr-6 outline-none appearance-none hover:bg-white hover:border-indigo-400 transition-all text-indigo-700 cursor-pointer"
                                                        value=""
                                                        onChange={(e) => handleQuickAssign(e, t.id, e.target.value)}
                                                    >
                                                        <option value="" disabled hidden>Assign To...</option>
                                                        {developers.map(dev => (
                                                            <option key={dev.id} value={dev.id}>{dev.full_name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {t.assigned_to ? (
                                                        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border min-w-0 ${t.assigned_to === user?.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                            {t.assigned_to === user?.id ? <User size={10} className="shrink-0" /> : <CheckCircle size={10} className="shrink-0" />}
                                                            <span className="text-[9px] font-black uppercase truncate">{t.assigned_to === user?.id ? "Assigned to You" : t.assignee_name?.split(' ')[0]}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-gray-300 italic uppercase">Pool Pending</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-0.5 items-end pr-4 min-w-0">
                                            <div className="flex items-center gap-1.5 max-w-full">
                                                <p className="text-[9px] font-black text-gray-600 truncate">{t.creator_name?.split(' ')[0]}</p>
                                                <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                                    <User size={10} className="text-indigo-400" />
                                                </div>
                                            </div>
                                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-tighter mr-6">Reporter</p>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="p-1 text-gray-300 group-hover:text-indigo-600 group-hover:bg-white rounded-lg transition-all">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Pagination Footer ── */}
                {!loading && filteredTickets.length > itemsPerPage && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} cases
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-200 transition-all shadow-sm"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                    const pg = i + 1;
                                    return (
                                        <button
                                            key={pg}
                                            onClick={() => setCurrentPage(pg)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${currentPage === pg ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-gray-400 hover:text-indigo-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {pg}
                                        </button>
                                    );
                                })}
                                {totalPages > 5 && <span className="text-gray-300 px-1 italic">...</span>}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-200 transition-all shadow-sm"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Secondary Briefing ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
                        <MessageSquare size={16} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">Active Narrative</h3>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">
                            Latest interaction log shows a spike in resolution time for critical reports.
                        </p>
                        <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-3 hover:underline">View Stream →</button>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                        <Settings size={16} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">Core Infrastructure</h3>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">
                            Operational status is nominal across all regional nodes. No scheduled downtime.
                        </p>
                        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-3 hover:underline">Live Metrics →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
