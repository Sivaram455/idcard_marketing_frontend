import { useState, useEffect } from "react";
import { apiGetMarketingSchools, apiLogMarketingActivity } from "../../utils/api";
import { Calendar, Clock, MessageSquare, School, CheckCircle, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";

const inputCls = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-all";
const labelCls = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1";

const Field = ({ label, children }) => (
    <div>
        <label className={labelCls}>{label}</label>
        {children}
    </div>
);

export default function SchoolVisits() {
    const toast    = useToast();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        school_id:          "",
        activity_type:      "visit",
        comments:           "",
        visit_date:         new Date().toISOString().split("T")[0],
        next_followup_date: "",
        reminder_time:      "",
    });

    useEffect(() => { 
        fetchSchools(); 
        const params = new URLSearchParams(window.location.search);
        const qId = params.get("school_id");
        if (qId) setFormData(prev => ({ ...prev, school_id: qId }));
    }, []);

    const fetchSchools = async () => {
        try {
            const res = await apiGetMarketingSchools();
            setSchools(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const set = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.school_id) return toast.error("Please select a school");
        setLoading(true);
        try {
            await apiLogMarketingActivity(formData);
            toast.success("Activity logged successfully!");
            setTimeout(() => navigate("/marketing/leads"), 1500);
        } catch (err) {
            toast.error(err.message || "Failed to log visit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 max-w-2xl">

            {/* ── Heading ── */}
            <div className="mb-5">
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Log Interaction</h1>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                    Record a visit, call or follow-up · {schools.length} schools in pipeline
                </p>
            </div>

            {/* ── Form Card ── */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                {/* ── Section: Target ── */}
                <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                        <School size={10} /> Target School
                    </p>
                    <div className="relative">
                        <select
                            required
                            name="school_id"
                            value={formData.school_id}
                            onChange={set}
                            className={`${inputCls} appearance-none pr-8`}
                        >
                            <option value="">Select a school...</option>
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.school_name} — {s.city}</option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* ── Section: Interaction Details ── */}
                <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                        <MessageSquare size={10} /> Interaction Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Activity Date">
                            <input
                                name="visit_date"
                                value={formData.visit_date}
                                onChange={set}
                                type="date"
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Activity Type">
                            <div className="relative">
                                <select
                                    name="activity_type"
                                    value={formData.activity_type}
                                    onChange={set}
                                    className={`${inputCls} appearance-none pr-8`}
                                >
                                    <option value="visit">Physical Visit</option>
                                    <option value="call">Phone Call</option>
                                    <option value="email">Email</option>
                                    <option value="demo">Demo Given</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </Field>

                        <div className="col-span-2">
                            <Field label="Notes / Summary">
                                <textarea
                                    name="comments"
                                    value={formData.comments}
                                    onChange={set}
                                    rows={3}
                                    placeholder="Briefly describe the outcome of this interaction..."
                                    className={`${inputCls} resize-none leading-relaxed`}
                                />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ── Section: Follow-up ── */}
                <div className="px-5 py-4 bg-amber-50/40 border-b border-amber-100/60">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                        <Clock size={10} /> Next Follow-up <span className="text-amber-400 font-medium normal-case tracking-normal">(optional)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Follow-up Date">
                            <input
                                name="next_followup_date"
                                value={formData.next_followup_date}
                                onChange={set}
                                type="date"
                                className="w-full px-3 py-2 bg-white border border-amber-100 rounded-lg text-xs font-medium text-gray-800 outline-none focus:border-amber-400 transition-all"
                            />
                        </Field>
                        <Field label="Preferred Time">
                            <input
                                name="reminder_time"
                                value={formData.reminder_time}
                                onChange={set}
                                type="time"
                                className="w-full px-3 py-2 bg-white border border-amber-100 rounded-lg text-xs font-medium text-gray-800 outline-none focus:border-amber-400 transition-all"
                            />
                        </Field>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-3.5 flex items-center justify-between gap-4 bg-gray-50/60">
                    <p className="text-[10px] text-gray-400">
                        Setting a follow-up date adds this to your tasks list.
                    </p>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-100 disabled:opacity-50 shrink-0"
                    >
                        {loading
                            ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                            : <><CheckCircle size={13} /> Log Interaction</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}