import { Users, Target, CheckCircle, Clock } from "lucide-react";

export default function MarketingDashboard() {
  const stats = [
    { label: "Total Leads", value: "156", icon: <Users />, color: "bg-blue-600" },
    { label: "Pipeline", value: "42", icon: <Target />, color: "bg-indigo-600" },
    { label: "Converted", value: "28", icon: <CheckCircle />, color: "bg-green-600" },
    { label: "Pending", value: "14", icon: <Clock />, color: "bg-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Marketing Intelligence</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Performance Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>{stat.icon}</div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-100 h-64 flex items-center justify-center">
        <p className="text-slate-300 font-bold uppercase tracking-widest text-xs italic">Lead Conversion Chart Area</p>
      </div>
    </div>
  );
}