import { useState, useEffect, useRef } from "react";
import {
    Plus, Ticket, Send, X,
    Link, FileText, AlertTriangle, Loader2, ShieldCheck, Info
} from "lucide-react";
import { apiCreateTicket, apiGetTenants, apiUploadFile } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../auth/AuthContext";

export default function CreateTicketModal({ isOpen, onClose, onCreated }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "LOW",
        tenant_id: ""
    });
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const { user } = useAuth();
    const { showToast } = useToast();
    const fileRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setFormData({ title: "", description: "", priority: "LOW", tenant_id: user?.tenant_id || "" });
            setFile(null);
            if (user?.role === 'admin' || user?.role === 'GMMC_ADMIN') {
                fetchTenants();
            }
        }
    }, [isOpen, user]);

    const fetchTenants = async () => {
        try {
            const data = await apiGetTenants();
            if (data.success) setTenants(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let uploadedAttachments = [];

            if (file) {
                const uploadRes = await apiUploadFile(file, 'general');
                if (uploadRes.success) {
                    uploadedAttachments.push(uploadRes.data);
                }
            }

            const payload = { ...formData, attachments: uploadedAttachments };
            const data = await apiCreateTicket(payload);

            if (data.success) {
                showToast("Ticket created successfully!", "success");
                onCreated?.();
                onClose();
            }
        } catch (err) {
            showToast(err.message || "Failed to create ticket", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                            <Ticket size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 italic uppercase tracking-tighter">
                                Initialize <span className="text-amber-600">Support</span>
                            </h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">GMMC Intelligence Network</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-rose-50 transition-all">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 block">Subject Line</label>
                            <input
                                required
                                type="text"
                                placeholder="Summary of issue"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all placeholder:text-slate-300"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 block">Priority</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="LOW">Low - General</option>
                                    <option value="MEDIUM">Medium - Urgent</option>
                                    <option value="HIGH">High - Execution Block</option>
                                    <option value="CRITICAL">Critical - System Offline</option>
                                </select>
                                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'GMMC_ADMIN') && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 block">Target Production Environment</label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                    value={formData.tenant_id}
                                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                                >
                                    <option value="">Select Target...</option>
                                    <option value="0">Global System Core</option>
                                    {tenants?.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 block">Description</label>
                        <textarea
                            required
                            rows="2"
                            placeholder="Brief breakdown of the anomaly..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all resize-none italic"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl flex items-start gap-3">
                        <Info className="text-amber-500 flex-shrink-0" size={14} />
                        <div>
                            <p className="text-[9px] font-black text-amber-800 uppercase tracking-wide">Optimization Directive</p>
                            <p className="text-[9px] text-amber-600/80 font-bold mt-0.5 leading-relaxed tracking-wider uppercase">
                                Attach relevant artifacts below.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-indigo-600 transition-all text-[9px] font-black uppercase tracking-widest"
                            >
                                <Link size={12} />
                                {file ? 'Update' : 'Attach'}
                            </button>
                            {file && (
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                    <span className="text-[8px] font-black text-slate-500 truncate max-w-[80px]">{file.name}</span>
                                    <button type="button" onClick={() => setFile(null)} className="text-rose-400 hover:text-rose-600">&times;</button>
                                </div>
                            )}
                            <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        </div>

                        <div className="flex items-center gap-3">
                            <button type="button" onClick={onClose} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Discard</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                Dispatch
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
