import { 
  School, ShoppingBag, Clock, FileCheck, MessageSquareWarning, 
  ArrowUpRight, Printer, Plus, Users, Search 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const productionStats = [
    { label: "Total Schools", value: "12", icon: <School size={20}/>, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Live Orders", value: "24", icon: <ShoppingBag size={20}/>, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pending Data", value: "18", icon: <FileCheck size={20}/>, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Ready to Print", value: "07", icon: <Printer size={20}/>, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ID Card Operations</h1>
          <p className="text-slate-400 text-xs font-medium mt-1">Manage production workflow & school data approval</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate("/admin/schools")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-100"
          >
            <Plus size={18} /> Add School
          </button>
          <button 
            onClick={() => navigate("/admin/reports")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Analytics <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {productionStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <FileCheck size={20} className="text-amber-500" /> Data Approval Required
            </h2>
            <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full uppercase">
              18 Pending Reviews
            </span>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/admin/orders")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">GH</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Greenwood High School</h4>
                  <p className="text-xs text-slate-400">200 Student Records • ZIP Uploaded</p>
                </div>
              </div>
              <button className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/admin/orders")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">SM</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">St. Mary's Convent</h4>
                  <p className="text-xs text-slate-400">45 Student Records • Partial Data</p>
                </div>
              </div>
              <button className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            <Printer size={22} className="text-indigo-300" /> Printing Queue
          </h2>
          
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between text-xs font-bold text-indigo-200 uppercase mb-2">
                <span>Currently Printing</span>
                <span>75%</span>
              </div>
              <div className="w-full h-2 bg-indigo-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-3/4 shadow-[0_0_10px_#34d399]"></div>
              </div>
              <p className="text-[11px] text-indigo-300 mt-2 font-medium">Delhi Public School • 300 Cards</p>
            </div>

            <div className="pt-6 border-t border-indigo-800">
              <p className="text-xs font-bold text-indigo-200 uppercase mb-4">Up Next</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  Oakridge International
                </div>
                <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  Heritage Valley School
                </div>
              </div>
            </div>

            <button className="w-full bg-white text-indigo-900 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
              Manage Queue
            </button>
          </div>
        </div>
      </div>

      <div className="bg-rose-50 border border-rose-100 p-5 rounded-[24px] flex items-start gap-4">
        <div className="bg-rose-500 p-2.5 rounded-xl text-white shadow-md shadow-rose-200">
          <MessageSquareWarning size={20} />
        </div>
        <div>
          <h5 className="text-rose-900 font-black text-sm uppercase tracking-tight">System Alert: Data Correction Needed</h5>
          <p className="text-rose-700/80 text-xs mt-0.5 font-medium leading-relaxed">
            2 Schools have photo-mismatch errors in their latest ZIP uploads. Production is paused for these schools until resolved.
          </p>
        </div>
      </div>
    </div>
  );
}