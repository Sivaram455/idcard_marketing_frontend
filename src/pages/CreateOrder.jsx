import { useState } from "react";
import Layout from "../components/layout/Layout";
import OrderForm from "../components/order/OrderForm";
import UploadSection from "../components/order/UploadSection";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { 
  ClipboardList, UploadCloud, CheckCircle2, ArrowRight, UserPlus, 
  Layers, ArrowLeft, UserCircle, Camera, FileSpreadsheet, AlertCircle 
} from "lucide-react";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); 
  const [orderMode, setOrderMode] = useState(null); 
  const [orderData, setOrderData] = useState({
    products: [], quantity: "1", urgency: "Normal", address: "",
    excelFile: null, photos: [], studentName: "", studentClass: "",
    rollNo: "", bloodGroup: "", parentName: "", phone: "", studentPhoto: null
  });

  const downloadTemplate = () => {
    const headers = [["Admission No", "Student Name", "Class", "Section", "Blood Group", "Parent Name", "Phone"]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OrderData");
    XLSX.writeFile(wb, "ID_Card_Template.xlsx");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(3); 
    setTimeout(() => navigate("/orders"), 2000);
  };

  return (
      <div className="max-w-4xl mx-auto space-y-3 pb-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
              {step === 0 ? "Select Order Type" : "New ID Order"}
            </h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${orderMode ? 'bg-indigo-600' : 'bg-slate-300'}`} />
              {orderMode === 'single' ? "Individual Student" : orderMode === 'bulk' ? "Bulk Production" : "System Ready"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {orderMode === 'bulk' && step > 0 && step < 3 && (
              <button type="button" onClick={downloadTemplate} className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-indigo-600 transition-all">
                <FileSpreadsheet size={14} /> Excel Template
              </button>
            )}
            {step > 0 && step < 3 && (
              <div className="flex items-center gap-2 bg-slate-100 p-1 px-3 rounded-lg">
                <StepIndicator num={1} active={step >= 1} label="Info" />
                <div className="w-4 h-[2px] bg-slate-300" />
                <StepIndicator num={2} active={step >= 2} label={orderMode === 'bulk' ? "Upload" : "Data"} />
              </div>
            )}
          </div>
        </div>

        {step === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ModeCard title="Bulk Production" desc="Full classes or school-wide orders." icon={Layers} color="text-indigo-700" bg="bg-indigo-50" onClick={() => { setOrderMode('bulk'); setStep(1); }} />
            <ModeCard title="Single Entry" desc="Late admissions or staff cards." icon={UserPlus} color="text-cyan-700" bg="bg-cyan-50" onClick={() => { setOrderMode('single'); setStep(1); }} />
          </div>
        ) : step < 3 ? (
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-md overflow-hidden">
            <form onSubmit={handleSubmit} className="p-5 md:p-8">
              {step === 1 ? (
                <div className="animate-in fade-in">
                  <SectionTitle icon={ClipboardList} title="Configuration" />
                  <OrderForm orderData={orderData} setOrderData={setOrderData} />
                  <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                    <button type="button" onClick={() => {setStep(0); setOrderMode(null);}} className="text-slate-500 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:text-slate-900">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button type="button" onClick={() => setStep(2)} className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700">
                      Continue <ArrowRight size={16} className="ml-1 inline" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in">
                  {orderMode === 'bulk' ? (
                    <>
                      <SectionTitle icon={UploadCloud} title="Data Assets" />
                      <div className="-mt-6">
                        <UploadSection orderData={orderData} setOrderData={setOrderData} />
                      </div>
                      <div className="mt-4 p-3 bg-indigo-50 border-l-4 border-indigo-600 rounded-r-xl flex gap-3 items-center">
                        <AlertCircle size={18} className="text-indigo-700 shrink-0" />
                        <p className="text-slate-700 text-xs font-bold leading-tight">
                          <span className="text-indigo-700 font-black uppercase">Rule:</span> 
                          Photos must be named as <span className="bg-white px-1 rounded text-indigo-700">AdmissionNo.jpg</span> to match Excel records.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <SectionTitle icon={UserCircle} title="Student Details" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="Student Name" placeholder="Full name" />
                        <Input label="Roll Number" placeholder="Ex: 102" />
                        <Input label="Class & Section" placeholder="Ex: 10th - A" />
                        <Input label="Blood Group" placeholder="Ex: O+" />
                        <div className="md:col-span-2 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center group hover:border-indigo-400 bg-slate-50 transition-colors cursor-pointer">
                           <Camera className="text-slate-400 mb-1 group-hover:text-indigo-600" size={28} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Photo</span>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                    <button type="button" onClick={() => setStep(1)} className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Previous</button>
                    <button type="submit" className="bg-[#0DAE5D] text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all">
                      Finalize Order
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-3xl border-2 border-slate-100 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4"><CheckCircle2 size={32} /></div>
             <h2 className="text-2xl font-black text-slate-900 italic uppercase">Order Placed!</h2>
             <p className="text-slate-500 font-bold text-xs mt-1 uppercase">Loading Dashboard...</p>
          </div>
        )}
      </div>
  );
}

function ModeCard({ title, desc, icon: Icon, color, bg, onClick }) {
  return (
    <button onClick={onClick} className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-indigo-500 transition-all text-left group relative">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
      <h3 className="text-lg font-black text-slate-900 italic uppercase leading-none mb-1">{title}</h3>
      <p className="text-slate-500 text-[11px] font-bold leading-snug">{desc}</p>
      <ArrowRight className={`absolute bottom-5 right-5 ${color} opacity-0 group-hover:opacity-100 transition-opacity`} size={18} />
    </button>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4 text-indigo-700">
      <Icon size={18} strokeWidth={3} />
      <h2 className="text-[12px] font-black uppercase tracking-widest italic">{title}</h2>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider ml-0.5">{label}</label>
      <input {...props} className="w-full bg-slate-100 border-2 border-transparent rounded-lg p-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all" />
    </div>
  );
}

function StepIndicator({ num, active, label }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-indigo-700' : 'text-slate-400'}`}>
      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${active ? 'bg-indigo-700 text-white' : 'bg-slate-200'}`}>{num}</div>
      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{label}</span>
    </div>
  );
}