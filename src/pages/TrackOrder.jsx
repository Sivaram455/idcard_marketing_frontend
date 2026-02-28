import React, { useState } from "react";
import StatusTracker from "../components/order/StatusTracker";
import { Search, MapPin, Users, Briefcase, ChevronRight, Package } from "lucide-react";

export default function TrackOrder() {
  const orders = [
    { id: "ORD-9921", type: "Student", label: "Grade 10 - Batch A", count: 120, status: "Printing", date: "28 Feb 2026", address: "ABC International, Block A" },
    { id: "ORD-9925", type: "Staff", label: "Teaching Faculty", count: 45, status: "Dispatched", date: "26 Feb 2026", address: "ABC International, Admin Office" },
    { id: "ORD-9880", type: "Student", label: "Grade 5 - Batch B", count: 85, status: "Processing", date: "02 Mar 2026", address: "ABC International, Block B" },
  ];

  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Track Shipments</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor production and delivery for all school departments.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search Order ID or Class..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none w-full md:w-80 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Active Batches</h3>
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-[24px] cursor-pointer transition-all border ${
                  selectedOrder.id === order.id 
                  ? "bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100" 
                  : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                    order.type === 'Staff' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {order.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{order.id}</span>
                </div>
                <h4 className="font-bold text-slate-800">{order.label}</h4>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                  <Package size={14} />
                  <span>{order.count} ID Cards</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-xl font-bold text-slate-900">{selectedOrder.label}</h2>
                   <ChevronRight size={18} className="text-slate-300" />
                   <span className="text-indigo-600 font-bold">{selectedOrder.id}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Currently in <span className="text-indigo-600 font-bold">{selectedOrder.status}</span> stage</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Delivery</p>
                <p className="text-lg font-bold text-slate-800">{selectedOrder.date}</p>
              </div>
            </div>

            <div className="py-4">
               <StatusTracker currentStatus={selectedOrder.status} />
            </div>

            <hr className="border-slate-50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Address</h4>
                  <p className="text-sm font-bold text-slate-700 leading-snug">
                    {selectedOrder.address},<br />
                    Main Campus, Sector 4, New Delhi
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Batch Details</h4>
                  <p className="text-sm font-bold text-slate-700">
                    Total: {selectedOrder.count} Cards<br />
                    Approved: {selectedOrder.count} / {selectedOrder.count}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}