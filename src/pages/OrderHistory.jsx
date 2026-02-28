import Layout from "../components/layout/Layout";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Download, Search, CheckCircle2, 
  Clock, CreditCard
} from "lucide-react";

export default function OrderHistory() {
  const navigate = useNavigate();

  const orders = [
    { id: "ORD-9921", quantity: 100, status: "In Design", paymentStatus: "Pending", school: "ABC School", amount: 12000, date: "24 Feb 2026" },
    { id: "ORD-9850", quantity: 50, status: "Completed", paymentStatus: "Paid", school: "ABC School", amount: 8000, date: "10 Feb 2026" },
    { id: "ORD-9742", quantity: 200, status: "Dispatched", paymentStatus: "Paid", school: "ABC School", amount: 24000, date: "28 Jan 2026" },
  ];

  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("ID GEN SYSTEM", 20, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`School: ${order.school}`, 20, 46);
    doc.text(`Date: ${order.date}`, 20, 52);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Order ID: ${order.id}`, 140, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${order.status}`, 140, 46);
    doc.text(`Payment: ${order.paymentStatus}`, 140, 52);

    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);

    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, 70);
    doc.text("Qty", 120, 70);
    doc.text("Unit Price", 145, 70);
    doc.text("Total", 175, 70);

    doc.setFont("helvetica", "normal");
    const unitPrice = order.amount / order.quantity;
    doc.text("ID Card Production", 20, 80);
    doc.text(order.quantity.toString(), 120, 80);
    doc.text(`INR ${unitPrice.toFixed(2)}`, 145, 80);
    doc.text(`INR ${order.amount.toLocaleString()}`, 175, 80);

    doc.line(20, 90, 190, 90);

    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: INR ${order.amount.toLocaleString()}`, 190, 100, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business!", 105, 120, { align: "center" });

    doc.save(`Invoice_${order.id}.pdf`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "In Design": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Dispatched": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
      <div className="space-y-4 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Order History</h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">Manage orders and generate invoices.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH ID..." 
              className="pl-9 pr-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-100">
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900 text-sm italic">{order.id}</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{order.date}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800 text-sm italic">₹{order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase border-2 ${getStatusStyle(order.status)}`}>
                      {order.status === "Completed" ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.paymentStatus === "Paid" ? (
                      <span className="text-green-600 flex items-center gap-1 text-[11px] font-black uppercase">
                        <CheckCircle2 size={14} strokeWidth={3} /> Paid
                      </span>
                    ) : (
                      <button 
                        onClick={() => navigate("/make-payment")}
                        className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-black border-2 border-amber-200 hover:bg-amber-100 transition-all"
                      >
                        <CreditCard size={12} /> PAY NOW
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => downloadInvoice(order)}
                      className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 p-2.5 rounded-xl border-2 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all group"
                    >
                      <Download size={18} className="group-active:scale-90 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}