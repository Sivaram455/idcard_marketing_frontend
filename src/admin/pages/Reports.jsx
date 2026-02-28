import React from "react";
import { 
  BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Download, Calendar, Printer, AlertTriangle, 
  Layers, ChevronRight, Box, Zap
} from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-8 p-6 bg-[#F8FAFC] min-h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Production Insights</h1>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Real-time monitoring of printing volume & materials</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 bg-slate-50 text-slate-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                <Calendar size={16} /> Last 30 Days
            </button>
            <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 transition-all">
                <Download size={16} /> Download PDF Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Output" 
          value="42,850" 
          sub="Cards Printed"
          change="+15%" 
          isPositive={true} 
          icon={Printer} 
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard 
          title="Efficiency" 
          value="98.2%" 
          sub="Uptime Rate"
          change="+2.4%" 
          isPositive={true} 
          icon={Zap} 
          color="text-amber-500"
          bg="bg-amber-50"
        />
        <StatCard 
          title="Material Usage" 
          value="₹1.2L" 
          sub="Current Month"
          change="+5.2%" 
          isPositive={false} 
          icon={Layers} 
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard 
          title="Reject Rate" 
          value="0.8%" 
          sub="Quality Issues"
          change="-0.2%" 
          isPositive={true} 
          icon={AlertTriangle} 
          color="text-rose-600"
          bg="bg-rose-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest italic flex items-center gap-2">
                  Weekly Output Trends
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Comparison across all machines</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-[8px] font-black uppercase text-slate-400 tracking-tighter">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Current
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-[8px] font-black uppercase text-slate-400 tracking-tighter">
                  <span className="w-2 h-2 rounded-full bg-slate-200"></span> Average
                </div>
              </div>
            </div>

            <div className="h-[300px] flex items-end justify-between px-4">
              {[50, 80, 45, 95, 70, 85, 60].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-4 group w-full">
                  <div className="relative w-12 flex items-end justify-center bg-slate-50 rounded-2xl h-64 overflow-hidden">
                    <div 
                      className="w-full bg-indigo-500 rounded-t-xl group-hover:bg-indigo-600 transition-all duration-700 delay-100" 
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Day {i+1}</span>
                </div>
              ))}
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-8 italic">Inventory Status</h3>
            <div className="space-y-6">
              <StatusProgress label="PVC Premium" percentage={65} color="bg-indigo-500" />
              <StatusProgress label="Glossy Standard" percentage={25} color="bg-cyan-400" />
              <StatusProgress label="Eco-Recycled" percentage={10} color="bg-emerald-400" />
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50">
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-[30px] group hover:bg-rose-100 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <Box className="text-rose-500" size={20} />
                  <span className="text-[10px] font-black text-rose-600 uppercase bg-white px-3 py-1 rounded-full">Low Stock</span>
                </div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">PVC Blank Cards</p>
                <p className="text-[10px] font-bold text-rose-400 mt-1 uppercase">Only 1,200 units remaining</p>
                <button className="mt-4 flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase group-hover:gap-3 transition-all">
                  Restock Now <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


function StatCard({ title, value, sub, change, isPositive, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 ${bg} ${color} rounded-[22px] shadow-inner`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-black px-3 py-1.5 rounded-full border ${
          isPositive ? "bg-green-50 text-green-600 border-green-100" : "bg-rose-50 text-rose-600 border-rose-100"
        }`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tighter">{value}</h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function StatusProgress({ label, percentage, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-slate-800">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}