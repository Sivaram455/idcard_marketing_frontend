import { useState, useEffect, useMemo } from "react";
import {
    Ticket, Clock, CheckCircle, AlertCircle,
    Search, Plus, Filter, MessageSquare,
    ChevronRight, ChevronLeft, ChevronDown, User, Calendar, Settings, Zap,
    RefreshCw, Loader2, MoreVertical, LayoutGrid, List,
    ArrowUpRight, Users, Activity
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

export default function SupportDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterDev, setFilterDev] = useState("");
    const [filterUnassigned, setFilterUnassigned] = useState(false);
    const [developers, setDevelopers] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    // Check if user has management permissions (admin/GMMC)
    const canManage = useMemo(() => ['admin', 'GMMC_ADMIN'].includes(user?.role), [user]);

    useEffect(() => {
        fetchTickets();
        if (canManage) {
            fetchDevelopers();
        }
    }, [canManage]);

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
        if (!canManage) return;
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

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toString().includes(searchTerm);
            const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
            const matchesDev = filterDev ? (t.assigned_to && String(t.assigned_to) === String(filterDev)) : true;
            const matchesUnassigned = filterUnassigned ? !t.assigned_to : true;
            return matchesSearch && matchesStatus && matchesDev && matchesUnassigned;
        });
    }, [tickets, searchTerm, filterStatus, filterDev, filterUnassigned]);

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTickets.slice(start, start + itemsPerPage);
    }, [filteredTickets, currentPage]);

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterDev, filterUnassigned]);

    const stats = useMemo(() => ({
        total: tickets.length,
        unassigned: tickets.filter(t => !t.assigned_to).length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolvedToday: tickets.filter(t => t.status === 'RESOLVED' && new Date(t.updated_at).toLocaleDateString() === new Date().toLocaleDateString()).length,
        avgWaitTime: "4.2h"
    }), [tickets]);

    const poppins = { fontFamily: "'Poppins', sans-serif" };

    return (
        <div style={poppins} className="p-3 space-y-3 animate-in fade-in duration-500">
            {/* Compact Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase italic">Support Ops</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                            {user?.role === 'SUPPORT' ? 'Operational Access' : 'Management Console'} <span className="text-slate-200">|</span> {stats.total} Active
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchTickets}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                        title="Sync Systems"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => navigate('/ticketing/new')}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                    >
                        <Plus size={12} strokeWidth={3} /> New Case
                    </button>
                </div>
            </div>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                    { label: "Inbox", value: stats.unassigned, icon: Ticket, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Active", value: stats.inProgress, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Success", value: stats.resolvedToday, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Time", value: stats.avgWaitTime, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center gap-2.5 group hover:border-indigo-100 transition-all">
                        <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                            <s.icon size={16} className={s.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                            <p className="text-sm font-black text-slate-900 leading-none mt-1 tracking-tight">{loading ? "—" : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Compact Table Workspace */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Filter Header */}
                <div className="px-3 py-2 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/30">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:border-indigo-400 outline-none transition-all shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-100 shadow-sm">
                            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tight transition-all ${filterStatus === st ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {st.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => setFilterUnassigned(!filterUnassigned)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 border ${filterUnassigned ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-100" : "bg-white text-slate-400 border-slate-200 hover:text-indigo-600"
                                }`}
                        >
                            <Users size={12} strokeWidth={3} /> {filterUnassigned ? "Unassigned" : "All"}
                        </button>

                        {canManage && (
                            <div className="relative">
                                <select
                                    className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600 outline-none appearance-none hover:border-slate-300 transition-all cursor-pointer uppercase tracking-widest"
                                    value={filterDev}
                                    onChange={(e) => setFilterDev(e.target.value)}
                                >
                                    <option value="">Assignee</option>
                                    {developers.map(dev => (
                                        <option key={dev.id} value={dev.id.toString()}>{dev.full_name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto min-h-[200px]">
                    <div
                        className="grid px-4 py-1.5 bg-slate-50/50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest"
                        style={{ gridTemplateColumns: canManage ? "80px 1fr 100px 80px 150px 30px" : "80px 1fr 100px 80px 100px 30px" }}
                    >
                        <span>ID</span>
                        <span>Overview</span>
                        <span>Status</span>
                        <span>Level</span>
                        <span>{canManage ? "Allocation" : "Owner"}</span>
                        <span />
                    </div>

                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            Array(10).fill(0).map((_, i) => (
                                <div key={i} className="px-4 py-2 animate-pulse">
                                    <div className="h-6 bg-slate-50 rounded-lg" />
                                </div>
                            ))
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                                <Activity size={32} strokeWidth={1} className="mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Operational Data</p>
                            </div>
                        ) : (
                            paginatedTickets.map((t) => {
                                const st = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
                                const pr = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.LOW;
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => navigate(`/ticketing/${t.id}`)}
                                        className="grid items-center px-4 py-1.5 hover:bg-slate-50/50 cursor-pointer transition-all group relative border-l-2 border-transparent hover:border-indigo-600"
                                        style={{ gridTemplateColumns: canManage ? "80px 1fr 100px 80px 150px 30px" : "80px 1fr 100px 80px 100px 30px" }}
                                    >
                                        <div className="font-mono text-[10px] font-black text-slate-400 tracking-tighter">
                                            #TX-{t.id.toString().padStart(4, '0')}
                                        </div>

                                        <div className="min-w-0 pr-4">
                                            <p className="text-[11px] font-black text-slate-900 truncate group-hover:text-indigo-600 uppercase italic tracking-tight leading-none">
                                                {t.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                    {t.tenant_name || 'System'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-tight ${st.color}`}>
                                                <span className={`w-1 h-1 rounded-full ${st.dot} shadow-sm animate-pulse`} />
                                                {st.label}
                                            </span>
                                        </div>

                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${pr.color}`}>
                                                {pr.label}
                                            </span>
                                        </div>

                                        <div onClick={e => e.stopPropagation()}>
                                            {canManage ? (
                                                !t.assigned_to ? (
                                                    <div className="relative">
                                                        <select
                                                            className="w-full bg-amber-50 border border-amber-200 rounded-lg text-[8px] font-black py-1 pl-2 pr-6 outline-none appearance-none hover:bg-white hover:border-amber-400 transition-all text-amber-700 cursor-pointer uppercase"
                                                            value=""
                                                            onChange={(e) => handleQuickAssign(e, t.id, e.target.value)}
                                                        >
                                                            <option value="" disabled hidden>Deploy...</option>
                                                            {developers.map(dev => (
                                                                <option key={dev.id} value={dev.id}>{dev.full_name}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                                                    </div>
                                                ) : (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border min-w-0 ${t.assigned_to === user?.id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                        <User size={10} className={t.assigned_to === user?.id ? 'text-white' : 'text-slate-400'} />
                                                        <span className="text-[8px] font-black uppercase truncate tracking-tight">
                                                            {t.assignee_name?.split(' ')[0] || 'In-Dev'}
                                                        </span>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase truncate">
                                                    <User size={10} className="shrink-0" />
                                                    {t.assignee_name?.split(' ')[0] || 'Unassigned'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end">
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer Pagination */}
                {!loading && filteredTickets.length > itemsPerPage && (
                    <div className="px-4 py-2 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            {filteredTickets.length} cases tracked
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 group disabled:opacity-30 transition-all bg-white"
                            >
                                <ChevronLeft size={12} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 group disabled:opacity-30 transition-all bg-white"
                            >
                                <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
