import React, { useState } from "react";
import { 
  Plus, Search, MapPin, Phone, Mail, 
  Users, Building2, Clock, CheckCircle2, 
  XCircle, ChevronRight, Filter
} from "lucide-react";

export default function SchoolVisits() {
  const [activeTab, setActiveTab] = useState("Pending");

  const visits = [
    {
      id: 1,
      schoolName: "arunima",
      status: "Pending",
      location: "Madanapalle",
      person: "AnilKumar Setti (asd)",
      phone: "09398138140",
      email: "settianilkumar62v@gmail.com",
      strength: "1000",
      boards: "asd",
      dMaker: "asdf",
      timeline: "asd"
    }
  ];

  const stats = [
    { label: "All Visits", count: 27, tab: "All" },
    { label: "Pending", count: 1, tab: "Pending" },
    { label: "Accepted", count: 9, tab: "Accepted" },
    { label: "Rejected", count: 17, tab: "Rejected" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
            School Visits <span className="text-[#00D1C1] bg-[#00D1C1]/10 px-4 py-1 rounded-2xl text-xl">({stats[0].count})</span>
          </h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Manage field marketing records & approvals</p>
        </div>
        <button className="flex items-center gap-2 bg-[#00D1C1] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#00D1C1]/20 hover:scale-105 transition-all">
          <Plus size={18} /> New Visit
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {stats.map((s) => (
          <button
            key={s.tab}
            onClick={() => setActiveTab(s.tab)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === s.tab 
                ? "bg-black text-white shadow-lg shadow-slate-200" 
                : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group">
            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">{visit.schoolName}</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100 mt-2">
                  <Clock size={12} /> {visit.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <CheckCircle2 size={20} />
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="bg-slate-50/50 px-8 py-3 flex gap-8 border-b border-slate-50">
               {["INFO", "TECH", "FINANCE"].map(tab => (
                 <button key={tab} className={`text-[10px] font-black tracking-[0.2em] ${tab === 'INFO' ? 'text-[#00D1C1]' : 'text-slate-300'}`}>
                   {tab}
                 </button>
               ))}
            </div>

            <div className="p-8 grid grid-cols-2 gap-y-6 gap-x-4">
              <DetailItem icon={<MapPin size={14}/>} label="Location" value={visit.location} />
              <DetailItem icon={<Users size={14}/>} label="Person" value={visit.person} />
              <DetailItem icon={<Phone size={14}/>} label="Phone" value={visit.phone} />
              <DetailItem icon={<Mail size={14}/>} label="Email" value={visit.email} />
              <DetailItem icon={<Building2 size={14}/>} label="Strength" value={visit.strength} />
              <DetailItem icon={<Filter size={14}/>} label="Boards" value={visit.boards} />
            </div>

            <div className="px-8 py-6 bg-slate-50 flex justify-between items-center">
               <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-400 uppercase">Decision Maker</span>
                 <span className="text-[11px] font-bold text-slate-700">{visit.dMaker}</span>
               </div>
               <button className="text-[#00D1C1] font-black text-[10px] uppercase flex items-center gap-1 hover:gap-3 transition-all">
                 View Full Record <ChevronRight size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[11px] font-bold text-slate-600 truncate">{value}</span>
      </div>
    </div>
  );
}