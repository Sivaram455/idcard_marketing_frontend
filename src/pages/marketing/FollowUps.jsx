import { useState, useEffect, useMemo } from "react";
import { apiGetPendingFollowUps, apiUpdateActivityStatus, apiGetMarketingSchools } from "../../utils/api";
import {
    Calendar, Phone, CheckCircle, Clock,
    AlertCircle, ChevronRight, User, Users,
    Search, Loader2, RefreshCw
} from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";

const TYPE_META = {
    overdue:  { label: "Critical / Overdue",   dot: "bg-rose-500",   badge: "bg-rose-50 text-rose-600 border-rose-100"    },
    today:    { label: "Due Today",          dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600 border-amber-100" },
    upcoming: { label: "Upcoming / Planned",  dot: "bg-slate-300", badge: "bg-slate-50 text-slate-500 border-slate-100"  },
};

export default function FollowUps() {
    const toast    = useToast();
    const navigate = useNavigate();
    const [followups, setFollowups]   = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState("");
    const [completing, setCompleting] = useState(null);

    const stats = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        return {
            overdue:  followups.filter(f => new Date(f.next_followup_date).getTime() < today).length,
            today:    followups.filter(f => new Date(f.next_followup_date).setHours(0,0,0,0) === today).length,
            upcoming: followups.filter(f => new Date(f.next_followup_date).getTime() > today).length,
        };
    }, [followups]);

    useEffect(() => { fetchFollowUps(); }, []);

    const fetchFollowUps = async () => {
        setLoading(true);
        try {
            const [fuRes, schoolsRes] = await Promise.all([
                apiGetPendingFollowUps(),
                apiGetMarketingSchools()
            ]);
            setFollowups(fuRes.data || []);
            setTotalLeads(schoolsRes.data?.length || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setCompleting(id);
        try {
            await apiUpdateActivityStatus(id, "completed");
            toast.success("Marked as completed");
            setFollowups(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            toast.error(err.message || "Update failed");
        } finally {
            setCompleting(null);
        }
    };

    const grouped = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const q     = search.toLowerCase();
        const filtered = followups.filter(f =>
            f.school_name?.toLowerCase().includes(q)
        );
        return {
            overdue:  filtered.filter(f => {
                const d = new Date(f.next_followup_date);
                return d.getTime() < today;
            }),
            today:    filtered.filter(f => {
                const d = new Date(f.next_followup_date);
                return d.setHours(0,0,0,0) === today;
            }),
            upcoming: filtered.filter(f => {
                const d = new Date(f.next_followup_date);
                return d.getTime() > today;
            }),
        };
    }, [followups, search]);

    const fmtDate = (d) => {
        if (!d) return "—";
        const dt = new Date(d);
        return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
    };

    const Row = ({ item, type }) => {
        const meta = TYPE_META[type];
        const busy = completing === item.id;
        return (
            <div
                onClick={() => navigate(`/marketing/schools/${item.school_id}`)}
                className="grid items-center px-4 py-2 hover:bg-slate-50 cursor-pointer transition-all group"
                style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}
            >
                {/* School */}
                <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-1 h-1 rounded-full shrink-0 ${meta.dot}`} />
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-900 group-hover:text-indigo-600 truncate transition-colors uppercase italic leading-none">
                            {item.school_name}
                        </p>
                        {item.comments && (
                            <p className="text-[7px] font-bold text-slate-400 truncate italic mt-1 uppercase tracking-tighter">"{item.comments}"</p>
                        )}
                    </div>
                </div>

                {/* Due date */}
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase italic">
                    <Calendar size={10} className="text-slate-300 shrink-0" />
                    {fmtDate(item.next_followup_date)}
                    {item.reminder_time && <span className="text-slate-200">/ {item.reminder_time}</span>}
                </div>

                {/* Contact */}
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase italic min-w-0">
                    <User size={10} className="text-slate-300 shrink-0" />
                    <span className="truncate">{item.contact_person1 || "—"}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase italic">
                    <Phone size={10} className="text-slate-300 shrink-0" />
                    {item.mobile || "—"}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => handleComplete(e, item.id)}
                        disabled={busy}
                        title="Mark as done"
                        className="p-1.5 rounded bg-white border border-slate-100 text-slate-200 hover:text-emerald-600 hover:border-emerald-100 transition-all disabled:opacity-50"
                    >
                        {busy
                            ? <Loader2 size={11} className="animate-spin" />
                            : <CheckCircle size={11} />
                        }
                    </button>
                    <ChevronRight size={12} className="text-slate-200 group-hover:text-indigo-400 transition-all" />
                </div>
            </div>
        );
    };

    const Section = ({ title, tasks, type }) => {
        if (!tasks.length) return null;
        const meta = TYPE_META[type];
        return (
            <div className="border-b border-slate-50 last:border-0">
                {/* Section header */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50/50 border-y border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{title}</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border ${meta.badge} italic`}>{tasks.length} SYNCED</span>
                </div>
                {/* Column headers (only for first section) */}
                <div
                    className="grid px-4 py-1 text-[7px] font-black text-slate-300 uppercase tracking-widest bg-white"
                    style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}
                >
                    <span>Node Identity</span>
                    <span>Due Protocol</span>
                    <span>Liaison</span>
                    <span>Direct Sync</span>
                    <span />
                </div>
                <div className="divide-y divide-slate-50">
                    {tasks.map(task => <Row key={task.id} item={task} type={type} />)}
                </div>
            </div>
        );
    };

    const totalShown = grouped.overdue.length + grouped.today.length + grouped.upcoming.length;

    return (
        <div className="p-4 space-y-4 min-h-screen bg-white">

            {/* ── Page Heading ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight italic uppercase leading-none">Pipeline <span className="text-indigo-600">Follow-ups</span></h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic opacity-60 flex items-center gap-1">
                            <Users size={10} /> {totalLeads} Total Lead Nodes
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH NODES..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-lg pl-8 pr-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-900 placeholder-slate-300 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner w-56"
                        />
                    </div>
                    <button
                        onClick={fetchFollowUps}
                        disabled={loading}
                        className="p-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 disabled:opacity-40 transition-all"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* ── Stats Pipeline ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Overdue", value: stats.overdue, meta: TYPE_META.overdue },
                    { label: "Due Today", value: stats.today, meta: TYPE_META.today },
                    { label: "Upcoming", value: stats.upcoming, meta: TYPE_META.upcoming },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl border p-3 transition-all ${s.value > 0 ? `${s.meta.badge} border-opacity-50` : 'bg-slate-50/50 border-slate-100 opacity-40'}`}>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] italic mb-1">{s.label}</p>
                        <p className="text-xl font-black italic leading-none">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Content Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                        <Loader2 size={24} className="animate-spin mb-3" />
                        <p className="text-[9px] font-black uppercase tracking-widest italic animate-pulse">Synchronizing Follow-up Stream...</p>
                    </div>
                ) : followups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-10">
                        <div className="w-16 h-16 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-4 shadow-xl shadow-emerald-900/5">
                            <CheckCircle size={32} className="text-emerald-500" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 italic uppercase">Registry Clear</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">All active follow-ups have been processed.</p>
                    </div>
                ) : totalShown === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                        <AlertCircle size={32} strokeWidth={1} className="mb-4 opacity-10" />
                        <p className="text-[9px] font-black uppercase tracking-widest italic">Zero matches for search criteria</p>
                        <button onClick={() => setSearch("")} className="mt-3 text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:underline">Reset Buffer</button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        <Section title="Overdue Intelligence" tasks={grouped.overdue}  type="overdue"  />
                        <Section title="Immediate Sync"      tasks={grouped.today}    type="today"    />
                        <Section title="Future Pipeline"     tasks={grouped.upcoming} type="upcoming" />
                    </div>
                )}
            </div>
        </div>
    );
}