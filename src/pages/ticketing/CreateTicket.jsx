import { useState, useEffect } from "react";
import { 
    Plus, Ticket, Send, ArrowLeft, 
    Link, FileText, AlertTriangle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCreateTicket, apiGetTenants, apiUploadFile } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../auth/AuthContext";

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
    const { showToast } = useToast();

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'GMMC_ADMIN') {
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
                navigate("/ticketing");
            }
        } catch (err) {
            showToast(err.message || "Failed to create ticket", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <button 
                onClick={() => navigate("/ticketing")}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors mb-6 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Return to Dashboard
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="bg-amber-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Plus size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">New Support Ticket</h1>
                            <p className="text-amber-100/80 text-sm mt-1">Please provide detailed information about your issue.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Issue Title</label>
                            <input 
                                required
                                type="text" 
                                placeholder="E.g. Student ID generator error"
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 transition-all focus:bg-white"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Priority Level</label>
                            <select 
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 transition-all font-medium text-gray-600 focus:bg-white"
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="LOW">Low - General Question</option>
                                <option value="MEDIUM">Medium - Normal Issue</option>
                                <option value="HIGH">High - Major Feature Block</option>
                                <option value="CRITICAL">Critical - System Down</option>
                            </select>
                        </div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'GMMC_ADMIN') && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Affected School / Tenant</label>
                            <select 
                                required
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 transition-all font-medium text-gray-600 focus:bg-white"
                                value={formData.tenant_id}
                                onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                            >
                                <option value="">Select Tenant...</option>
                                <option value="0">System-wide (Internal)</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Problem Description</label>
                        <textarea 
                            required
                            rows="6"
                            placeholder="Describe the issue in detail. What happened? How to reproduce? Any error messages?"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 transition-all resize-none focus:bg-white"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                        <AlertTriangle className="text-rose-500 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">Developer Tip</p>
                            <p className="text-[11px] text-rose-600/80 mt-1 leading-relaxed">
                                Screenshots or video recordings help us resolve issues 70% faster. 
                                Although this form doesn't support direct uploads yet, please provide links to Google Drive or other storage if possible.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 relative">
                            <label className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer text-sm font-bold border border-indigo-100">
                                <FileText size={16} />
                                {file ? 'Change Attachment' : 'Add Attachment'}
                                <input 
                                    type="file" 
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </label>
                            {file && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                    <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{file.name}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setFile(null)}
                                        className="text-red-500 hover:text-red-700 font-bold text-xs px-1"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            <Send size={18} />
                            {loading ? "Submitting..." : "Send Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
