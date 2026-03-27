import { useState, useEffect, useMemo } from "react";
import { apiGetMarketingSchools, apiGetUsers, apiAssignSchool } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { 
    UserPlus, School, User, Calendar, 
    CheckCircle, ChevronLeft, ChevronDown, 
    Loader2, Users, Info, Building2, Search,
    Briefcase, Target, Shield, ArrowRight, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dense UI Constants
const inputCls = "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200";
const labelCls = "block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-0.5 font-outfit";

const Field = ({ label, children }) => (
    <div className="space-y-0.5">
        <label className={labelCls}>{label}</label>
        {children}
    </div>
);

export default function AssignLeads() {
    const toast = useToast();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        school_id: "",
        agent_id: "",
        assigned_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [schoolsRes, usersRes] = await Promise.all([
                apiGetMarketingSchools(),
                apiGetUsers()
            ]);
            // Only show schools that haven't been assigned yet for the selection
            setSchools(schoolsRes.data || []);
            // Filter only agent/marketing roles
            const filteredAgents = usersRes.data?.filter(u => 
                ['AGENT', 'agent', 'marketing', 'MARKETING', 'GMMC_ADMIN'].includes(u.role)
            ) || [];
            setAgents(filteredAgents);
        } catch (err) {
            toast.error("Network synchronization error");
        } finally {
            setFetching(false);
        }
    };

    const handleAssign = async (e) => {
        if (e) e.preventDefault();
        if(!formData.school_id || !formData.agent_id) return toast.error("Operational target required");

        setLoading(true);
        try {
            await apiAssignSchool(formData);
            toast.success("Lead successfully deployed");
            setFormData(prev => ({ ...prev, school_id: "" }));
            fetchData();
        } catch (err) {
            toast.error(err.message || "Deployment failed");
        } finally {
            setLoading(false);
        }
    };

    const unassignedSchools = useMemo(() => 
        schools.filter(s => !s.assigned_to).sort((a, b) => a.school_name.localeCompare(b.school_name)), 
    [schools]);

    const filteredPool = useMemo(() => 
        unassignedSchools.filter(s => 
            s.school_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.city?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [unassignedSchools, searchTerm]);

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <div className="relative mb-4">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                    <Target size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse font-outfit">Syncing Network Data...</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Header Section */}
            <div className="flex items-end justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Shield size={12} className="text-indigo-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Operations Control</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
                            Lead <span className="text-indigo-600">Assignment</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Pending Pool</span>
                            <span className="text-sm font-black text-indigo-600 leading-none mt-1 italic">{unassignedSchools.length}</span>
                        </div>
                        <div className="w-px h-6 bg-slate-100" />
                        <Users size={16} className="text-slate-300" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Deployment Command Form */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-5">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden border-b-2 border-b-indigo-500/20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                    <UserPlus size={14} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Delegation Command</h3>
                            </div>

                            <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                                <div className="md:col-span-2">
                                    <Field label="School Selection (Unassigned Pool)">
                                        <div className="relative group">
                                            <select 
                                                className={`${inputCls} appearance-none pr-12`}
                                                value={formData.school_id}
                                                onChange={e => setFormData({...formData, school_id: e.target.value})}
                                                required
                                            >
                                                <option value="" className="text-slate-400">Initialize school search...</option>
                                                {unassignedSchools.map(s => (
                                                    <option key={s.id} value={s.id} className="font-bold py-2">
                                                        {s.school_name} &mdash; {s.city || 'Regional'}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 transition-colors pointer-events-none">
                                                <School size={18} />
                                            </div>
                                        </div>
                                    </Field>
                                </div>

                                <Field label="Operational Agent">
                                    <div className="relative group">
                                        <select 
                                            className={`${inputCls} appearance-none pr-12`}
                                            value={formData.agent_id}
                                            onChange={e => setFormData({...formData, agent_id: e.target.value})}
                                            required
                                        >
                                            <option value="">Select active agent...</option>
                                            {agents.map(a => (
                                                <option key={a.id} value={a.id} className="font-bold">
                                                    {a.full_name} &bull; {a.role.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 transition-colors pointer-events-none">
                                            <Briefcase size={18} />
                                        </div>
                                    </div>
                                </Field>

                                <Field label="Deployment Date">
                                    <div className="relative group">
                                        <input 
                                            type="date"
                                            className={`${inputCls} pr-12 uppercase`}
                                            value={formData.assigned_date}
                                            onChange={e => setFormData({...formData, assigned_date: e.target.value})}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 transition-colors pointer-events-none">
                                            <Calendar size={18} />
                                        </div>
                                    </div>
                                </Field>

                                <div className="md:col-span-2 pt-4">
                                    <button 
                                        disabled={loading || !formData.school_id || !formData.agent_id}
                                        type="submit"
                                        className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black uppercase tracking-widest italic py-4 rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-indigo-500/20 transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Initializing Deployment...</>
                                        ) : (
                                            <><CheckCircle size={16} strokeWidth={3} /> Execute Assignment</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Regional Pool Monitor */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-full max-h-[600px]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Regional Monitor</h4>
                                {searchTerm && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{filteredPool.length} Match</span>}
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="SEARCH POOL..."
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-10 text-[11px] font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {filteredPool.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center opacity-20 italic">
                                    <Building2 size={32} className="mb-3" strokeWidth={1.5} />
                                    <p className="text-[11px] font-black uppercase tracking-widest">Pool Clear</p>
                                </div>
                            ) : (
                                filteredPool.map(s => (
                                    <div 
                                        key={s.id} 
                                        onClick={() => setFormData(prev => ({ ...prev, school_id: s.id }))}
                                        className={`group cursor-pointer p-4 rounded-[20px] transition-all duration-300 flex items-center justify-between
                                                  ${formData.school_id === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
                                    >
                                        <div className="min-w-0 pr-4">
                                            <p className={`text-[11px] font-black uppercase tracking-tight italic truncate transition-colors ${formData.school_id === s.id ? 'text-white' : 'text-slate-800'}`}>
                                                {s.school_name}
                                            </p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${formData.school_id === s.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                {s.city || 'Regional'}
                                            </p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${formData.school_id === s.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-100'}`}>
                                            <ArrowRight size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-indigo-500/20">
                                <Info size={14} strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">Protocol Info</p>
                                <p className="text-[10px] text-indigo-700/70 font-bold uppercase tracking-tight leading-relaxed mt-1">
                                    Assigned leads are exclusive to agents for 90 days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Operational Intelligence - Agent Stats */}
            <div className="mt-10 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                        <TrendingUp size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic leading-none">Intelligence Report</span>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight italic mt-0.5">Agent Operational Progress</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {agents.map(agent => {
                        const assignedLeads = schools.filter(s => s.assigned_to === agent.id).length;
                        const percentage = Math.min((assignedLeads / 10) * 100, 100); // Sample goal of 10
                        
                        return (
                            <div key={agent.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 font-black text-[10px] uppercase">
                                            {agent.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight italic truncate max-w-[100px] leading-none">
                                                {agent.full_name}
                                            </p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">
                                                Active Force
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-indigo-600 italic leading-none">{assignedLeads}</span>
                                        <p className="text-[8px] font-black text-slate-300 uppercase leading-none mt-1">Leads</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 tracking-widest">
                                        <span>Quota Utilization</span>
                                        <span className={percentage > 80 ? 'text-emerald-500' : 'text-slate-400'}>{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${percentage > 80 ? 'bg-emerald-500' : percentage > 40 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

