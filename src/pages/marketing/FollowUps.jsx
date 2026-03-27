import { useState, useEffect, useMemo } from "react";
import { apiGetPendingFollowUps, apiUpdateActivityStatus, apiGetMarketingSchools } from "../../utils/api";
import {
    Calendar, Phone, CheckCircle, Clock,
    AlertCircle, ChevronRight, User, Users,
    Search, Loader2
} from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";

const TYPE_META = {
    overdue:  { label: "Overdue",       dot: "bg-red-500",   badge: "bg-red-50 text-red-600 border-red-200"    },
    today:    { label: "Due Today",      dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600 border-amber-200" },
    upcoming: { label: "Upcoming",       dot: "bg-gray-300",  badge: "bg-gray-100 text-gray-500 border-gray-200"  },
};

export default function FollowUps() {
    const toast    = useToast();
    const navigate = useNavigate();
    const [followups, setFollowups]   = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState("");
    const [completing, setCompleting] = useState(null);

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
            overdue:  filtered.filter(f => new Date(f.next_followup_date) < today),
            today:    filtered.filter(f => new Date(f.next_followup_date).setHours(0,0,0,0) === today),
            upcoming: filtered.filter(f => new Date(f.next_followup_date) > today),
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
                className="grid items-center px-4 py-2.5 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr auto" }}
            >
                {/* School */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-700 truncate transition-colors">
                            {item.school_name}
                        </p>
                        {item.comments && (
                            <p className="text-[10px] text-gray-400 truncate italic max-w-xs">"{item.comments}"</p>
                        )}
                    </div>
                </div>

                {/* Due date */}
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
                    <Calendar size={10} className="text-gray-400 shrink-0" />
                    {fmtDate(item.next_followup_date)}
                    {item.reminder_time && <span className="text-gray-300">· {item.reminder_time}</span>}
                </div>

                {/* Contact */}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium min-w-0">
                    <User size={10} className="text-gray-400 shrink-0" />
                    <span className="truncate">{item.contact_person1 || "—"}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <Phone size={10} className="text-gray-400 shrink-0" />
                    {item.mobile || "—"}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => handleComplete(e, item.id)}
                        disabled={busy}
                        title="Mark as done"
                        className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                    >
                        {busy
                            ? <Loader2 size={13} className="animate-spin" />
                            : <CheckCircle size={13} />
                        }
                    </button>
                    <ChevronRight size={13} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
            </div>
        );
    };

    const Section = ({ title, tasks, type }) => {
        if (!tasks.length) return null;
        const meta = TYPE_META[type];
        return (
            <div>
                {/* Section header */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-y border-gray-100">
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{title}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${meta.badge}`}>{tasks.length}</span>
                </div>
                {/* Column headers (only for first section) */}
                <div
                    className="grid px-4 py-1.5 text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50"
                    style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr auto" }}
                >
                    <span>School</span>
                    <span>Due Date</span>
                    <span>Contact</span>
                    <span>Phone</span>
                    <span />
                </div>
                <div className="divide-y divide-gray-50">
                    {tasks.map(task => <Row key={task.id} item={task} type={type} />)}
                </div>
            </div>
        );
    };

    const totalShown = grouped.overdue.length + grouped.today.length + grouped.upcoming.length;

    return (
        <div className="p-5 space-y-4">

            {/* ── Page Heading ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Active Follow-ups</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                            {followups.length} pending
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                            <Users size={10} /> {totalLeads} total leads
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search school..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 transition-all shadow-sm w-52"
                        />
                    </div>
                    <button
                        onClick={fetchFollowUps}
                        disabled={loading}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition-all shadow-sm"
                    >
                        <Clock size={13} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* ── Content Card ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Loader2 size={22} className="animate-spin mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">Loading follow-ups...</p>
                    </div>
                ) : followups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle size={22} className="text-emerald-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-700">All caught up!</p>
                        <p className="text-xs text-gray-400 mt-0.5">No pending follow-ups. Your pipeline is clean.</p>
                    </div>
                ) : totalShown === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <AlertCircle size={22} strokeWidth={1.5} className="mb-2 opacity-40" />
                        <p className="text-sm font-medium text-gray-500">No results for "{search}"</p>
                        <button onClick={() => setSearch("")} className="mt-2 text-xs text-indigo-600 font-bold hover:underline">Clear search</button>
                    </div>
                ) : (
                    <div>
                        <Section title="Overdue"        tasks={grouped.overdue}  type="overdue"  />
                        <Section title="Due Today"      tasks={grouped.today}    type="today"    />
                        <Section title="Upcoming"       tasks={grouped.upcoming} type="upcoming" />
                    </div>
                )}
            </div>
        </div>
    );
}