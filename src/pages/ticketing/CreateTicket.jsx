import { useState, useEffect } from "react";
import {
    Plus, Ticket, Send, ArrowLeft,
    Link, FileText, AlertTriangle, Loader2,
    Shield, User, Building2, AlignLeft,
    CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCreateTicket, apiGetTenants, apiUploadFile } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../auth/AuthContext";

const inputCls = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm";
const labelCls = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5";

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className={labelCls}>{label}</label>
        {children}
    </div>
);

export default function CreateTicket() {
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
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        if (['admin', 'GMMC_ADMIN'].includes(user?.role)) {
            fetchTenants();
        } else {
            setFormData(prev => ({ ...prev, tenant_id: user?.tenant_id }));
        }
    }, [user]);

    const fetchTenants = async () => {
        try {
            const data = await apiGetTenants();
            if (data.success) setTenants(data.tenants);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
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
                toast.success("Ticket generated successfully!");
                setTimeout(() => navigate("/ticketing"), 1000);
            }
        } catch (err) {
            toast.error(err.message || "Failed to submit case");
        } finally {
            setLoading(false);
        }
    };

    const poppins = { fontFamily: "'Poppins', sans-serif" };

    return (
        <div style={poppins} className="p-5 max-w-4xl animate-in fade-in duration-500 pb-12 mx-auto">

            {/* ── Heading ── */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/ticketing")}
                    className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div>
                    <h1 className="text-base font-extrabold text-gray-900 tracking-tight leading-none uppercase italic">Open Support Case</h1>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        Direct access to engineering team <span className="text-gray-200">|</span> Priority handling
                    </p>
                </div>
            </div>

            {/* ── Form Card ── */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                    {/* Primary Issue Details */}
                    <div className="md:col-span-2 p-6 space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <AlignLeft size={13} className="text-indigo-500" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clinical Description</h3>
                        </div>

                        <Field label="Case Title *">
                            <input
                                required
                                type="text"
                                className={inputCls}
                                placeholder="Succinct summary of the technical issue..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Field>

                        <Field label="Comprehensive Details *">
                            <textarea
                                required
                                rows="8"
                                className={`${inputCls} resize-none leading-relaxed italic`}
                                placeholder="Describe the behavior, steps to reproduce, and expected outcome..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Field>

                        {/* File Attachment Area */}
                        <div className="pt-2">
                            <label className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group">
                                <FileText size={16} className="text-slate-400 group-hover:text-indigo-500" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-700 truncate">
                                        {file ? file.name : 'Upload Technical Attachment (Logs, Images)'}
                                    </p>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-tight">Max 5MB per file</p>
                                </div>
                                {file && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                        className="text-rose-500 hover:text-rose-700 font-black text-xs px-2"
                                    >
                                        REMOVE
                                    </button>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Classification & Context */}
                    <div className="p-6 space-y-6 bg-gray-50/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={13} className="text-indigo-500" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Context & SLA</h3>
                        </div>

                        <Field label="System Priority *">
                            <select
                                className={inputCls}
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="LOW">Informational / Query</option>
                                <option value="MEDIUM">Operational Friction</option>
                                <option value="HIGH">Workflow Blocked</option>
                                <option value="CRITICAL">Hard Failure / Downtime</option>
                            </select>
                        </Field>

                        {(['admin', 'GMMC_ADMIN'].includes(user?.role)) && (
                            <Field label="Target Environment *">
                                <select
                                    required
                                    className={inputCls}
                                    value={formData.tenant_id}
                                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                                >
                                    <option value="">Select Target...</option>
                                    <option value="0">Global (Base System)</option>
                                    {tenants?.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Escalation Notice</h4>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                    Critical reports trigger direct alerts to engineers. Please only use for system outages.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform" />
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-200 relative z-10">Verification</h4>
                                <p className="text-[10px] mt-2 font-bold leading-relaxed relative z-10">
                                    Tickets are reviewed within window of 2-4 hours. You'll receive real-time updates in your dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400 font-medium italic">
                        By submitting, you acknowledge this is a persistent technical record.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/ticketing")}
                            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-sm shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 size={13} className="animate-spin" /> Transmitting...</>
                            ) : (
                                <><Plus size={13} /> Submit Case</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
