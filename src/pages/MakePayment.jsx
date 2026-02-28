import React, { useState } from "react";
import { 
  Smartphone, 
  Banknote, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Loader2,
  ChevronRight
} from "lucide-react";

export default function MakePayment() {
  const [method, setMethod] = useState("UPI");
  const [refNo, setRefNo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const amount = 12000;
  const upiId = "idpro.business@upi";

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[40px] border border-slate-100 text-center shadow-2xl shadow-slate-200/50 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Payment Logged</h2>
        <p className="text-slate-500 mt-3 px-4">
          {method === "Cash" 
            ? "Your request for cash verification has been sent to the accounts department."
            : `Ref No: ${refNo} is being verified. Production will begin shortly.`}
        </p>
        <div className="mt-8 space-y-3">
          <button 
            onClick={() => window.location.href = "/orders"} 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Track Order Status
          </button>
          <button 
            onClick={() => window.print()} 
            className="w-full bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold text-sm"
          >
            Download Acknowledgment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Complete Payment</h1>
          <p className="text-slate-500 font-medium mt-1">Select your preferred method to activate production.</p>
        </div>
        <div className="bg-indigo-600 px-6 py-4 rounded-3xl text-white shadow-lg shadow-indigo-100">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80">Total Payable</p>
          <p className="text-2xl font-bold">₹{amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Options</h3>
          
          {[
            { id: 'UPI', title: 'UPI / Digital', desc: 'GPay, PhonePe, Paytm', icon: Smartphone, color: 'indigo' },
            { id: 'Card', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard, color: 'blue' },
            { id: 'Cash', title: 'Cash / Manual', desc: 'Sales Rep Collection', icon: Banknote, color: 'amber' }
          ].map((opt) => (
            <button 
              key={opt.id}
              onClick={() => setMethod(opt.id)}
              className={`w-full flex items-center justify-between p-5 rounded-[28px] border-2 transition-all ${
                method === opt.id 
                ? `border-${opt.color}-600 bg-${opt.color}-50/50 shadow-sm` 
                : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  method === opt.id ? `bg-${opt.color}-600 text-white` : 'bg-slate-50 text-slate-400'
                }`}>
                  <opt.icon size={22} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">{opt.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{opt.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className={method === opt.id ? `text-${opt.color}-600` : 'text-slate-200'} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[450px] flex flex-col justify-center">
            
            {method === "UPI" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center shadow-inner">
                       <div className="text-center p-4">
                         <div className="grid grid-cols-3 gap-1 opacity-20">
                            {[...Array(9)].map((_, i) => <div key={i} className="w-4 h-4 bg-slate-900"/>)}
                         </div>
                         <p className="text-[8px] mt-2 font-bold text-slate-400">QR BATCH MODE</p>
                       </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-900">Scan & Pay</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Scan this QR with any UPI app. Once paid, enter the 12-digit UTR/Transaction ID below.
                    </p>
                    <div className="inline-flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <code className="text-xs font-bold text-indigo-600">{upiId}</code>
                      <button onClick={() => navigator.clipboard.writeText(upiId)} className="hover:text-indigo-800 transition-colors">
                        <Copy size={14}/>
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Ref (UTR)</label>
                    <input 
                      required
                      type="text" 
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      placeholder="Enter 12-digit number"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-mono font-bold focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                  <button 
                    disabled={isProcessing}
                    type="submit" 
                    className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-70 transition-all"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Verify & Complete"}
                  </button>
                </form>
              </div>
            )}

            {method === "Card" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-slate-900 p-8 rounded-[32px] text-white relative overflow-hidden mb-8">
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-center">
                      <CreditCard size={32} className="opacity-50" />
                      <p className="text-[10px] font-black tracking-widest uppercase italic">Secure Gateway</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs opacity-50 uppercase tracking-widest">Amount to Charge</p>
                      <p className="text-3xl font-bold italic tracking-tighter">₹{amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <button 
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Proceed to Secure Gateway"}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                    🔒 SSL Encrypted 256-bit Transaction
                  </p>
                </form>
              </div>
            )}

            {method === "Cash" && (
              <div className="space-y-6 animate-in fade-in duration-500 text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                   <AlertCircle size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Manual Collection</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Choose this if you have handed cash to a representative or are sending a cheque.
                  </p>
                </div>
                <button 
                  onClick={() => {setRefNo("CASH_REQUEST"); setSubmitted(true);}}
                  className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold shadow-lg mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm Cash Submission
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}