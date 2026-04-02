import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMarketingSchools, apiGetUsers } from "../../utils/api";
import {
    Search, Plus, MapPin, RefreshCw, Edit3, Building2,
    X, ChevronRight, TrendingUp, Users, Clock, CheckCircle,
    User, Layers
} from "lucide-react";

const STATUS = {
    new:      { label: "New",       color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
    visited:  { label: "Visited",   color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    followup: { label: "Follow Up", color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
    closed:   { label: "Closed",    color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
};

const poppins = { fontFamily: "'Poppins', sans-serif" };

export default function MarketingLeads() {
    const navigate = useNavigate();
    const [schools, setSchools]       = useState([]);
    const [agents, setAgents]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [agentFilter, setAgentFilter]   = useState(null); // null = show all

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schoolsRes, usersRes] = await Promise.all([
                apiGetMarketingSchools(),
                apiGetUsers().catch(err => {
                    console.error("Users fetch restricted:", err);
                    return { data: [] }; // Fallback for agents who can't see full directory
                }),
            ]);
            setSchools(schoolsRes.data || []);
            const agentRoles = ['AGENT', 'GMMC_ADMIN', 'ADMIN', 'MARKETER'];
            setAgents((usersRes.data || []).filter(u => 
                u.role && agentRoles.includes(u.role.toUpperCase())
            ));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => ({
        ALL:      schools.length,
        new:      schools.filter(s => s.status === 'new').length,
        visited:  schools.filter(s => s.status === 'visited').length,
        followup: schools.filter(s => s.status === 'followup').length,
        closed:   schools.filter(s => s.status === 'closed').length,
    }), [schools]);

    // Count leads per agent (using assigned_to field if it exists)
    const agentLeadCounts = useMemo(() => {
        const counts = {};
        agents.forEach(a => { counts[a.id] = 0; });
        schools.forEach(s => {
            if (s.assigned_to && counts[s.assigned_to] !== undefined) {
                counts[s.assigned_to]++;
            }
        });
        return counts;
    }, [schools, agents]);

    const filtered = useMemo(() => {
        let list = [...schools];
        if (agentFilter !== null) list = list.filter(s => s.assigned_to === agentFilter);
        if (statusFilter !== "ALL") list = list.filter(s => s.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.school_name?.toLowerCase().includes(q) ||
                (s.city || "").toLowerCase().includes(q) ||
                (s.interested_in || "").toLowerCase().includes(q) ||
                (s.contact_person1 || "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [search, statusFilter, agentFilter, schools]);

    return (
        <div style={poppins} className="flex h-full min-h-screen bg-slate-50">

            {/* ── Sidebar ── */}
            <aside className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 overflow-y-auto">
                <div className="p-5 border-b border-slate-100">
                    <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest mb-1">Agent Directory</p>
                    <h2 className="text-sm font-bold text-slate-800">Field Agents</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {/* All leads */}
                    <button
                        onClick={() => setAgentFilter(null)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                            agentFilter === null
                                ? "bg-indigo-600 text-white"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${agentFilter === null ? 'bg-white/20' : 'bg-slate-100'}`}>
                                <Layers size={14} className={agentFilter === null ? 'text-white' : 'text-slate-500'} />
                            </div>
                            <span className="font-semibold text-xs">All Leads</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${agentFilter === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {stats.ALL}
                        </span>
                    </button>

                    {/* Unassigned */}
                    <button
                        onClick={() => setAgentFilter(-1)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                            agentFilter === -1
                                ? "bg-slate-800 text-white"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${agentFilter === -1 ? 'bg-white/20' : 'bg-slate-100'}`}>
                                <User size={14} className={agentFilter === -1 ? 'text-white' : 'text-slate-400'} />
                            </div>
                            <span className="font-semibold text-xs">Unassigned</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${agentFilter === -1 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {schools.filter(s => !s.assigned_to).length}
                        </span>
                    </button>

                    <div className="pt-2 pb-1">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-3">Agents</p>
                    </div>

                    {agents.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No agents found</p>
                    ) : agents.map((agent, index) => {
                        const count = agentLeadCounts[agent.id] || 0;
                        const active = agentFilter === agent.id;
                        const initials = agent.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
                        return (
                            <button key={`${agent.id}-${index}`}
                                onClick={() => setAgentFilter(agent.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                                    active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {initials}
                                    </div>
                                    <div className="min-w-0 text-left">
                                        <p className={`text-xs font-semibold truncate ${active ? 'text-white' : 'text-slate-700'}`}>{agent.full_name}</p>
                                        <p className={`text-[9px] font-medium ${active ? 'text-indigo-200' : 'text-slate-400'}`}>{agent.role}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1 ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Sidebar footer stats */}
                <div className="p-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Agents Active</span>
                        <span className="font-bold text-slate-600">{agents.length}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Leads Assigned</span>
                        <span className="font-bold text-slate-600">{schools.filter(s => s.assigned_to).length}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                        <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.round((schools.filter(s => s.assigned_to).length / (stats.ALL || 1)) * 100)}%` }}
                        />
                    </div>
                    <p className="text-[9px] text-slate-400 text-right">{Math.round((schools.filter(s => s.assigned_to).length / (stats.ALL || 1)) * 100)}% assigned</p>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            {agentFilter === null
                                ? "All Leads"
                                : agentFilter === -1
                                ? "Unassigned Leads"
                                : `${agents.find(a => a.id === agentFilter)?.full_name || 'Agent'}'s Leads`}
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">{filtered.length} leads</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchData} disabled={loading}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                            <RefreshCw size={16} className={loading ? "animate-spin text-indigo-500" : ""} />
                        </button>
                        <button onClick={() => navigate('/marketing/add')}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
                            <Plus size={15} /> Add Lead
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Total", value: stats.ALL, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                        { label: "Visited", value: stats.visited, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Follow Up", value: stats.followup, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Closed", value: stats.closed, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((s, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                                <s.icon size={16} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800 leading-none">{s.value}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter & Search */}
                <div className="flex gap-3">
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                        {['ALL', 'new', 'visited', 'followup', 'closed'].map(key => {
                            const active = statusFilter === key;
                            const label = key === 'ALL' ? 'All' : STATUS[key]?.label;
                            return (
                                <button key={key} onClick={() => setStatusFilter(key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                        active ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    }`}>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search school, city, contact..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700 placeholder-slate-400"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    {!loading && filtered.length > 0 && (
                        <div className="grid px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                            style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1fr 70px" }}>
                            <span>School</span>
                            <span>City</span>
                            <span>Interested In</span>
                            <span>Status</span>
                            <span />
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <RefreshCw size={22} className="animate-spin mb-3 text-indigo-400" />
                            <p className="text-sm font-medium">Loading...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Building2 size={28} className="mb-3 text-slate-200" strokeWidth={1.5} />
                            <p className="text-sm font-semibold text-slate-500">No leads found</p>
                            <button onClick={() => { setSearch(""); setStatusFilter("ALL"); setAgentFilter(null); }}
                                className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filtered.map((school, index) => {
                                const cfg = STATUS[school.status] || STATUS.new;
                                return (
                                    <div key={`${school.id}-${index}`}
                                        onClick={() => navigate(`/marketing/schools/${school.id}`)}
                                        className="grid items-center px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                                        style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1fr 70px" }}>

                                        <div className="flex items-center gap-2.5 min-w-0 pr-4">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                                <Building2 size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                                    {school.school_name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 truncate">{school.contact_person1 || "—"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 pr-4">
                                            <MapPin size={11} className="text-slate-300 shrink-0" />
                                            <span className="text-xs text-slate-500 truncate">{school.city || "—"}</span>
                                        </div>

                                        <div className="pr-4">
                                            {school.interested_in ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {school.interested_in.split(',').slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                    {school.interested_in.split(',').length > 2 && (
                                                        <span className="text-[10px] text-slate-400 font-medium">+{school.interested_in.split(',').length - 2}</span>
                                                    )}
                                                </div>
                                            ) : <span className="text-xs text-slate-300">—</span>}
                                        </div>

                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={e => { e.stopPropagation(); navigate(`/marketing/schools/${school.id}`); }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                <ChevronRight size={14} />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); navigate(`/marketing/edit/${school.id}`); }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                                <Edit3 size={13} />
                                            </button>
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