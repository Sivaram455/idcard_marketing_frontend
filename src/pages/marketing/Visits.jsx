import { useState, useEffect } from "react";
import { apiGetMarketingSchools, apiLogMarketingActivity, apiGetMyMarketingActivities } from "../../utils/api";
import { 
    Calendar, Clock, MessageSquare, School, 
    CheckCircle, ChevronDown, Loader2, 
    History, MapPin, Search, Plus, 
    ChevronRight, ArrowLeft
} from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";

const inputCls = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

const Field = ({ label, children, className = "" }) => (
    <div className={className}>
        <label className={labelCls}>{label}</label>
        {children}
    </div>
);

export default function SchoolVisits() {
    const toast = useToast();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    const [formData, setFormData] = useState({
        school_id: "",
        activity_type: "visit",
        comments: "",
        visit_date: new Date().toISOString().split("T")[0],
        next_followup_date: "",
        reminder_time: "",
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qId = params.get("school_id");
        if (qId) setFormData(prev => ({ ...prev, school_id: qId }));
        
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [schoolsRes, logsRes] = await Promise.all([
                apiGetMarketingSchools(),
                apiGetMyMarketingActivities()
            ]);
            setSchools(schoolsRes.data || []);
            setRecentLogs(logsRes.data?.slice(0, 8) || []);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.school_id) return toast.error("Please select a school");
        setLoading(true);
        try {
            await apiLogMarketingActivity(formData);
            toast.success("Activity logged successfully!");
            // Refresh recent logs
            const logsRes = await apiGetMyMarketingActivities();
            setRecentLogs(logsRes.data?.slice(0, 8) || []);
            // Reset form partly
            setFormData(prev => ({
                ...prev,
                comments: "",
                next_followup_date: "",
                reminder_time: ""
            }));
            setTimeout(() => navigate("/marketing/leads"), 1000);
        } catch (err) {
            toast.error(err.message || "Failed to log visit");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-400 font-medium">
                <Loader2 size={28} className="animate-spin text-indigo-500" />
                <p className="text-sm">Loading activity board...</p>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight tracking-tight">Log Interaction</h1>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Record visits, calls, and follow-up activities</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                        
                        {/* Target School Section */}
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <School size={16} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-800">Target School</h2>
                            </div>
                            
                            <Field label="School Name *">
                                <div className="relative">
                                    <select
                                        required
                                        name="school_id"
                                        value={formData.school_id}
                                        onChange={handleChange}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">Search and select school...</option>
                                        {schools.map(s => (
                                            <option key={s.id} value={s.id}>{s.school_name} — {s.city}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </Field>
                        </div>

                        {/* Activity Details Section */}
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <MessageSquare size={16} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-800">Interaction Details</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Activity Date">
                                    <input
                                        name="visit_date"
                                        value={formData.visit_date}
                                        onChange={handleChange}
                                        type="date"
                                        className={inputCls}
                                    />
                                </Field>

                                <Field label="Type of Interaction">
                                    <div className="relative">
                                        <select
                                            name="activity_type"
                                            value={formData.activity_type}
                                            onChange={handleChange}
                                            className={`${inputCls} appearance-none pr-10`}
                                        >
                                            <option value="visit">Physical Visit</option>
                                            <option value="call">Phone Call</option>
                                            <option value="email">Email / Message</option>
                                            <option value="demo">Demo Given</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </Field>

                                <Field label="Summary & Outcome" className="md:col-span-2">
                                    <textarea
                                        name="comments"
                                        value={formData.comments}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="What was discussed? Any specific requirements..."
                                        className={`${inputCls} resize-none leading-relaxed text-sm`}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Next Action Section */}
                        <div className="px-6 py-5 bg-amber-50/30 border-t border-amber-100/50">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                                    <Calendar size={16} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-800">Plan Next Action <span className="text-[10px] text-amber-500 font-medium ml-1 bg-white px-1.5 py-0.5 rounded-md border border-amber-100">OPTIONAL</span></h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Follow-up Date">
                                    <input
                                        name="next_followup_date"
                                        value={formData.next_followup_date}
                                        onChange={handleChange}
                                        type="date"
                                        className={`${inputCls} bg-white`}
                                    />
                                </Field>
                                <Field label="Preferred Time">
                                    <input
                                        name="reminder_time"
                                        value={formData.reminder_time}
                                        onChange={handleChange}
                                        type="time"
                                        className={`${inputCls} bg-white`}
                                    />
                                </Field>
                            </div>
                            <p className="text-[10px] text-amber-600/70 mt-3 font-medium">Setting a date will automatically add this to your follow-ups calendar.</p>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-4 bg-gray-50/50">
                            <button 
                                type="button" 
                                onClick={() => navigate(-1)}
                                className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 size={16} className="animate-spin" /> saving log...</>
                                ) : (
                                    <><CheckCircle size={16} /> Save Interaction</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: History */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <History size={16} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-800">Your Recent Logs</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                            {recentLogs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                                    <History size={32} strokeWidth={1} />
                                    <p className="text-xs font-medium tracking-tight">No activities recorded yet</p>
                                </div>
                            ) : (
                                recentLogs.map(log => (
                                    <div 
                                        key={log.id} 
                                        onClick={() => navigate(`/marketing/schools/${log.school_id}`)}
                                        className="p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 border border-transparent transition-all cursor-pointer group"
                                    >
                                        <p className="text-xs font-bold text-gray-900 mb-1 group-hover:text-indigo-600 truncate">{log.school_name}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                            <span className="flex items-center gap-1 capitalize">
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    log.activity_type === 'visit' ? 'bg-emerald-500' : 
                                                    log.activity_type === 'call' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`} />
                                                {log.activity_type}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(log.visit_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                            {log.comments || "No notes provided."}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <button 
                                onClick={() => navigate("/marketing/leads")}
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                            >
                                View Pipeline <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}