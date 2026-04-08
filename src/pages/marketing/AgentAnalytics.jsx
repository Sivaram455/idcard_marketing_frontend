import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetAgentStats } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import {
    User, Mail, Phone, Calendar, 
    TrendingUp, Users, CheckCircle, 
    Clock, Building2, IndianRupee, 
    ChevronLeft, Loader2, BarChart3,
    ArrowUpRight, Award, Globe, Trophy
} from "lucide-react";

export default function AgentAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [id]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await apiGetAgentStats(id || "me");
            setData(res.data);
        } catch (err) {
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-400">
                <Loader2 size={28} className="animate-spin text-indigo-500" />
                <p className="text-sm border-b border-gray-100 pb-1">Loading analytics...</p>
            </div>
        );
    }

    if (!data) return null;

    const { profile, stats, isGlobal, performers } = data;

    const StatCard = ({ label, value, icon: Icon, color, trend }) => (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon size={18} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ArrowUpRight size={10} /> {trend}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs font-medium text-gray-400 mt-1">{label}</p>
        </div>
    );

    return (
        <div className="p-5 max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            {isGlobal ? "System Analytics" : "Agent Analytics"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                            {isGlobal ? "Global marketing performance overview" : `Performance overview for ${profile.full_name}`}
                        </p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isGlobal ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                    {isGlobal ? <Globe size={16} /> : <Award size={16} />}
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {isGlobal ? "Admin View" : profile.role}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile Information / System Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className={`h-24 bg-gradient-to-tr relative ${isGlobal ? 'from-rose-500 to-amber-500' : 'from-indigo-600 to-violet-500'}`}>
                            <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-white p-1 border border-gray-100 shadow-lg">
                                <div className={`w-full h-full rounded-xl flex items-center justify-center text-white text-2xl font-bold ${isGlobal ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                                    {isGlobal ? <Globe size={32} strokeWidth={1.5} /> : profile.full_name?.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <div className="pt-14 p-6 pb-8">
                            <h2 className="text-lg font-bold text-gray-900">
                                {isGlobal ? "All Portals" : profile.full_name}
                            </h2>
                            <p className="text-xs font-medium text-gray-400 mb-6 capitalize">
                                {isGlobal ? "Marketing & Sales Network" : `${profile.role} Module`}
                            </p>
                            
                            {isGlobal ? (
                                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Top Performers</p>
                                    {performers?.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs font-medium border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                            <span className="text-gray-700">{p.full_name}</span>
                                            <span className="text-indigo-600 font-bold">₹{Number(p.revenue).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {(!performers || performers.length === 0) && <p className="text-xs text-gray-400 italic">No data yet</p>}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                                            <Mail size={14} />
                                        </div>
                                        <span className="text-xs font-medium">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                                            <Phone size={14} />
                                        </div>
                                        <span className="text-xs font-medium">{profile.phone || "No phone linked"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                                            <Calendar size={14} />
                                        </div>
                                        <span className="text-xs font-medium">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className={`${isGlobal ? 'bg-rose-500' : 'bg-indigo-600'} rounded-2xl p-6 text-white shadow-xl shadow-indigo-100`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                {isGlobal ? <Trophy size={20} /> : <TrendingUp size={20} />}
                            </div>
                            <h3 className="text-sm font-bold tracking-tight">
                                {isGlobal ? "Platform Revenue" : "Sales Contribution"}
                            </h3>
                        </div>
                        <p className="text-xs text-white/80 font-medium mb-1">Total Revenue Collected</p>
                        <h4 className="text-3xl font-bold tracking-tight mb-6">₹{Number(stats.totalRevenue).toLocaleString()}</h4>
                        
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                            <CheckCircle size={10} className="text-emerald-300" /> {stats.ordersBooked} Successfully Closed Orders
                        </div>
                    </div>
                </div>

                {/* Performance Analytics */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Stat Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard 
                            label={isGlobal ? "Total Leads" : "Assigned Leads"} 
                            value={stats.assignedLeads} 
                            icon={Users} 
                            color="bg-blue-50 text-blue-600" 
                        />
                        <StatCard 
                            label="Total Visits" 
                            value={stats.visits} 
                            icon={Building2} 
                            color="bg-emerald-50 text-emerald-600" 
                        />
                        <StatCard 
                            label="Open Follow-ups" 
                            value={stats.pendingFollowups} 
                            icon={Clock} 
                            color="bg-amber-50 text-amber-600" 
                        />
                        <StatCard 
                            label="Total Closures" 
                            value={stats.ordersBooked} 
                            icon={CheckCircle} 
                            color="bg-indigo-50 text-indigo-600" 
                        />
                    </div>

                    {/* Detailed breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Productivity */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                    <BarChart3 size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800">Operational Funnel</h3>
                            </div>
                            
                            <div className="space-y-5">
                                {[
                                    { label: "Visits", icon: Building2, value: stats.visits, sub: "In-person meetings", color: "bg-emerald-500" },
                                    { label: "Followups", icon: Clock, value: stats.followups, sub: "Telephonic/Email", color: "bg-amber-500" },
                                    { label: "Closures", icon: CheckCircle, value: stats.ordersBooked, sub: "Order bookings", color: "bg-indigo-500" },
                                ].map((item) => {
                                    const percentage = stats.totalActivities > 0 
                                        ? Math.min((item.value / stats.totalActivities) * 100, 100) 
                                        : 0;
                                    return (
                                        <div key={item.label}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={14} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800 leading-tight">{item.label}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{item.sub}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-900">{item.value}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{Math.round(percentage)}% of logs</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percentage}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 bg-gray-50/50 -mx-6 -mb-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Efficiency</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">
                                            {stats.visits > 0 ? Math.round((stats.ordersBooked / stats.visits) * 100) : 0}%
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Logged</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{stats.totalActivities}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Distribution */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                    <Users size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800">Portfolio Health</h3>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center py-4">
                                <div className="relative w-32 h-32 mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" fill="transparent" stroke={isGlobal ? "#fee2e2" : "#f3f4f6"} strokeWidth="8" />
                                        <circle 
                                            cx="64" cy="64" r="56" fill="transparent" 
                                            stroke={isGlobal ? "#f43f5e" : "#4f46e5"} strokeWidth="8" 
                                            strokeDasharray={351.8}
                                            style={{ strokeDashoffset: 351.8 - (351.8 * Math.min(stats.assignedLeads / (isGlobal ? 200 : 20), 1)) }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900">{stats.assignedLeads}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Total Leads</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium text-center px-6">
                                    {isGlobal 
                                      ? `System-wide coverage across ${stats.assignedLeads} school accounts.`
                                      : `Agent currently manages ${stats.assignedLeads} school accounts.`
                                    }
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => navigate("/marketing/leads")}
                                className="mt-4 w-full bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold py-2.5 rounded-xl transition-colors border border-gray-100"
                            >
                                View Detailed Pipeline
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
