import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, Clock, Truck,
  Plus, ArrowUpRight,
  ShieldCheck, Activity,
  Users, ChevronRight, Ticket
} from "lucide-react";
import CreateTicketModal from "./ticketing/CreateTicketModal";

const MiniStat = ({ label, value, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
        {trend}
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
  </div>
);

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const schoolName = "Arunodaya School";

  const handleCreateOrder = () => navigate("/create-order");
  const handleViewOrders = () => navigate("/orders");
  const handleTrackOrders = () => navigate("/track");

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
            Welcome, <span className="text-indigo-600 underline decoration-indigo-200 decoration-4 underline-offset-4">{schoolName}</span>
          </h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2 px-1">GMMC Production Intelligence Base</p>
        </div>
        <button
          onClick={handleCreateOrder}
          className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group w-full sm:w-auto"
        >
          <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Initialize Order
        </button>
      </div>

      {/* Hero Performance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="lg:col-span-3 bg-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden text-white shadow-2xl shadow-indigo-100">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-indigo-400 mb-4 lg:mb-6">
                <ShieldCheck size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Verified Academic Node</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight uppercase italic">Production Cycle <span className="text-indigo-400">85% Nominal</span></h2>
              <p className="text-slate-400 mt-3 md:mt-4 text-xs md:text-sm leading-relaxed font-bold uppercase tracking-wide opacity-60">
                Major student cohort synchronized. <span className="text-white">05 pending batches</span> await artifact approval.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-3 cursor-help" title="Active Classes">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold hover:z-20 hover:border-indigo-400 transition-all">
                    Class {i}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium italic">Batch 12-B currently in printing process...</p>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Quick Status Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Real-time Metrics</h4>
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider">
                <span className="text-slate-400">Approved</span>
                <span className="text-slate-900">2,450</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                <div className="bg-indigo-600 h-full w-[85%] transition-all duration-1000" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider">
                <span className="text-slate-400">Awaiting Assets</span>
                <span className="text-slate-900">120</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                <div className="bg-amber-500 h-full w-[15%] transition-all duration-1000" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-50">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Status
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniStat label="Total Orders" value="25" icon={ShoppingBag} trend="+12%" />
        <MiniStat label="Active Batches" value="05" icon={Activity} trend="Running" />
        <MiniStat label="Dispatched" value="15" icon={Truck} trend="+5" />
        <MiniStat label="Avg Lead Time" value="3 Days" icon={Clock} trend="Stable" />
      </div>

      {/* Recent Orders and Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest italic">Operational Stream</h3>
            <button
              onClick={handleTrackOrders}
              className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              Sync Logistics <ArrowUpRight size={14} strokeWidth={3} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { id: "#ORD-9921", type: "Bulk (Grade 10)", status: "Printing", time: "2h ago", icon: Users },
              { id: "#ORD-9915", type: "Replacement Single", status: "Delivered", time: "Yesterday", icon: Users },
              { id: "#ORD-9890", type: "Staff Artifacts", status: "Pending", time: "3d ago", icon: Users },
            ].map((order, i) => (
              <div
                key={i}
                onClick={handleViewOrders}
                className="px-6 md:px-8 py-4 flex items-center justify-between hover:bg-indigo-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-100">
                    <order.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter italic">{order.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{order.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                    {order.status}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest opacity-60">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-4">
          <div
            className="bg-white border border-slate-100 rounded-3xl p-6 hover:border-indigo-200 transition-all cursor-pointer group shadow-sm flex flex-col justify-center min-h-[200px] border-b-4 border-b-indigo-500 shadow-indigo-100/20"
            onClick={() => setIsTicketModalOpen(true)}
          >
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Technical Intelligence</h4>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-100">AM</div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase italic">Ankit Mishra</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight mt-0.5">Asset Lead</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" strokeWidth={3} />
            </div>
            <p className="text-[8px] text-slate-300 mt-6 text-center font-black uppercase tracking-[0.2em] italic">Operations active: 09:00 - 18:00 ISO</p>
          </div>
        </div>
      </div>

      <CreateTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </div>
  );
}