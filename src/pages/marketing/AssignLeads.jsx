import { useState, useEffect } from "react";
import { apiGetMarketingSchools, apiGetUsers, apiLogMarketingActivity } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { UserPlus, School, User, Calendar, CheckCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssignLeads() {
    const toast = useToast();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        school_id: "",
        agent_id: "",
        assigned_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schoolsRes, usersRes] = await Promise.all([
                apiGetMarketingSchools(),
                apiGetUsers()
            ]);
            setSchools(schoolsRes.data || []);
            setAgents(usersRes.data?.filter(u => u.role === 'agent') || []);
        } catch (err) {
            toast.error("Failed to load data");
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if(!formData.school_id || !formData.agent_id) return toast.error("Select both school and agent");

        setLoading(true);
        try {
            await apiAssignSchool(formData);
            toast.success("Lead assigned successfully!");
            setFormData({ ...formData, school_id: "" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <button onClick={() => navigate(-1)} className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Lead Assignment</h1>
                    <p className="text-sm text-gray-500 mt-1">Assign schools to marketing agents for follow-up</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <form onSubmit={handleAssign} className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Select School</label>
                            <div className="relative">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <select 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                                    value={formData.school_id}
                                    onChange={e => setFormData({...formData, school_id: e.target.value})}
                                    required
                                >
                                    <option value="">Choose a school...</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>{s.school_name} ({s.city})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Assign To Agent</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <select 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                                    value={formData.agent_id}
                                    onChange={e => setFormData({...formData, agent_id: e.target.value})}
                                    required
                                >
                                    <option value="">Choose an agent...</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Assignment Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input 
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    value={formData.assigned_date}
                                    onChange={e => setFormData({...formData, assigned_date: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            disabled={loading}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Assigning..." : <><UserPlus size={18} /> Confirm Assignment</>}
                        </button>
                    </div>
                </form>

                <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                        <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-2 text-sm">
                            <CheckCircle size={16} /> Quick Tips
                        </h3>
                        <p className="text-indigo-700 text-xs leading-relaxed">
                            Assigning a lead locks it to an agent's pipeline. Only they can log visits and follow-ups for this school.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Unassigned Leads</h3>
                        <div className="space-y-3">
                            {schools.slice(0, 5).map(s => (
                                <div key={s.id} className="text-xs font-semibold text-gray-600 border-b border-gray-50 pb-2 flex justify-between">
                                    <span>{s.school_name}</span>
                                    <span className="text-gray-300 font-normal">{s.city}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
