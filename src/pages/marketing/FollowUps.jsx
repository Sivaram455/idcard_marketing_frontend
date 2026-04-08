import { useState, useEffect, useMemo } from "react";
import { apiGetPendingFollowUps, apiUpdateActivityStatus, apiGetMarketingSchools } from "../../utils/api";
import {
    Calendar, Phone, CheckCircle, Clock,
    AlertCircle, ChevronRight, User, Users,
    Search, Loader2, RefreshCw, Filter,
    Building2, MessageSquare, ArrowLeft
} from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";

const TYPE_META = {
    overdue:  { label: "Overdue",   dot: "bg-rose-500",   badge: "bg-rose-50 text-rose-600 border-rose-100"    },
    today:    { label: "Due Today", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600 border-amber-100" },
    upcoming: { label: "Upcoming",  dot: "bg-indigo-300", badge: "bg-indigo-50 text-indigo-500 border-indigo-100"  },
};

export default function FollowUps() {
    const toast = useToast();
    const navigate = useNavigate();
    const [followups, setFollowups] = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
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
            toast.success("Task marked as completed");
            setFollowups(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            toast.error(err.message || "Failed to update task");
        } finally {
            setCompleting(null);
        }
    };

    const grouped = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const q = search.toLowerCase();
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
        return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    };

    const Row = ({ item, type }) => {
        const meta = TYPE_META[type];
        const busy = completing === item.id;
        return (
            <div
                onClick={() => navigate(`/marketing/schools/${item.school_id}`)}
                className="grid items-center px-6 py-3 hover:bg-indigo-50/30 cursor-pointer transition-all border-b border-gray-50 last:border-0 group"
                style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 40px" }}
            >
                {/* School */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 truncate transition-colors">
                            {item.school_name}
                        </p>
                        {item.comments && (
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.comments}</p>
                        )}
                    </div>
                </div>

                {/* Due date */}
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Calendar size={13} className="text-gray-300 shrink-0" />
                    <span>{fmtDate(item.next_followup_date)}</span>
                    {item.reminder_time && <span className="text-gray-300 ml-1">@ {item.reminder_time}</span>}
                </div>

                {/* Contact */}
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium min-w-0">
                    <User size={13} className="text-gray-300 shrink-0" />
                    <span className="truncate">{item.contact_person1 || "—"}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Phone size={13} className="text-gray-300 shrink-0" />
                    <span className="tabular-nums">{item.mobile || "—"}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end">
                    <button
                        onClick={(e) => handleComplete(e, item.id)}
                        disabled={busy}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-300 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                    </button>
                </div>
            </div>
        );
    };

    const Section = ({ title, tasks, type }) => {
        if (!tasks.length) return null;
        const meta = TYPE_META[type];
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6 last:mb-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-4 rounded-full ${meta.dot}`} />
                        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tasks.length} Pending</span>
                </div>
                
                {/* Column Headers */}
                <div
                    className="grid px-6 py-2.5 bg-white border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 40px" }}
                >
                    <span>School Name</span>
                    <span>Due Date</span>
                    <span>Liaison / Contact</span>
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
        <div className="p-5 max-w-6xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Follow-up Pipeline</h1>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Manage your scheduled interactions and tasks</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by school name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm w-64"
                        />
                    </div>
                    <button
                        onClick={fetchFollowUps}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-indigo-600 transition-all shadow-sm shrink-0"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Overdue Tasks", value: stats.overdue, meta: TYPE_META.overdue, icon: AlertCircle },
                    { label: "Due Today", value: stats.today, meta: TYPE_META.today, icon: Clock },
                    { label: "Upcoming Plans", value: stats.upcoming, meta: TYPE_META.upcoming, icon: Calendar },
                ].map((s, i) => (
                    <div key={i} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex items-center justify-between ${s.value > 0 ? 'border-indigo-100' : 'border-gray-100'}`}>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${s.meta.badge} border-none`}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tasks Lists */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-medium">Synchronizing your follow-up list...</p>
                    </div>
                ) : followups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm text-center px-10">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/5">
                            <CheckCircle size={40} className="text-emerald-500" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
                        <p className="text-sm text-gray-400 font-medium mt-2 max-w-xs">You don't have any pending follow-ups. Good job keeping the pipeline clear.</p>
                        <button 
                            onClick={() => navigate("/marketing/visits")}
                            className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100"
                        >
                            <Plus size={16} /> Log New Interaction
                        </button>
                    </div>
                ) : totalShown === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-300">
                        <Search size={32} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">No follow-ups match your search</p>
                        <button onClick={() => setSearch("")} className="mt-3 text-xs font-bold text-indigo-600 hover:underline">Clear Search Filter</button>
                    </div>
                ) : (
                    <div>
                        <Section title="Critical / Overdue" tasks={grouped.overdue}  type="overdue"  />
                        <Section title="Priority / Today"   tasks={grouped.today}    type="today"    />
                        <Section title="Upcoming Schedule"  tasks={grouped.upcoming} type="upcoming" />
                    </div>
                )}
            </div>
        </div>
    );
}