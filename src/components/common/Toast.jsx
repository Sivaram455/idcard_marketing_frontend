import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

let toastManager = {
  success: () => {},
  error: () => {},
  info: () => {}
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  // Set the singleton reference
  useEffect(() => {
    toastManager.success = (msg) => addToast(msg, 'success');
    toastManager.error = (msg) => addToast(msg, 'error');
    toastManager.info = (msg) => addToast(msg, 'info');
    toastManager.showToast = (msg, type) => addToast(msg, type);
  }, [addToast]);

  return (
    <ToastContext.Provider value={toastManager}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border min-w-[320px] transition-all duration-500 animate-in slide-in-from-right-10 ${
              t.type === 'success' ? 'bg-white border-emerald-100 text-slate-800' :
              t.type === 'error' ? 'bg-white border-rose-100 text-slate-800' :
              'bg-white border-indigo-100 text-slate-800'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              t.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
              t.type === 'error' ? 'bg-rose-50 text-rose-500' :
              'bg-indigo-50 text-indigo-500'
            }`}>
              {t.type === 'success' && <CheckCircle size={20} />}
              {t.type === 'error' && <AlertCircle size={20} />}
              {t.type === 'info' && <Info size={20} />}
            </div>
            
            <div className="flex-1">
              <div className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">
                {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Notification'}
              </div>
              <div className="font-bold text-sm tracking-tight">{t.message}</div>
            </div>
            
            <button onClick={() => removeToast(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// Export a singleton for non-component usage
export const toast = {
  success: (msg) => toastManager.success(msg),
  error: (msg) => toastManager.error(msg),
  info: (msg) => toastManager.info(msg)
};
