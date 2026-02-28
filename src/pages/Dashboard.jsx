import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, Clock, Truck, 
  Plus, ArrowUpRight,
  ShieldCheck, Activity,
  Users, ChevronRight
} from "lucide-react";

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
  const schoolName = "Arunodaya School";

  const handleCreateOrder = () => navigate("/create-order");
  const handleViewOrders = () => navigate("/orders");
  const handleTrackOrders = () => navigate("/track");

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 p-6 bg-[#F8FAFC] min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, <span className="text-indigo-600">{schoolName}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your ID card orders today.</p>
        </div>
        <button 
          onClick={handleCreateOrder}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Create New Order
        </button>
      </div>

      {/* Hero Performance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900 rounded-[32px] p-8 relative overflow-hidden text-white shadow-xl shadow-slate-200">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-indigo-400 mb-6">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Academic Portal</span>
              </div>
              <h2 className="text-4xl font-bold leading-tight">Your production cycle is <span className="text-indigo-400">85% complete.</span></h2>
              <p className="text-slate-400 mt-4 text-sm leading-relaxed">
                Most students now have active ID cards. You have <span className="text-white">5 pending batches</span> that require photo approval.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-3 cursor-help" title="Active Classes">
                {[1,2,3,4].map(i => (
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
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 flex flex-col shadow-sm">
           <h4 className="text-sm font-bold text-slate-800 mb-6">Quick Status</h4>
           <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <span className="text-slate-500 font-medium">Approved</span>
                  <span className="text-slate-900 font-bold">2,450</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[85%] transition-all duration-1000" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <span className="text-slate-500 font-medium">Pending Photos</span>
                  <span className="text-slate-900 font-bold">120</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[15%] transition-all duration-1000" />
                </div>
              </div>
           </div>
           
           <div className="mt-6 pt-6 border-t border-slate-50">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Sync: Just now</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Activity</h3>
            <button 
              onClick={handleTrackOrders}
              className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
            >
              View Tracking <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { id: "#ORD-9921", type: "Bulk (Grade 10)", status: "Printing", time: "2h ago", icon: Users },
              { id: "#ORD-9915", type: "Single Replacement", status: "Delivered", time: "Yesterday", icon: Users },
              { id: "#ORD-9890", type: "Staff Cards", status: "Pending", time: "3d ago", icon: Users },
            ].map((order, i) => (
              <div 
                key={i} 
                onClick={handleViewOrders}
                className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-white transition-all">
                    <order.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{order.id}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{order.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-6">
          <div 
            className="bg-white border border-slate-100 rounded-[32px] p-6 hover:border-indigo-200 transition-colors cursor-pointer group shadow-sm h-full flex flex-col justify-center"
            onClick={() => alert("Connecting you to Support...")}
          >
            <h4 className="text-sm font-bold text-slate-800 mb-4">Support Contact</h4>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">AM</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Ankit Mishra</p>
                <p className="text-[11px] text-slate-400 font-medium">Your Account Manager</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[10px] text-slate-400 mt-6 text-center font-medium uppercase tracking-widest">Available: 9:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}