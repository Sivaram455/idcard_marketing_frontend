import { Check, Clock, Edit3, Printer, Truck, CheckCircle } from "lucide-react";

export default function StatusTracker({ currentStatus = "Printing" }) {
  const stages = [
    { label: "Submitted", icon: Clock },
    { label: "In Design", icon: Edit3 },
    { label: "Approved", icon: CheckCircle },
    { label: "Printing", icon: Printer },
    { label: "Dispatched", icon: Truck }
  ];

  const currentStep = stages.findIndex(s => s.label === currentStatus);

  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
      <div className="relative flex items-center justify-between w-full">
        
        {/* Background Line (Gray) */}
        <div className="absolute left-0 top-5 w-full h-1 bg-slate-100 z-0 hidden md:block"></div>
        
        {/* Active Progress Line (Indigo) */}
        <div 
          className="absolute left-0 top-5 h-1 bg-indigo-600 z-0 transition-all duration-700 ease-in-out hidden md:block"
          style={{ width: `${(currentStep / (stages.length - 1)) * 100}%` }}
        ></div>

        {stages.map((stage, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center flex-1">
              {/* Step Circle/Icon */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-4
                ${isCompleted ? 'bg-indigo-600 border-white text-white shadow-lg' : 
                  isActive ? 'bg-white border-indigo-600 text-indigo-600 shadow-md scale-110' : 
                  'bg-white border-slate-100 text-slate-300'}
              `}>
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <stage.icon size={18} />}
              </div>
              
              {/* Stage Label */}
              <div className="mt-4 flex flex-col items-center">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${
                  isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {stage.label}
                </p>
                {isActive && (
                  <span className="text-[9px] text-indigo-400 font-bold animate-pulse mt-1">
                    IN PROGRESS
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}