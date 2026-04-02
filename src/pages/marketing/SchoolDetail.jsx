import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiGetMarketingSchoolDetail, apiUpdateMarketingSchool } from "../../utils/api";
import { 
    Phone, Mail, MapPin, User, Calendar, 
    MessageSquare, ChevronLeft, CheckCircle, 
    History, TrendingUp, Info, Edit3, Loader2, Target,
    Clock, Building2, ExternalLink
} from "lucide-react";
import { useToast } from "../../components/common/Toast";

const STATUS_COLORS = {
    new:      "bg-blue-50 text-blue-700 border-blue-200 dot-blue-500",
    visited:  "bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500",
    followup: "bg-amber-50 text-amber-700 border-amber-200 dot-amber-500",
    closed:   "bg-indigo-50 text-indigo-700 border-indigo-200 dot-indigo-500",
};

export default function SchoolDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [school, setSchool] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const res = await apiGetMarketingSchoolDetail(id);
            if (res.data) {
                setSchool(res.data);
                setActivities(res.data.activities || []);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load school profile");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === school.status) return;
        setUpdatingStatus(true);
        try {
            await apiUpdateMarketingSchool(school.id, { ...school, status: newStatus });
            setSchool(prev => ({ ...prev, status: newStatus }));
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Profile...</p>
        </div>
    );

    if (!school) return (
        <div className="p-8 text-center max-w-sm mx-auto mt-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Building2 size={32} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">School profile not found</h2>
            <p className="text-sm text-gray-500 mb-6">The record you are looking for may have been removed or moved.</p>
            <button onClick={() => navigate('/marketing/leads')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-soft">
                Return to Pipeline
            </button>
        </div>
    );

    const initials = school.school_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "S";

    return (
        <div className="p-5 space-y-5 animate-in fade-in duration-500 pb-12">
            
            {/* ── Heading / Profile Summary ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <button 
                        onClick={() => navigate('/marketing/leads')} 
                        className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-gray-100 rounded-lg transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">
                        {initials}
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none uppercase">
                                {school.school_name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                <MapPin size={12} className="text-gray-300" /> {school.city || 'No City'}, {school.state || 'No State'}
                            </span>
                            <span className="text-gray-200 select-none">|</span>
                            {updatingStatus ? (
                                <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                                    <Loader2 size={10} className="animate-spin" /> Updating...
                                </div>
                            ) : (
                                <select 
                                    value={school.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 outline-none cursor-pointer border-b border-transparent hover:border-indigo-100 transition-all"
                                >
                                    <option value="new">New Lead</option>
                                    <option value="visited">Visited</option>
                                    <option value="followup">Follow-up</option>
                                    <option value="closed">Closed / Signed</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <button 
                        onClick={() => navigate(`/marketing/edit/${school.id}`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-600 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-bold transition-all hover:border-indigo-100 shadow-sm"
                    >
                        <Edit3 size={13} /> Edit Profile
                    </button>
                    <button 
                        onClick={() => navigate(`/marketing/visits?school_id=${school.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-100"
                    >
                        <MessageSquare size={13} /> Log Interaction
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* ── Contact Details Sidebar ── */}
                <div className="space-y-5 lg:col-span-1">
                    
                    {/* Primary Info Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                             <Info size={14} className="text-indigo-600" />
                             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">School Metadata</h3>
                        </div>
                        
                        <div className="p-5 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contacts</p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                                                <User size={13} className="text-gray-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-800 truncate">{school.contact_person1 || 'Not Set'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Primary Contact</p>
                                            </div>
                                        </div>
                                        
                                        {school.contact_person2 && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                                                    <User size={13} className="text-gray-300" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{school.contact_person2}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">Sec. Contact</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <Phone size={13} className="text-indigo-400 shrink-0" />
                                        <p className="text-xs font-semibold text-gray-700">{school.mobile || 'No Phone'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail size={13} className="text-indigo-400 shrink-0" />
                                        <p className="text-xs font-semibold text-gray-700 truncate">{school.email || 'No Email'}</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed italic">{school.address || 'No physical address provided'}</p>
                                    </div>
                                    
                                    {school.interested_in && (
                                        <div className="pt-3 border-t border-indigo-50 mt-3 space-y-2">
                                            <div className="flex items-center gap-1.5">
                                                <Target size={11} className="text-indigo-500" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Module Interests</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {school.interested_in.split(',').map((interest, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-tight rounded-md border border-indigo-100">
                                                        {interest.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* School Profile Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                            <Building2 size={14} className="text-indigo-600" />
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">School Profile</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-xs text-slate-400 font-medium">Board / Curriculum</span>
                                <span className="text-xs font-semibold text-slate-700">{school.Board || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-xs text-slate-400 font-medium">Total Students</span>
                                <span className="text-xs font-semibold text-slate-700">{school.studnetscount || school.studentscount || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs text-slate-400 font-medium">Demo Required</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    school.demorequire === 'Yes' ? 'bg-emerald-50 text-emerald-600' :
                                    school.demorequire === 'No' ? 'bg-slate-100 text-slate-500' :
                                    school.demorequire === 'Already Done' ? 'bg-blue-50 text-blue-600' :
                                    'text-slate-400'
                                }`}>
                                    {school.demorequire || '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Notes */}
                    {school.comments && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-20 h-20 bg-amber-100 rounded-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <MessageSquare size={12} /> Strategic Intent
                                </p>
                                <p className="text-xs text-amber-900/70 font-bold leading-relaxed">
                                    "{school.comments}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Interaction Timeline ── */}
                <div className="lg:col-span-2 space-y-5">
                    
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={14} className="text-indigo-600" />
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Activity Feed</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
                                {activities.length} Interventions
                            </span>
                        </div>

                        <div className="p-6 flex-1">
                            {activities.length === 0 ? (
                                <div className="py-20 flex flex-col items-center text-center opacity-40">
                                    <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4">
                                        <Clock size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No activities recorded yet</p>
                                    <button 
                                        onClick={() => navigate(`/marketing/visits?school_id=${school.id}`)}
                                        className="mt-4 text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                    >
                                        Log First Interaction <ExternalLink size={10} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 relative">
                                    {/* Vertical line connector */}
                                    <div className="absolute left-[13.5px] top-4 bottom-4 w-[2px] bg-indigo-50" />

                                    {activities.map((act) => (
                                        <div key={act.id} className="relative pl-9 group">
                                            {/* Date bubble */}
                                            <div className="absolute left-0 top-0 w-7 h-7 rounded-lg bg-white border-2 border-indigo-50 flex items-center justify-center z-10 shadow-sm group-hover:border-indigo-400 group-hover:bg-indigo-600 transition-all">
                                                {act.activity_type === 'visit' ? (
                                                    <CheckCircle size={10} className="text-indigo-400 group-hover:text-white" />
                                                ) : (
                                                    <TrendingUp size={10} className="text-indigo-400 group-hover:text-white" />
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-[0.05em]">
                                                            {act.activity_type || 'Activity'}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-gray-400">
                                                            {new Date(act.visit_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    
                                                    {act.next_followup_date && (
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100 text-[9px] font-black uppercase tracking-tight">
                                                            <Calendar size={10} /> {new Date(act.next_followup_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 hover:bg-white hover:shadow-soft transition-all">
                                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                        "{act.comments || 'No details provided'}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
