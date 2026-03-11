import { useState, useEffect } from "react";
import { apiGetMarketingSchools, apiLogMarketingActivity } from "../../utils/api";
import { Calendar, Clock, MessageSquare, School, Send, ChevronLeft, CheckCircle } from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";

export default function SchoolVisits() {
    const toast = useToast();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        school_id: "",
        activity_type: "visit",
        comments: "",
        visit_date: new Date().toISOString().split('T')[0],
        next_followup_date: "",
        reminder_time: ""
    });

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const res = await apiGetMarketingSchools();
            setSchools(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.school_id) return toast.error("Please select a school");
        
        setLoading(true);
        try {
            await apiLogMarketingActivity(formData);
            toast.success("Activity logged successfully!");
            setTimeout(() => navigate('/marketing/leads'), 1500);
        } catch (err) {
            toast.error(err.message || "Failed to log visit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors">
                <ChevronLeft size={16} /> Back
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Log <span className="text-emerald-600">Interaction</span></h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-500 text-sm font-medium">Record activities & follow-ups</p>
                        <span className="text-slate-200">|</span>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <School size={12} className="text-gray-300" /> {schools.length} Total Leads
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 space-y-8">
                    {/* Target School Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-2">
                            <School size={18} className="text-indigo-600" />
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Select Target</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Target School *</label>
                                <div className="relative group">
                                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                    <select 
                                        required
                                        name="school_id"
                                        value={formData.school_id}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a school from pipeline...</option>
                                        {schools.map(s => (
                                            <option key={s.id} value={s.id}>{s.school_name} — {s.city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Activity Details */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-2">
                            <MessageSquare size={18} className="text-indigo-600" />
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Interaction Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Activity Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                    <input 
                                        name="visit_date"
                                        value={formData.visit_date}
                                        onChange={handleChange}
                                        type="date" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Activity Type</label>
                                <select 
                                    name="activity_type"
                                    value={formData.activity_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer"
                                >
                                    <option value="visit">Physical Visit</option>
                                    <option value="call">Phone Call</option>
                                    <option value="email">Email</option>
                                    <option value="demo">Demo Given</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Activity Notes / Summary</label>
                                <textarea 
                                    name="comments"
                                    value={formData.comments}
                                    onChange={handleChange}
                                    rows="4" 
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white resize-none shadow-sm leading-relaxed"
                                    placeholder="Briefly describe the outcome of this interaction..."
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Follow-up Planning */}
                    <section className="bg-amber-50/30 p-6 rounded-2xl border border-amber-100/50">
                        <div className="flex items-center gap-2 mb-6 border-b border-amber-100 pb-2">
                            <Clock size={18} className="text-amber-600" />
                            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest">Next Follow-up Plan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1.5 ml-1">Follow-up Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 group-focus-within:text-amber-600 transition-colors" size={16} />
                                    <input 
                                        name="next_followup_date"
                                        value={formData.next_followup_date}
                                        onChange={handleChange}
                                        type="date" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-100 rounded-xl text-sm font-medium outline-none focus:border-amber-400 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1.5 ml-1">Preferred Time</label>
                                <div className="relative group">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 group-focus-within:text-amber-600 transition-colors" size={16} />
                                    <input 
                                        name="reminder_time"
                                        value={formData.reminder_time}
                                        onChange={handleChange}
                                        type="time" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-100 rounded-xl text-sm font-medium outline-none focus:border-amber-400 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Setting a follow-up date will add this to your tasks list.</p>
                    <button 
                        disabled={loading}
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        {loading ? "Saving..." : (
                            <>
                                <CheckCircle size={18} /> Log Interaction
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}