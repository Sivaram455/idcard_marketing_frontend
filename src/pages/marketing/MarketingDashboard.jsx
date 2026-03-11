import { useState, useEffect } from "react";
import { apiGetMarketingSchools, apiGetMyMarketingActivities } from "../../utils/api";
import { 
  Building2, Users, CheckCircle, 
  TrendingUp, Clock, Plus, ArrowRight,
  Activity, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MarketingDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLeads: 0,
    visited: 0,
    followups: 0,
    closed: 0,
    new: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schoolsRes, activitiesRes] = await Promise.all([
        apiGetMarketingSchools(),
        apiGetMyMarketingActivities()
      ]);
      
      const schools = schoolsRes.data || [];
      const statsObj = {
        totalLeads: schools.length,
        new: schools.filter(s => s.status === 'new').length,
        visited: schools.filter(s => s.status === 'visited').length,
        followups: schools.filter(s => s.status === 'followup').length,
        closed: schools.filter(s => s.status === 'closed').length
      };
      setStats(statsObj);
      setActivities(activitiesRes.data?.slice(0, 5) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 shrink-0`}>
          <Icon className={`${colorClass.replace('bg-', 'text-')}`} size={20} />
        </div>
      </div>
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</h3>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  );

  const getStatusWidth = (key) => {
    if (stats.totalLeads === 0) return '0%';
    return `${(stats[key] / stats.totalLeads) * 100}%`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Acquisition and conversion metrics overview</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('/marketing/add')}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black flex items-center gap-2 transition-all shadow-sm"
            >
                <Plus size={16} /> New Lead
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Pipeline" value={stats.totalLeads} icon={Users} colorClass="bg-gray-600" />
        <StatCard label="New" value={stats.new} icon={Plus} colorClass="bg-blue-600" />
        <StatCard label="Follow-ups" value={stats.followups} icon={Clock} colorClass="bg-amber-500" />
        <StatCard label="Visited" value={stats.visited} icon={Building2} colorClass="bg-emerald-500" />
        <StatCard label="Closed" value={stats.closed} icon={CheckCircle} colorClass="bg-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Analytics */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
                <TrendingUp size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Pipeline Health</h3>
            </div>
            
            <div className="space-y-6">
                {[
                    { key: 'new', label: 'Initial Contact', color: 'bg-blue-500' },
                    { key: 'visited', label: 'Discovery Completed', color: 'bg-emerald-500' },
                    { key: 'followups', label: 'Active Nurturing', color: 'bg-amber-500' },
                    { key: 'closed', label: 'Closed / Signed', color: 'bg-indigo-600' }
                ].map(item => (
                    <div key={item.key} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-gray-400">{item.label}</span>
                            <span className="text-gray-900">{stats[item.key]}</span>
                        </div>
                        <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className={`${item.color} h-full transition-all duration-1000 ease-out`} 
                                style={{ width: getStatusWidth(item.key) }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Conversion Ratio</p>
                <p className="text-2xl font-black text-center text-gray-900 mt-1">
                    {stats.totalLeads > 0 ? Math.round((stats.closed / stats.totalLeads) * 100) : 0}%
                </p>
            </div>
        </div>

        {/* Recent Visits / Activities */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Activities</h3>
                </div>
                <button 
                  onClick={() => navigate('/marketing/visits')}
                  className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                >
                    Log New
                </button>
            </div>

            <div className="space-y-0 divide-y divide-gray-50">
                {activities.length === 0 ? (
                    <div className="py-20 text-center">
                        <Activity size={40} className="text-gray-100 mx-auto mb-4" />
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No activities logged yet</p>
                    </div>
                ) : activities.map(act => (
                    <div key={act.id} className="py-4 flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/marketing/schools/${act.school_id}`)}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-indigo-200 transition-colors">
                                <Building2 size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{act.school_name}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                                    <MapPin size={10} /> {act.activity_type} on {new Date(act.visit_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={14} className="text-gray-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>

            {activities.length > 0 && (
                <button 
                  onClick={() => navigate('/marketing/leads')}
                  className="w-full mt-6 py-3 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                    View All Leads
                </button>
            )}
        </div>
      </div>
    </div>
  );
}