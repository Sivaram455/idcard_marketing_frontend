import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { apiCreateRequest, apiBulkCreateStudents, apiAddStudent, apiUploadFile, apiGetTenants } from "../../utils/api";
import * as XLSX from "xlsx";
import {
    ChevronLeft, ChevronRight, Check, Upload, Download,
    UserPlus, Trash2, FileSpreadsheet, Loader2, AlertCircle,
    Image, X, CheckCircle, FileArchive, Layers, Info, Send
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const BLANK_ROW = () => ({
    _id: Math.random(),
    admission_no: "", first_name: "", last_name: "",
    class: "", section: "", roll_no: "", dob: "", blood_group: "",
    photo_url: "",          
    _photoUploading: false, 
});

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BASE = "http://localhost:5001";

// ── Reusable Field Component ──────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", optional = false }) {
    return (
        <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">
                {label} {optional && <span className="text-slate-200 lowercase italic">— optional</span>}
            </label>
            <input 
                type={type} 
                value={value || ""} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
            />
        </div>
    );
}

// ── Refactored Image Upload Field ─────────────────────────────────
function PremiumImageUpload({ label, folder, value, onChange, description }) {
    const ref = useRef();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handle = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        if (!ALLOWED.includes(f.type)) { setError("Invalid format."); e.target.value = ""; return; }
        if (f.size > MAX_BYTES) { setError("Too large."); e.target.value = ""; return; }
        setUploading(true); setError("");
        try {
            const res = await apiUploadFile(f, folder);
            onChange(res.data.url);
        } catch (e) { setError("Failed."); }
        finally { setUploading(false); e.target.value = ""; }
    };

    return (
        <div className="group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2 block">{label}</label>
            {value ? (
                <div className="relative aspect-video rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden group-hover:border-indigo-200 transition-all shadow-sm">
                    <img src={value.startsWith("http") ? value : `${BASE}${value}`} alt={label} className="w-full h-full object-contain p-2" />
                    <button onClick={() => onChange("")}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-md rounded-xl p-1.5 text-slate-400 hover:text-red-500 transition-all shadow-sm">
                        <X size={14} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-white/80 py-1.5 text-center border-t border-slate-100">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Ready</span>
                    </div>
                </div>
            ) : (
                <button onClick={() => ref.current?.click()} disabled={uploading}
                    className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {uploading ? <Loader2 size={16} className="animate-spin text-indigo-600" /> : <Upload size={16} className="text-slate-300 group-hover:text-indigo-600" />}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-[0.2em]">{uploading ? 'Processing...' : 'Upload Asset'}</span>
                    {description && <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">{description}</p>}
                </button>
            )}
            {error && <p className="text-[8px] text-red-500 font-black uppercase mt-1 px-1">{error}</p>}
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
        </div>
    );
}

// ── Main CreateRequestModal Component ─────────────────────────────
export default function CreateRequestModal({ isOpen, onClose, onCreated }) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [info, setInfo] = useState({
        remarks: "",
        school_logo_url: "",
        principal_signature_url: "",
        old_id_card_url: "",
        old_lanyard_url: "",
        photos_zip_url: "",
        tenant_id: user?.tenant_id || "", 
    });
    const [tenants, setTenants] = useState([]);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [submittingInfo, setSubmittingInfo] = useState(false);
    const [requestId, setRequestId] = useState(null);
    const [requestNo, setRequestNo] = useState(null);
    const [rows, setRows] = useState([BLANK_ROW()]);
    const [savingRows, setSavingRows] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [excelRows, setExcelRows] = useState(null);
    const [uploadingXls, setUploadingXls] = useState(false);
    
    const fileRef = useRef();

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1); 
            setInfo({ 
                remarks: "", 
                school_logo_url: "", 
                principal_signature_url: "", 
                old_id_card_url: "", 
                old_lanyard_url: "", 
                photos_zip_url: "", 
                tenant_id: user?.tenant_id || "" 
            }); 
            setRequestId(null); setRequestNo(null); setRows([BLANK_ROW()]); setExcelRows(null); setError(""); setSuccess("");
            
            const adminRoles = ['admin', 'GMMC_ADMIN', 'GMMC-Admin', 'gmmc_admin', 'operations', 'marketer'];
            if (adminRoles.includes(user?.role?.toLowerCase()) || adminRoles.includes(user?.role)) {
                setLoadingTenants(true);
                apiGetTenants().then(res => {
                    console.log("Tenants fetched:", res.data);
                    setTenants(res.data || []);
                }).finally(() => setLoadingTenants(false));
            }
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const createRequestIfNeeded = async () => {
        if (requestId) return requestId;
        if (!info.tenant_id && ['admin', 'GMMC_ADMIN'].includes(user?.role)) {
            setError("Please select a school to proceed.");
            return null;
        }
        try {
            const res = await apiCreateRequest({
                tenant_id: info.tenant_id,
                remarks: info.remarks || null,
                school_logo_url: info.school_logo_url || null,
                principal_signature_url: info.principal_signature_url || null,
                old_id_card_url: info.old_id_card_url || null,
                old_lanyard_url: info.old_lanyard_url || null,
                photos_zip_url: info.photos_zip_url || null,
            });
            setRequestId(res.data?.id);
            setRequestNo(res.data?.request_no);
            return res.data?.id;
        } catch (err) { throw new Error(err.message); }
    };

    const handleNextStep1 = async () => {
        setSubmittingInfo(true); setError("");
        try {
            const activeId = await createRequestIfNeeded();
            if (activeId) setStep(2);
        } catch (err) { setError(err.message); }
        finally { setSubmittingInfo(false); }
    };

    const handleUploadExcel = (e) => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const wb = XLSX.read(ev.target.result, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
            const mapped = json.map(r => ({
                _id: Math.random(),
                admission_no: String(r["Admission No *"] || r["admission_no"] || "").trim(),
                first_name: String(r["First Name *"] || r["first_name"] || "").trim(),
                last_name: String(r["Last Name"] || r["last_name"] || "").trim(),
                class: String(r["Class"] || r["class"] || "").trim(),
                section: String(r["Section"] || r["section"] || "").trim(),
                roll_no: String(r["Roll No"] || r["roll_no"] || "").trim(),
                dob: String(r["DOB (YYYY-MM-DD)"] || r["dob"] || "").trim(),
                blood_group: String(r["Blood Group"] || r["blood_group"] || "").trim(),
                photo_url: String(r["Photo URL"] || r["photo_url"] || "").trim(),
                _photoUploading: false,
            })).filter(r => r.admission_no && r.first_name);
            setExcelRows(mapped);
        };
        reader.readAsBinaryString(f);
        e.target.value = "";
    };

    const handleSaveExcel = async () => {
        if (!excelRows?.length) return;
        setUploadingXls(true); setError("");
        try {
            const activeReqId = await createRequestIfNeeded();
            if (!activeReqId) return;
            await apiBulkCreateStudents(excelRows, info.tenant_id, activeReqId);
            setStep(3);
        } catch (err) { setError(err.message); }
        finally { setUploadingXls(false); }
    };

    const handleSaveManual = async () => {
        const valid = rows.filter(r => r.admission_no.trim() && r.first_name.trim());
        if (!valid.length) { setError("Fill at least one student."); return; }
        setSavingRows(true); setError("");
        try {
            const activeReqId = await createRequestIfNeeded();
            if (!activeReqId) return;
            for (const r of valid) {
                await apiAddStudent({ ...r, request_id: activeReqId, tenant_id: info.tenant_id });
            }
            setStep(3);
        } catch (err) { setError(err.message); }
        finally { setSavingRows(false); }
    };

    const STEPS = ["Request Config", "Student Manifest", "Final Confirmation"];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-4xl h-[95vh] md:h-[85vh] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 overflow-hidden">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Layers size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 italic uppercase tracking-tighter">
                                Initialize <span className="text-indigo-600">Production</span>
                            </h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{user?.tenant_name || "School Operations"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-rose-50 transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-6">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`flex items-center gap-2 transition-opacity ${step === i + 1 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all
                                ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                {step > i+1 ? <Check size={12} strokeWidth={4} /> : i + 1}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{s}</span>
                            {i < STEPS.length - 1 && <div className="w-6 h-px bg-slate-200 ml-2 hidden md:block" />}
                        </div>
                    ))}
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {error && (
                        <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
                            <AlertCircle size={14} />
                            <p className="text-[9px] font-black uppercase tracking-wide">{error}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-12">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Directives</h3>
                                    </div>
                                    <textarea 
                                        rows={3} 
                                        placeholder="Enter instructions for production (e.g. Card type, lanyard color, specific batch info)..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none italic"
                                        value={info.remarks}
                                        onChange={(e) => setInfo(p => ({...p, remarks: e.target.value}))}
                                    />
                                </div>
                                {(() => {
                                    const adminRoles = ['admin', 'GMMC_ADMIN', 'GMMC-Admin', 'gmmc_admin', 'operations', 'marketer'];
                                    return adminRoles.includes(user?.role?.toLowerCase()) || adminRoles.includes(user?.role);
                                })() && (
                                    <div className="lg:col-span-12">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Target School / Tenant</h3>
                                        </div>
                                        <div className="relative group/select">
                                            <select
                                                disabled={loadingTenants}
                                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer uppercase italic tracking-widest shadow-sm disabled:opacity-50"
                                                value={info.tenant_id}
                                                onChange={(e) => setInfo(p => ({...p, tenant_id: e.target.value}))}
                                            >
                                                <option value="">{loadingTenants ? "Synchronizing Data..." : "Select Target School..."}</option>
                                                {tenants.map(t => (
                                                    <option key={t.id} value={t.id} className="text-slate-900 bg-white font-bold">{t.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-600 transition-colors">
                                                {loadingTenants ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <ChevronDown size={14} strokeWidth={3} />}
                                            </div>
                                        </div>
                                        {tenants.length === 0 && (
                                            <p className="text-[8px] text-amber-600 font-black uppercase mt-1 px-1 flex items-center gap-1">
                                                <Loader2 size={8} className="animate-spin" /> Fetching school records...
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <PremiumImageUpload label="School Insignia" folder="logos" value={info.school_logo_url} onChange={u => setInfo(p=>({...p, school_logo_url: u}))} description="PNG / SVG / JPG" />
                                    <PremiumImageUpload label="Auth Signature" folder="signatures" value={info.principal_signature_url} onChange={u => setInfo(p=>({...p, principal_signature_url: u}))} description="Clear Background" />
                                    <PremiumImageUpload label="Layout Guide" folder="samples" value={info.old_id_card_url} onChange={u => setInfo(p=>({...p, old_id_card_url: u}))} description="Reference Card" />
                                    <PremiumImageUpload label="Supply Sample" folder="lanyards" value={info.old_lanyard_url} onChange={u => setInfo(p=>({...p, old_lanyard_url: u}))} description="Lanyard Color" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {!excelRows ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Manual Card */}
                                    <div className="group bg-white border border-slate-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <UserPlus size={24} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 italic uppercase leading-none">Manual Entry</h3>
                                        <p className="text-slate-400 text-[9px] font-bold leading-relaxed mt-1 uppercase tracking-wide">Enter student data manually into our production manifest.</p>
                                        <div className="flex-1" />
                                        <button onClick={() => setExcelRows([])} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                                            Launch Manifest
                                        </button>
                                    </div>

                                    {/* Excel Card */}
                                    <div className="group bg-white border border-slate-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <FileSpreadsheet size={24} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 italic uppercase leading-none">Excel Import</h3>
                                        <p className="text-slate-400 text-[9px] font-bold leading-relaxed mt-1 uppercase tracking-wide">Upload a batch file to populate the production manifest instantly.</p>
                                        <div className="flex-1" />
                                        <div className="flex items-center gap-2 mt-4 w-full">
                                            <button 
                                                onClick={() => fileRef.current?.click()} 
                                                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Upload size={12} /> Import
                                            </button>
                                            <button 
                                                className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px]"
                                                title="Download Blueprint"
                                                onClick={() => {
                                                    const ws = XLSX.utils.aoa_to_sheet([["Admission No *", "First Name *", "Last Name", "Class", "Section", "Roll No", "DOB (YYYY-MM-DD)", "Blood Group"]]);
                                                    const wb = XLSX.utils.book_new();
                                                    XLSX.utils.book_append_sheet(wb, ws, "Students");
                                                    XLSX.writeFile(wb, "Manifest_Blueprint.xlsx");
                                                }}
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase italic leading-none">Manifest Registry</h3>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{excelRows.length === 0 ? 'Cloud Grid Buffered' : `${excelRows.length} Nodes detected`}</p>
                                        </div>
                                        <button onClick={() => setExcelRows(null)} className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:underline">Switch Mode</button>
                                    </div>
                                    
                                    <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto shadow-inner">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50/50 sticky top-0 z-10">
                                                <tr className="border-b border-slate-100">
                                                    <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Adm No</th>
                                                    <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</th>
                                                    <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Class/Sec</th>
                                                    <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Blood Unit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {excelRows.length === 0 ? (
                                                  <tr className="bg-slate-50/30">
                                                    <td colSpan={4} className="p-10 text-center">
                                                      <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Input Buffer Initializing...</p>
                                                    </td>
                                                  </tr>
                                                ) : (
                                                  excelRows.map((r, i) => (
                                                      <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                                          <td className="px-4 py-1.5 text-[10px] font-black text-slate-900 leading-none">{r.admission_no}</td>
                                                          <td className="px-4 py-1.5 text-[10px] font-black text-slate-600 italic uppercase leading-none">{r.first_name} {r.last_name}</td>
                                                          <td className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase leading-none">{r.class}-{r.section}</td>
                                                          <td className="px-4 py-1.5 text-[9px] font-black text-rose-500 uppercase leading-none">{r.blood_group || '—'}</td>
                                                      </tr>
                                                  ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
                             <div className="relative">
                                <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-900/5 ring-8 ring-emerald-50 animate-bounce">
                                    <CheckCircle size={64} strokeWidth={1.5} />
                                </div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                                    <Info size={24} className="text-indigo-600" />
                                </div>
                             </div>
                             <div>
                                <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
                                    Production <span className="text-indigo-600">Authorized</span>
                                </h3>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Reference ID: <span className="text-slate-900">{requestNo}</span></p>
                             </div>
                             <p className="max-w-md text-slate-500 text-sm font-medium leading-relaxed">
                                Your ID card production request has been successfully queued. GMMC administrators will now review the digital assets and manifest data.
                             </p>
                             <div className="pt-6 w-full max-w-sm">
                                <button 
                                    onClick={() => { onCreated?.(); onClose(); }} 
                                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 active:scale-95 transition-all"
                                >
                                    Return to Operations
                                </button>
                             </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer (Conditional) */}
                {step < 3 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                        <button 
                            disabled={step === 1 || submittingInfo || savingRows || uploadingXls} 
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 disabled:opacity-0 transition-all font-outfit"
                        >
                            <ChevronLeft size={14} strokeWidth={4} /> Return
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={onClose} 
                                className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-all font-outfit"
                            >
                                Cancel Order
                            </button>
                            {step === 1 && (
                                <button 
                                    onClick={handleNextStep1} 
                                    disabled={submittingInfo}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 font-outfit"
                                >
                                    {submittingInfo ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} strokeWidth={4} />}
                                    Validate & Proceed
                                </button>
                            )}
                            {step === 2 && (
                                <button 
                                    onClick={excelRows?.length > 0 ? handleSaveExcel : handleSaveManual} 
                                    disabled={submittingInfo || savingRows || uploadingXls}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.15em] shadow-xl shadow-slate-100 flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 font-outfit"
                                >
                                    {(savingRows || uploadingXls) ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={3} />}
                                    Finalize Batch
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
