import { School, Users, User, MapPin, Send } from "lucide-react";

export default function AddLead() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">Add New School</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Enter School Details</p>
      </div>

      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">School Name</label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <input type="text" placeholder="Full School Name" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/10 font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Board</label>
            <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
              <option>CBSE</option>
              <option>ICSE</option>
              <option>State Board</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Student Strength</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <input type="number" placeholder="Total Students" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Contact Person</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <input type="text" placeholder="Principal Name" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Address</label>
            <textarea rows="3" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="School Location..."></textarea>
          </div>

          <button className="md:col-span-2 bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
            <Send size={18} /> Register Lead
          </button>
        </form>
      </div>
    </div>
  );
}