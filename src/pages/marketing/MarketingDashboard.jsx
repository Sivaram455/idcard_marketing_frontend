import { useState, useEffect } from "react";
import { apiGetMarketingSchools, apiGetMyMarketingActivities, apiGetAgentStats } from "../../utils/api";
import {
    Building2, Users, CheckCircle,
    TrendingUp, Clock, Plus, ChevronRight,
    Activity, MapPin, Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
        <div className={`p-2 rounded-lg ${colorClass} mb-3 w-fit`}>
            <Icon size={14} />
        </div>
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
);

export default function MarketingDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalLeads: 0, visited: 0, followups: 0, closed: 0, new: 0 });
    const [activities, setActivities] = useState([]);
    const [performers, setPerformers] = useState([]);
    const [isGlobal, setIsGlobal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [schoolsRes, activitiesRes] = await Promise.all([
                apiGetMarketingSchools(),
                apiGetMyMarketingActivities()
            ]);
            
            const schools = schoolsRes.data || [];
            setStats({
                totalLeads: schools.length,
                new: schools.filter(s => s.status === "new").length,
                visited: schools.filter(s => s.status === "visited").length,
                followups: schools.filter(s => s.status === "followup").length,
                closed: schools.filter(s => s.status === "closed").length,
            });
            setActivities(activitiesRes.data?.slice(0, 6) || []);

            // Fetch global analytics separately so it doesn't break the whole page if it fails
            try {
                const globalRes = await apiGetAgentStats("me");
                if (globalRes.data?.isGlobal) {
                    setIsGlobal(true);
                    setPerformers(globalRes.data.performers || []);
                }
            } catch (gErr) {
                console.warn("Global analytics not available", gErr);
            }
        } catch (err) {
            console.error("Dashboard core fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const pct = (key) => stats.totalLeads > 0 ? `${Math.round((stats[key] / stats.totalLeads) * 100)}%` : "0%";

    const fmtDate = (d) => {
        if (!d) return "—";
        const dt = new Date(d);
        return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    };

    return (
        <div className="p-5 space-y-5">

            {/* ── Page Heading ── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
                        {isGlobal ? "System Overview" : "Dashboard"}
                    </h1>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                        {isGlobal ? "Global acquisition & conversion metrics" : "Acquisition & conversion overview"}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/marketing/add")}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shadow-indigo-100"
                >
                    <Plus size={13} strokeWidth={2.5} /> New Lead
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <StatCard label={isGlobal ? "Total Pipeline" : "My Pipeline"} value={stats.totalLeads} icon={Users} colorClass="bg-gray-100 text-gray-600" />
                <StatCard label="New" value={stats.new} icon={Plus} colorClass="bg-blue-50 text-blue-600" />
                <StatCard label="Follow-ups" value={stats.followups} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
                <StatCard label="Visited" value={stats.visited} icon={Building2} colorClass="bg-emerald-50 text-emerald-600" />
                <StatCard label="Closed" value={stats.closed} icon={CheckCircle} colorClass="bg-indigo-50 text-indigo-600" />
            </div>

            {/* ── Bottom Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left Side: Pipeline or Leaderboard */}
                {isGlobal && performers.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy size={14} className="text-amber-500" />
                            <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Top Performers</h2>
                        </div>
                        <div className="space-y-4">
                            {performers.map((p, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                                        <span className="text-gray-700">{p.full_name}</span>
                                        <span className="text-indigo-600 font-extrabold">₹{Number(p.revenue).toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                        <div 
                                            className="h-1 rounded-full bg-indigo-500 transition-all duration-1000" 
                                            style={{ width: `${Math.min((p.revenue / performers[0].revenue) * 100, 100)}%` }} 
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-1 uppercase font-black">{p.orders_count} Orders Closed</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={14} className="text-gray-400" />
                            <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Pipeline Health</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { key: "new", label: "Initial Contact", color: "bg-blue-500" },
                                { key: "visited", label: "Visit Completed", color: "bg-emerald-500" },
                                { key: "followups", label: "Active Follow-up", color: "bg-amber-500" },
                                { key: "closed", label: "Closed / Signed", color: "bg-indigo-500" },
                            ].map(item => (
                                <div key={item.key}>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className="text-gray-900 font-bold">{stats[item.key]}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-1.5 rounded-full ${item.color} transition-all duration-700`} style={{ width: pct(item.key) }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conversion Rate</p>
                            <p className="text-lg font-extrabold text-gray-900">
                                {stats.totalLeads > 0 ? Math.round((stats.closed / stats.totalLeads) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                )}

                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">
                            {isGlobal ? "Global Activity Stream" : "Recent Activities"}
                        </h2>
                        <button onClick={() => navigate("/marketing/visits")}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5">
                            Log Visit <ChevronRight size={12} />
                        </button>
                    </div>

                    {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Activity size={24} strokeWidth={1.5} className="mb-2 opacity-40" />
                            <p className="text-sm font-medium text-gray-500">No activities yet</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-50 flex-1">
                                {activities.map(act => (
                                    <div
                                        key={act.id}
                                        onClick={() => navigate(`/marketing/schools/${act.school_id}`)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                    >
                                        <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                                            <Building2 size={13} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-700 truncate transition-colors">
                                                    {act.school_name}
                                                </p>
                                                {isGlobal && act.agent_name && (
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">by {act.agent_name}</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                <MapPin size={9} /> {act.activity_type} · {fmtDate(act.visit_date)}
                                            </p>
                                        </div>
                                        <ChevronRight size={13} className="text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/60 flex justify-between items-center">
                                <button onClick={() => navigate("/marketing/leads")}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                                    View all leads <ChevronRight size={12} />
                                </button>
                                {isGlobal && (
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic animate-pulse">Live Feed</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}