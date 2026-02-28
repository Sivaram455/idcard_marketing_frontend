import { PhoneCall, Calendar, Clock } from "lucide-react";

export default function FollowUps() {
  const tasks = [
    { school: "Green Valley High", time: "11:00 AM", person: "Principal Sharma" },
    { school: "St. Mary School", time: "03:30 PM", person: "Admin Head" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-slate-800">Today's Outreach</h1>
      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-6">
              <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">{task.school}</h3>
                <div className="flex gap-4 mt-1">
                  <p className="text-[10px] font-black uppercase text-slate-400">Time: {task.time}</p>
                  <p className="text-[10px] font-black uppercase text-indigo-500">Contact: {task.person}</p>
                </div>
              </div>
            </div>
            <button className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
              <PhoneCall size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}