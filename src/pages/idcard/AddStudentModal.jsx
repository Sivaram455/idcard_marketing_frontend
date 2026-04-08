import { useState, useEffect, useRef } from "react";
import { 
    X, UserPlus, Loader2, Check, AlertCircle, 
    Image, Upload, FileSpreadsheet, Download 
} from "lucide-react";
import { apiAddStudent, apiBulkCreateStudents, apiUploadFile, BACKEND_URL } from "../../utils/api";
import * as XLSX from "xlsx";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const EMPTY_STUDENT = {
    admission_no: "", first_name: "", last_name: "",
    class: "", section: "", roll_no: "", dob: "", blood_group: "", photo_url: "",
};
const BASE = BACKEND_URL;

export default function AddStudentModal({ isOpen, onClose, requestId, tenantId, onAdded }) {
    const [mode, setMode] = useState("MANUAL"); // MANUAL or BULK
    const [form, setForm] = useState(EMPTY_STUDENT);
    const [excelRows, setExcelRows] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [photoUploading, setPhotoUploading] = useState(false);
    const fileRefArr = useRef();
    const photoRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setMode("MANUAL");
            setForm(EMPTY_STUDENT);
            setExcelRows(null);
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handlePhoto = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        setPhotoUploading(true);
        try {
            const res = await apiUploadFile(f, "photos");
            set("photo_url", res.data.url);
        } catch { setError("Photo upload failed"); }
        finally { setPhotoUploading(false); e.target.value = ""; }
    };

    const handleUploadExcel = (e) => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const wb = XLSX.read(ev.target.result, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
            const mapped = json.map(r => ({
                admission_no: String(r["Admission No *"] || r["admission_no"] || "").trim(),
                first_name: String(r["First Name *"] || r["first_name"] || "").trim(),
                last_name: String(r["Last Name"] || r["last_name"] || "").trim(),
                class: String(r["Class"] || r["class"] || "").trim(),
                section: String(r["Section"] || r["section"] || "").trim(),
                roll_no: String(r["Roll No"] || r["roll_no"] || "").trim(),
                dob: String(r["DOB (YYYY-MM-DD)"] || r["dob"] || "").trim(),
                blood_group: String(r["Blood Group"] || r["blood_group"] || "").trim()
            })).filter(r => r.admission_no && r.first_name);
            setExcelRows(mapped);
        };
        reader.readAsBinaryString(f);
    };

    const handleAdd = async (e) => {
        if (e) e.preventDefault();
        setBusy(true); setError("");
        try {
            if (mode === "MANUAL") {
                if (!form.admission_no || !form.first_name) throw new Error("Key fields missing.");
                await apiAddStudent({ ...form, request_id: requestId, tenant_id: tenantId });
            } else {
                if (!excelRows?.length) throw new Error("No data detected.");
                await apiBulkCreateStudents(excelRows, tenantId, requestId);
            }
            onAdded?.();
            onClose();
        } catch (err) { setError(err.message); }
        finally { setBusy(false); }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <UserPlus size={20} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase italic">Add Student</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-2 text-rose-600 mb-6">
                            <AlertCircle size={16} />
                            <p className="text-[10px] font-black uppercase tracking-wide">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setMode("MANUAL")} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${mode === 'MANUAL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>Manual Grid</button>
                        <button onClick={() => setMode("BULK")} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${mode === 'BULK' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>Bulk Ingestion</button>
                    </div>

                    {mode === "MANUAL" ? (
                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <F label="Admission No *" value={form.admission_no} onChange={v => set("admission_no", v)} placeholder="ADM001" />
                                <F label="First Name *" value={form.first_name} onChange={v => set("first_name", v)} placeholder="Ravi" />
                                <F label="Last Name" value={form.last_name} onChange={v => set("last_name", v)} placeholder="Kumar" />
                                <F label="Roll No" value={form.roll_no} onChange={v => set("roll_no", v)} placeholder="01" />
                                <F label="Class" value={form.class} onChange={v => set("class", v)} placeholder="10" />
                                <F label="Section" value={form.section} onChange={v => set("section", v)} placeholder="A" />
                                <F label="DOB" value={form.dob} onChange={v => set("dob", v)} type="date" />
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">Blood Group</label>
                                    <select value={form.blood_group} onChange={e => set("blood_group", e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all">
                                        <option value="">—</option>
                                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Identity Photo</label>
                                {form.photo_url ? (
                                    <div className="relative w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm transition-transform hover:scale-105 p-1">
                                        <img src={form.photo_url.startsWith("http") ? form.photo_url : `${BASE}${form.photo_url}`} alt="p" className="w-full h-full object-cover rounded-xl" />
                                        <button type="button" onClick={() => set("photo_url", "")} className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-1 text-rose-500 shadow-sm"><X size={12} /></button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => photoRef.current?.click()} disabled={photoUploading}
                                        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all bg-slate-50/50 hover:bg-white group">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                          {photoUploading ? <Loader2 size={16} className="animate-spin text-indigo-600" /> : <Upload size={16} />}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{photoUploading ? 'Uploading...' : 'Transmit Passport Photo'}</span>
                                    </button>
                                )}
                                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {!excelRows ? (
                                <div className="py-12 flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-2">
                                        <FileSpreadsheet size={32} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[240px]">Upload production manifest (XLSX) to synchronize entire student database.</p>
                                    <div className="flex items-center gap-3 w-full max-w-sm pt-4">
                                        <button onClick={() => fileRefArr.current?.click()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                            <Upload size={14} /> Import Request
                                        </button>
                                        <button onClick={() => {
                                            const ws = XLSX.utils.aoa_to_sheet([["Admission No *", "First Name *", "Last Name", "Class", "Section", "Roll No", "DOB (YYYY-MM-DD)", "Blood Group"]]);
                                            const wb = XLSX.utils.book_new();
                                            XLSX.utils.book_append_sheet(wb, ws, "Students");
                                            XLSX.writeFile(wb, "Add_Students_Blueprint.xlsx");
                                        }} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                    <input ref={fileRefArr} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{excelRows.length} Records Detected in Buffer</p>
                                        <button onClick={() => setExcelRows(null)} className="text-[10px] font-black text-rose-500 uppercase italic">Flush Buffer</button>
                                    </div>
                                    <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto bg-slate-50/30">
                                        <table className="w-full text-left text-[10px] uppercase font-bold text-slate-600 italic">
                                            <tbody className="divide-y divide-slate-100">
                                                {excelRows.map((r, i) => (
                                                    <tr key={i} className="hover:bg-white transition-colors">
                                                        <td className="px-4 py-2 border-r border-slate-100/50 w-24 text-slate-900">{r.admission_no}</td>
                                                        <td className="px-4 py-2">{r.first_name} {r.last_name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">Abort Action</button>
                    <button onClick={handleAdd} disabled={busy || (mode === 'BULK' && !excelRows)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} strokeWidth={2.5} />}
                        Authorize Production Addition
                    </button>
                </div>
            </div>
        </div>
    );
}

function F({ label, value, onChange, placeholder, type = "text" }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">{label}</label>
            <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300" />
        </div>
    );
}
