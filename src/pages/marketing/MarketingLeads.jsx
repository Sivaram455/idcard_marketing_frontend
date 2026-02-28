import { Search, MoreVertical, ExternalLink } from "lucide-react";

export default function MarketingLeads() {
  const leads = [
    { school: "Global Tech School", board: "CBSE", strength: 1200, status: "Contacted" },
    { school: "Little Hearts", board: "State", strength: 500, status: "New" },
    { school: "Royal Academy", board: "ICSE", strength: 900, status: "Closed" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">Database of Leads</h2>
        <div className="relative w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm outline-none" placeholder="Search school..." />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">School Name</th>
              <th className="px-8 py-5">Strength</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.map((lead, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-800">{lead.school}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase">{lead.board}</p>
                </td>
                <td className="px-8 py-6 text-slate-600 font-bold">{lead.strength}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                    lead.status === 'Contacted' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-slate-300 hover:text-indigo-600"><ExternalLink size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}