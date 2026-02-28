import React, { useState } from "react";
import { 
  CreditCard, ArrowLeft, FileSpreadsheet, Archive, 
  Download, CheckCircle, Printer, AlertCircle, 
  CheckCircle2, XCircle, Search, FileCheck, 
  Clock, Calendar, Users, ChevronRight
} from "lucide-react";

export default function Orders() {
  const [viewMode, setViewMode] = useState("list"); 
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [idCardOrders] = useState([
    { id: "ID-9921", school: "Arunodaya School", items: 450, status: "pending", date: "Feb 24, 2026", type: "PVC Premium", location: "Madanapalle" },
    { id: "ID-8842", school: "Viswam School", items: 1200, status: "approved", date: "Feb 22, 2026", type: "Glossy Standard", location: "Punganur" },
    { id: "ID-7731", school: "Greenwood High", items: 850, status: "pending", date: "Feb 25, 2026", type: "PVC Premium", location: "Tirupati" },
  ]);

  const handleView = (order) => {
    setSelectedOrder(order);
    setViewMode("verification");
  };

  if (viewMode === "verification" && selectedOrder) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 mb-8 text-slate-400">
          <button onClick={() => setViewMode("list")} className="hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-widest flex items-center gap-1">
            Production Queue
          </button>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-black text-xs uppercase tracking-widest">{selectedOrder.school}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <CreditCard size={120} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight mb-4">
                {selectedOrder.school}
              </h2>
              <div className="space-y-4 relative z-10">
                <DetailRow icon={<Users size={16}/>} label="Quantity" value={`${selectedOrder.items} Cards`} />
                <DetailRow icon={<Calendar size={16}/>} label="Date Received" value={selectedOrder.date} />
                <DetailRow icon={<CreditCard size={16}/>} label="Material" value={selectedOrder.type} />
              </div>
            </div>

            <div className={`p-6 rounded-[30px] border flex items-center gap-4 ${
              selectedOrder.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
              {selectedOrder.status === 'approved' ? <CheckCircle size={24}/> : <Clock size={24}/>}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Status</p>
                <p className="font-bold text-sm uppercase">{selectedOrder.status}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <FileCheck className="text-indigo-600" />
              Verify Incoming Data
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <AssetCard 
                icon={<FileSpreadsheet className="text-emerald-500" />} 
                title="Student Database" 
                subtitle="DATABASE_V1.XLSX" 
                size="1.4 MB" 
              />
              <AssetCard 
                icon={<Archive className="text-orange-400" />} 
                title="Student Photos" 
                subtitle="PHOTOS_BATCH.ZIP" 
                size="840 MB" 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3">
                <CheckCircle2 size={20} /> Approve Batch
              </button>
              <button onClick={() => setShowRejectModal(true)} className="flex-1 bg-white border-2 border-slate-100 text-slate-500 hover:border-rose-200 hover:text-rose-600 font-black py-5 rounded-3xl text-sm uppercase tracking-widest transition-all">
                Reject Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Production Queue</h1>
            <p className="text-slate-500 font-medium">Verify and clear ID card batches for printing.</p>
          </div>
          
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search school or city..." 
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[25px] font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {idCardOrders
            .filter(o => o.school.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((order) => (
            <div key={order.id} className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-colors ${
                  order.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {order.status === 'approved' ? <CheckCircle size={32} /> : <FileCheck size={32} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-xl md:text-2xl italic tracking-tighter group-hover:text-indigo-600 transition-colors">{order.school}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{order.items} Cards</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12}/> Received {order.date}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleView(order)} 
                  className="flex-1 md:flex-none bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                   Verification
                </button>
                <button className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  order.status === 'approved' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[50px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
               <AlertCircle size={30} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Decline Batch Data?</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Please provide a specific reason. This will be sent back to the data collection team.</p>
            
            <textarea 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[30px] p-6 outline-none font-bold text-slate-700 text-sm focus:border-rose-200 focus:bg-white transition-all resize-none" 
              rows="4" 
              placeholder="e.g. Blurry photos in ZIP, missing admission numbers in Excel..." 
            />
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setShowRejectModal(false)} className="py-5 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => setShowRejectModal(false)} className="py-5 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all">Reject Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-indigo-500 opacity-60">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
        <p className="text-slate-800 font-bold">{value}</p>
      </div>
    </div>
  );
}

function AssetCard({ icon, title, subtitle, size }) {
  return (
    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[30px] flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{title}</h4>
          <p className="text-[10px] font-bold text-slate-400 truncate w-32">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-black text-slate-400 block mb-1">{size}</span>
        <button className="text-indigo-500 hover:text-indigo-700 transition-colors">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
}