import React, { useState } from "react";
import { 
  CreditCard, Banknote, CheckCircle2, 
  Smartphone, AlertCircle, Search, 
  Download, Printer, Receipt, Info,
  ExternalLink, ArrowRight
} from "lucide-react";

export default function Payments() {
  const [payments, setPayments] = useState([
    { id: 101, orderId: "IDC-442", school: "VISWAM SCHOOL", amount: 45000, assignedCost: 45000, status: "Pending", method: "Bank Transfer", refNo: "TXN_002931", date: "2026-02-20" },
    { id: 102, orderId: "IDC-450", school: "ARUNODAYA HIGH", amount: 12500, assignedCost: 12500, status: "Paid", method: "PhonePe/UPI", refNo: "UTR99283741", date: "2026-02-24" },
    { id: 103, orderId: "IDC-461", school: "GREENWOOD ACADEMY", amount: 0, assignedCost: 32000, status: "Pending", method: "Offline (Cash)", refNo: "Awaiting Receipt", date: "2026-02-26" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const verifyPayment = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "Paid", amount: p.assignedCost } : p));
  };

  return (
    <div className="space-y-8 p-6 bg-[#F8FAFC] min-h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
               <Receipt size={22} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Payment Hub</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Verify billing and clear batches for production</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search school or ID..." 
              className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold w-full sm:w-72 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        <div className="xl:col-span-3 bg-white rounded-[50px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-10 py-8">Order Information</th>
                  <th className="px-10 py-8">Billing Status</th>
                  <th className="px-10 py-8">Payment Info</th>
                  <th className="px-10 py-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments
                  .filter(p => p.school.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((payment) => (
                  <tr key={payment.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 italic tracking-tighter text-lg">{payment.school}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-indigo-500 uppercase">{payment.orderId}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{payment.date}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-10 py-8">
                      {payment.assignedCost > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xl font-black text-slate-800">₹{payment.assignedCost.toLocaleString()}</span>
                          {payment.amount === 0 && (
                            <span className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-1 mt-1">
                              <Info size={10} /> Cost assigned by Admin
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-300 italic">Calculating...</span>
                      )}
                    </td>

                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 mb-1">
                        {payment.method.includes("UPI") ? <Smartphone size={14} className="text-purple-500" /> : <Banknote size={14} className="text-emerald-500" />}
                        <span className="text-[10px] font-black text-slate-600 uppercase">{payment.method}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{payment.refNo}</p>
                    </td>

                    <td className="px-10 py-8 text-right">
                      {payment.status === "Pending" ? (
                        <button
                          onClick={() => verifyPayment(payment.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 ml-auto"
                        >
                          Confirm Receipt <ArrowRight size={14} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 justify-end text-emerald-500">
                          <CheckCircle2 size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl shadow-slate-200">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Payment Overview</h3>
             <div className="space-y-4">
                <SummaryRow label="Unverified" value="₹77,000" color="text-amber-400" />
                <SummaryRow label="Settled Today" value="₹12,500" color="text-emerald-400" />
                <div className="pt-4 border-t border-slate-800">
                   <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                     Payments confirmed here will automatically move batches to the <span className="text-white">Print Queue</span>.
                   </p>
                </div>
             </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                <ExternalLink size={20} />
             </div>
             <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Need a full GST invoice?</h4>
             <p className="text-[11px] font-medium text-indigo-600/70 mt-2 mb-4">Export detailed monthly statements for your accounting.</p>
             <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">
                Generate Report
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
  );
}