import { useState, useEffect, useMemo } from "react";
import { apiGetPendingFollowUps, apiUpdateActivityStatus, apiGetMarketingSchools } from "../../utils/api";
import { 
    Calendar, Phone, CheckCircle, Clock, 
    AlertCircle, ChevronRight, User, Users,
    Search, Filter, ArrowUpRight
} from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";

export default function FollowUps() {
    const toast = useToast();
    const navigate = useNavigate();
    const [followups, setFollowups] = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchFollowUps();
    }, []);

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
        try {
            await apiUpdateActivityStatus(id, "completed");
            toast.success("Task completed");
            setFollowups(followups.filter(f => f.id !== id));
        } catch (err) {
            toast.error(err.message || "Update failed");
        }
    };

    const groupedTasks = useMemo(() => {
        const today = new Date().setHours(0,0,0,0);
        const filtered = followups.filter(f => 
            f.school_name.toLowerCase().includes(search.toLowerCase())
        );

        return {
            overdue: filtered.filter(f => new Date(f.next_followup_date) < today),
            today: filtered.filter(f => new Date(f.next_followup_date).setHours(0,0,0,0) === today),
            upcoming: filtered.filter(f => new Date(f.next_followup_date) > today)
        };
    }, [followups, search]);

    const TaskCard = ({ item, type }) => (
        <div 
            onClick={() => navigate(`/marketing/schools/${item.school_id}`)}
            className="group relative bg-white border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${
                    type === 'overdue' ? 'bg-rose-50 text-rose-600' : 
                    type === 'today' ? 'bg-amber-50 text-amber-600' : 
                    'bg-slate-50 text-slate-600'
                }`}>
                    <Calendar size={20} />
                </div>
                <button 
                    onClick={(e) => handleComplete(e, item.id)}
                    className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Mark as done"
                >
                    <CheckCircle size={20} />
                </button>
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {item.school_name}
                </h3>
                
                <div className="flex items-center gap-2 mt-1 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Clock size={12} />
                    {new Date(item.next_followup_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    {item.reminder_time && ` • ${item.reminder_time}`}
                </div>

                {item.comments && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                         <div className="flex items-start gap-3">
                            <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 leading-relaxed italic font-medium">"{item.comments}"</p>
                         </div>
                    </div>
                )}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50 mt-auto">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <User size={14} className="text-slate-300" />
                    {item.contact_person1 || "Decision Maker"}
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <Phone size={14} className="text-slate-300" />
                    {item.mobile || "No phone"}
                </div>
            </div>

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={18} className="text-indigo-600" />
            </div>
        </div>
    );

    const Section = ({ title, tasks, type, color }) => tasks.length > 0 && (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</h2>
                <span className="text-[10px] font-bold text-slate-300 ml-1">({tasks.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => <TaskCard key={task.id} item={task} type={type} />)}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-10">
                <div>
                    <h1 className="text-4xl font-light text-slate-900 tracking-tight">Active <span className="font-bold">Follow-ups</span></h1>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                            {followups.length} Tasks Pending
                        </div>
                        <span className="text-slate-200">|</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Users size={12} /> {totalLeads} Potential Leads
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by school name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-50/50 transition-all font-medium"
                        />
                    </div>
                    <button 
                        onClick={fetchFollowUps}
                        className={`p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all ${loading ? 'opacity-50' : ''}`}
                    >
                        <Clock size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Clock size={40} className="text-slate-100 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Pipeline...</p>
                </div>
            ) : followups.length === 0 ? (
                <div className="py-32 text-center bg-white border border-slate-50 rounded-[40px]">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Maximum Efficiency reached</h2>
                    <p className="text-slate-400 text-sm">Every follow-up has been addressed. Your pipeline is clean.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    <Section title="Critical / Overdue" tasks={groupedTasks.overdue} type="overdue" color="bg-rose-500" />
                    <Section title="Scheduled for Today" tasks={groupedTasks.today} type="today" color="bg-amber-500" />
                    <Section title="Future Strategy" tasks={groupedTasks.upcoming} type="upcoming" color="bg-slate-300" />
                </div>
            )}
        </div>
    );
}