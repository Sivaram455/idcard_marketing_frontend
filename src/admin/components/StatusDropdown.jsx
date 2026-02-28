export default function StatusDropdown({ value, onChange }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted": return "bg-gray-100 text-gray-700 border-gray-200";
      case "In Design": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Approved": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Printing": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Dispatched": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Completed": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  const statuses = ["Submitted", "In Design", "Approved", "Printing", "Dispatched", "Completed"];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none border px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all outline-none pr-8 ${getStatusColor(value)}`}
      >
        {statuses.map((status) => (
          <option key={status} value={status} className="bg-white text-slate-800">
            {status}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <ChevronRight size={12} className="rotate-90" />
      </div>
    </div>
  );
}