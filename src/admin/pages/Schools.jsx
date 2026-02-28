import { useState, useEffect } from "react";
import { 
  Plus, School, Eye, EyeOff, X, Copy, 
  Trash2, Power, PowerOff, Shield, 
  ChevronLeft, CheckCircle2, Search,
  ArrowUpRight
} from "lucide-react";

export default function AdminSchools() {
  const [view, setView] = useState("list"); 
  const [schools, setSchools] = useState([]);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newSchool, setNewSchool] = useState({
    name: "", email: "", strength: "", address: "", board: "CBSE"
  });

  useEffect(() => {
    const savedSchools = JSON.parse(localStorage.getItem("registeredSchools")) || [
      { id: Date.now(), name: "Greenwood High", email: "principal@greenwood.com", strength: "675", status: "active", password: "IDP-X7Y2Z9" }
    ];
    setSchools(savedSchools);
  }, []);

  const saveToSync = (updatedList) => {
    setSchools(updatedList);
    localStorage.setItem("registeredSchools", JSON.stringify(updatedList));
  };

  const handleRegisterSchool = (e) => {
    e.preventDefault();
    const autoPassword = "IDP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const schoolData = { ...newSchool, id: Date.now(), status: "active", password: autoPassword };
    saveToSync([...schools, schoolData]);
    setSelectedSchool(schoolData);
    setShowCredsModal(true);
    setView("list");
    setNewSchool({ name: "", email: "", strength: "", address: "", board: "CBSE" });
  };

  const toggleStatus = (id) => {
    const updated = schools.map(s => 
      s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
    );
    saveToSync(updated);
  };

  const deleteSchool = (id) => {
    if(window.confirm("Are you sure you want to remove this institution? This will revoke their access.")) {
      const updated = schools.filter(s => s.id !== id);
      saveToSync(updated);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {showCredsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <button onClick={() => setShowCredsModal(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Access Granted</h3>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">{selectedSchool?.name}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Portal Username</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-700 text-sm truncate">{selectedSchool?.email}</p>
                  <Copy size={16} className="text-slate-300 group-hover:text-indigo-500 cursor-pointer transition-colors" />
                </div>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 group">
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Auto-Generated Password</p>
                <div className="flex justify-between items-center">
                  <p className="font-mono font-black text-indigo-600 text-lg tracking-wider">
                    {showPassword ? selectedSchool?.password : "••••••••"}
                  </p>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-indigo-300 hover:text-indigo-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setShowCredsModal(false)} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] uppercase text-xs tracking-[0.2em] mt-8 transition-all shadow-lg shadow-slate-200">
              Close & Save
            </button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Institution Directory</h1>
              <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">Authorized Schools for ID Production</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search schools..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => setView("add-school")} className="bg-indigo-600 text-white font-black px-8 py-4 rounded-[22px] text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                <Plus size={18} /> Register School
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-2">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-6">Institution</th>
                  <th className="px-8 py-6 text-center">Student Load</th>
                  <th className="px-8 py-6">Portal Access</th>
                  <th className="px-8 py-6 text-right">Settings</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((s) => (
                  <tr key={s.id} className={`group ${s.status === 'inactive' ? 'opacity-50' : ''}`}>
                    <td className="px-8 py-5 bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors rounded-l-[28px]">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${s.status === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg">{s.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors">
                      <div className="text-center">
                        <span className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-black text-slate-600 shadow-sm">
                          {s.strength}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors">
                      <button 
                        onClick={() => toggleStatus(s.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                      >
                        {s.status === 'active' ? <Power size={14} /> : <PowerOff size={14} />}
                        {s.status}
                      </button>
                    </td>
                    <td className="px-8 py-5 bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors rounded-r-[28px]">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => { setSelectedSchool(s); setShowCredsModal(true); }} 
                          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                        >
                          <Shield size={14} /> Credentials
                        </button>
                        <button 
                          onClick={() => deleteSchool(s.id)} 
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "add-school" && (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setView("list")} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase mb-8 hover:text-slate-800 transition-colors">
            <ChevronLeft size={16} /> Return to Directory
          </button>
          
          <div className="bg-white p-12 md:p-16 rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16 relative z-10">
              <div className="bg-indigo-600 text-white p-6 rounded-[32px] shadow-xl shadow-indigo-100">
                <School size={48} />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Onboard New School</h2>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2">Generate credentials for the ID Card portal</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSchool} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Full Legal Institution Name</label>
                <input required value={newSchool.name} onChange={(e)=>setNewSchool({...newSchool, name: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[28px] outline-none font-bold text-slate-700 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner" placeholder="e.g. Oakridge International School" />
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Admin Email (Login Username)</label>
                <input required type="email" value={newSchool.email} onChange={(e)=>setNewSchool({...newSchool, email: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[28px] outline-none font-bold text-slate-700 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner" placeholder="principal@school.com" />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Approx Student Count</label>
                <input required type="number" value={newSchool.strength} onChange={(e)=>setNewSchool({...newSchool, strength: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[28px] outline-none font-bold text-slate-700 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner" placeholder="e.g. 1200" />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Full Campus Address</label>
                <textarea required rows="3" value={newSchool.address} onChange={(e)=>setNewSchool({...newSchool, address: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[28px] outline-none font-bold text-slate-700 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner resize-none" placeholder="Building No, Street, City, State, PIN" />
              </div>

              <button type="submit" className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-7 rounded-[32px] uppercase text-sm tracking-[0.3em] shadow-2xl shadow-indigo-200 mt-6 flex items-center justify-center gap-4 active:scale-[0.98] transition-all">
                <CheckCircle2 size={24} /> Create Account & Generate Keys
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}