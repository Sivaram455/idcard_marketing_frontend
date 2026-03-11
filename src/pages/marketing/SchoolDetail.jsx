import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiGetMarketingSchoolDetail } from "../../utils/api";
import { 
  Phone, Mail, MapPin, User, Calendar, 
  MessageSquare, ChevronLeft, CheckCircle, 
  History, TrendingUp, Info
} from "lucide-react";

export default function SchoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await apiGetMarketingSchoolDetail(id);
      setSchool(res.data);
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!school) return (
    <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-400">School profile not found.</h2>
        <button onClick={() => navigate('/marketing/leads')} className="text-indigo-600 mt-4 hover:underline">Return to list</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{school.school_name}</h1>
                    <span className="px-2.5 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {school.status}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 ">
                        <MapPin size={12} className="text-slate-300" /> {school.city}, {school.state}
                    </p>
                    <span className="text-slate-200">|</span>
                    <select 
                        value={school.status}
                        onChange={async (e) => {
                            try {
                                await apiUpdateMarketingSchool(school.id, { ...school, status: e.target.value });
                                setSchool({ ...school, status: e.target.value });
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-indigo-600 outline-none cursor-pointer hover:text-indigo-800 transition-colors"
                    >
                        <option value="new">Status: New</option>
                        <option value="visited">Status: Visited</option>
                        <option value="followup">Status: Follow-up</option>
                        <option value="closed">Status: Closed</option>
                    </select>
                </div>
            </div>
        </div>
        <Link to="/marketing/visits" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 flex items-center gap-2">
            <MessageSquare size={18} /> Update Activity
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                    <Info size={16} className="text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">School Profile</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
                            <User size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decision Maker</p>
                            <p className="text-sm font-bold text-slate-800">{school.contact_person1 || "—"}</p>
                            {school.contact_person2 && <p className="text-xs text-slate-500">{school.contact_person2}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
                            <Phone size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Contact</p>
                            <p className="text-sm font-bold text-slate-800">{school.mobile || "—"}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
                            <Mail size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{school.email || "—"}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
                            <MapPin size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Address</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">{school.address || "No address provided"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Comments Area */}
            {school.comments && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <MessageSquare size={12} /> Lead Notes
                    </p>
                    <p className="text-sm text-amber-900/70 font-medium italic">"{school.comments}"</p>
                </div>
            )}
        </div>

        {/* Timeline Area */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-indigo-600" />
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interaction Timeline</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{activities.length} Events</span>
                </div>

                <div className="p-8">
                    {activities.length === 0 ? (
                        <div className="py-20 text-center text-slate-300">
                             <History size={48} className="mx-auto mb-4 opacity-10" />
                             <p className="text-sm font-bold uppercase tracking-widest">No activity logs yet</p>
                        </div>
                    ) : (
                        <div className="space-y-8 relative">
                            {/* Vertical line for the whole timeline */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-100"></div>

                            {activities.map((act) => (
                                <div key={act.id} className="relative pl-12 group">
                                    {/* Icon indicator */}
                                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl border flex items-center justify-center z-10 transition-all ${
                                        act.activity_type === 'visit' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-400'
                                    }`}>
                                        {act.activity_type === 'visit' ? <CheckCircle size={14} /> : <TrendingUp size={14} />}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{act.activity_type}</span>
                                                <h4 className="text-sm font-bold text-slate-800">
                                                    {new Date(act.visit_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </h4>
                                            </div>
                                            {act.next_followup_date && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                                                    <Calendar size={12} />
                                                    <span className="text-[10px] font-black uppercase">Follow-up: {new Date(act.next_followup_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 group-hover:border-slate-200 transition-all">
                                            <p className="text-sm text-slate-500 leading-relaxed italic font-medium">"{act.comments}"</p>
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
