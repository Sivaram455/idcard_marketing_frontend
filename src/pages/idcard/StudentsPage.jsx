import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
    apiGetStudentsByRequest, apiBulkCreateStudents,
    apiAddStudent, apiDeleteStudent, apiUploadFile, BACKEND_URL
} from "../../utils/api";
import * as XLSX from "xlsx";
import {
    Upload, UserPlus, Trash2, Download, FileSpreadsheet,
    Loader2, Check, X, AlertCircle, ChevronLeft, Users, Image, Maximize2, ExternalLink
} from "lucide-react";
import ImageModal from "./ImageModal";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const EMPTY_STUDENT = {
    admission_no: "", first_name: "", last_name: "",
    class: "", section: "", roll_no: "", dob: "", blood_group: "", photo_url: "",
};
const BASE = BACKEND_URL;

// ── Photo upload button with preview ─────────────────────────────────────────
function PhotoPicker({ value, onChange }) {
    const ref = useRef();
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState("");

    const handle = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setErr("JPG, PNG or WebP only"); return;
        }
        if (file.size > 5 * 1024 * 1024) { setErr("Max 5 MB"); return; }
        setUploading(true); setErr("");
        try {
            const res = await apiUploadFile(file, "photos");
            onChange(res.data.url);
        } catch (e) { setErr("Upload failed"); }
        finally { setUploading(false); e.target.value = ""; }
    };

    return (
        <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Passport Photo <span className="opacity-50">(max 5MB)</span>
            </label>
            {value ? (
                <div className="flex items-center gap-4 border-2 border-slate-100 rounded-2xl p-2 bg-white shadow-sm group">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-50 flex-shrink-0">
                        <img src={`${BASE}${value}`} alt="photo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{value.split("/").pop()}</p>
                    </div>
                    <button type="button" onClick={() => onChange("")}
                        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
                    className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-white text-slate-300 hover:text-indigo-600 py-8 rounded-[2rem] transition-all disabled:opacity-60 group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                        {uploading ? <Loader2 size={20} className="animate-spin text-indigo-600" /> : <Image size={20} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{uploading ? 'Transmitting...' : 'Authorize Photo Upload'}</span>
                </button>
            )}
            {err && <p className="text-[10px] font-black text-rose-500 mt-2 px-2 uppercase tracking-wide">{err}</p>}
            <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handle} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function StudentsPage() {
    const { requestId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileRef = useRef();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(EMPTY_STUDENT);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // Image Modal State
    const [previewImg, setPreviewImg] = useState({ open: false, url: "", title: "" });
    const openPreview = (url, title) => setPreviewImg({ open: true, url, title });
    const closePreview = () => setPreviewImg({ ...previewImg, open: false });

    const load = () => {
        setLoading(true);
        apiGetStudentsByRequest(requestId)
            .then((r) => setStudents(r.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };
    useEffect(load, [requestId]);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleAddSingle = async (e) => {
        e.preventDefault();
        if (!form.admission_no || !form.first_name) { setError("Admission No and First Name are required."); return; }
        setSaving(true); setError("");
        try {
            await apiAddStudent({ ...form, request_id: requestId, tenant_id: user?.tenant_id });
            setSuccess("Entry Logged.");
            setForm(EMPTY_STUDENT);
            setShowAdd(false);
            load();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Confirm entry deletion?")) return;
        setDeleting(id);
        try { await apiDeleteStudent(id); load(); }
        catch (err) { alert(err.message); }
        finally { setDeleting(null); }
    };

    // ── Excel ────────────────────────────────────────────────────
    const downloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            ["Admission No *", "First Name *", "Last Name", "Class", "Section", "Roll No", "DOB (YYYY-MM-DD)", "Blood Group", "Photo URL"],
            ["ADM001", "Ravi", "Kumar", "10", "A", "1", "2009-04-15", "O+", "https://example.com/photo.jpg"],
        ]);
        ws["!cols"] = Array(9).fill({ wch: 22 });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Operational_Template.xlsx");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const wb = XLSX.read(ev.target.result, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
            const mapped = rows.map((r) => ({
                admission_no: String(r["Admission No *"] || r["admission_no"] || "").trim(),
                first_name: String(r["First Name *"] || r["first_name"] || "").trim(),
                last_name: String(r["Last Name"] || r["last_name"] || "").trim(),
                class: String(r["Class"] || r["class"] || "").trim(),
                section: String(r["Section"] || r["section"] || "").trim(),
                roll_no: String(r["Roll No"] || r["roll_no"] || "").trim(),
                dob: String(r["DOB (YYYY-MM-DD)"] || r["dob"] || "").trim(),
                blood_group: String(r["Blood Group"] || r["blood_group"] || "").trim(),
                photo_url: String(r["Photo URL"] || r["photo_url"] || "").trim(),
            })).filter((r) => r.admission_no && r.first_name);
            setPreview(mapped);
        };
        reader.readAsBinaryString(file);
        e.target.value = "";
    };

    const handleBulkUpload = async () => {
        if (!preview?.length) return;
        setUploading(true); setError("");
        try {
            await apiBulkCreateStudents(preview, user?.tenant_id, requestId);
            setSuccess(`Manifest Synchronized: ${preview.length} Entries.`);
            setPreview(null);
            load();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) { setError(err.message); }
        finally { setUploading(false); }
    };

    // ─────────────────────────────────────────────────────────────
    return (
        <div className="p-8 space-y-10 min-h-screen bg-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-all border border-slate-100">
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Student <span className="text-blue-600">Manifest</span></h1>
                        <p className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest opacity-60">
                            Request ID: {requestId} // Buffer: {students.length} Entries
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={downloadTemplate}
                        className="bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 flex items-center gap-2">
                        <Download size={14} strokeWidth={3} /> Get Blueprint
                    </button>
                    <button onClick={() => fileRef.current?.click()}
                        className="bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 flex items-center gap-2">
                        <FileSpreadsheet size={14} strokeWidth={3} /> Sync Excel
                    </button>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                    <button onClick={() => { setShowAdd(true); setError(""); setForm(EMPTY_STUDENT); }}
                        className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-100 flex items-center gap-2">
                        <UserPlus size={14} strokeWidth={3} /> Log Entry
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && <div className="flex items-center gap-3 bg-rose-600 text-white rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-100 italic"><AlertCircle size={18} strokeWidth={3}/>{error}</div>}
            {success && <div className="flex items-center gap-3 bg-emerald-600 text-white rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-100 italic"><Check size={18} strokeWidth={3}/>{success}</div>}

            {/* Excel Preview */}
            {preview && (
                <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200">
                    <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">{preview.length} Entries Ready for Ingestion</p>
                        <div className="flex gap-4">
                            <button onClick={() => setPreview(null)} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">Discard Buffer</button>
                            <button onClick={handleBulkUpload} disabled={uploading}
                                className="bg-white text-slate-900 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 flex items-center gap-3">
                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} strokeWidth={3} />} Authorize Ingestion
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto scrollbar-hide">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 sticky top-0 backdrop-blur-xl">
                                <tr>{["Identity", "ID", "Name", "Class", "Sec", "Roll"].map((h) => (
                                    <th key={h} className="px-10 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest italic">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {preview.map((s, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-10 py-4">
                                            {s.photo_url
                                                ? <img src={s.photo_url} alt="" className="w-10 h-10 object-cover rounded-xl border border-white/10" onError={(e) => { e.target.style.display = "none"; }} />
                                                : <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><Image size={16} className="text-white/10" /></div>
                                            }
                                        </td>
                                        <td className="px-10 py-4 text-[10px] font-black text-white italic">{s.admission_no}</td>
                                        <td className="px-10 py-4 text-[10px] font-black text-white uppercase italic">{s.first_name} {s.last_name}</td>
                                        <td className="px-10 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{s.class}</td>
                                        <td className="px-10 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{s.section}</td>
                                        <td className="px-10 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{s.roll_no}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Student Form */}
            {showAdd && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-10 shadow-inner">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Manual Entry Node</h2>
                        <button onClick={() => setShowAdd(false)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-xl border border-slate-100"><X size={18} strokeWidth={3}/></button>
                    </div>
                    <form onSubmit={handleAddSingle} className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <F label="Admission No *" value={form.admission_no} ch={(v) => set("admission_no", v)} ph="ADM001" />
                            <F label="First Name *" value={form.first_name} ch={(v) => set("first_name", v)} ph="RAVI" />
                            <F label="Last Name" value={form.last_name} ch={(v) => set("last_name", v)} ph="KUMAR" />
                            <F label="Roll No" value={form.roll_no} ch={(v) => set("roll_no", v)} ph="01" />
                            <F label="Class" value={form.class} ch={(v) => set("class", v)} ph="10" />
                            <F label="Section" value={form.section} ch={(v) => set("section", v)} ph="A" />
                            <F label="DOB" value={form.dob} ch={(v) => set("dob", v)} ph="YYYY-MM-DD" type="date" />
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1 italic">Blood Group</label>
                                <select value={form.blood_group} onChange={(e) => set("blood_group", e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 text-xs font-black uppercase italic text-slate-900 outline-none focus:border-blue-600 transition-all shadow-sm">
                                    <option value="">—</option>
                                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <PhotoPicker
                            value={form.photo_url}
                            onChange={(url) => set("photo_url", url)}
                        />

                        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                            <button type="button" onClick={() => setShowAdd(false)}
                                className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Abort</button>
                            <button type="submit" disabled={saving}
                                className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-100 flex items-center gap-3">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />} Log Student Node
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Students Table */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-300">
                        <Loader2 size={40} className="animate-spin text-blue-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Syncing Manifest...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="py-40 text-center flex flex-col items-center">
                        <Users size={80} strokeWidth={1} className="mb-6 text-slate-100" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Manifest Zero // Buffer Null</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    {["Identity", "ID Node", "Full Name", "Level", "Section", "Roll", "Ingestion", "Type", ""].map((h) => (
                                        <th key={h} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((s) => {
                                    const photo = s.photo_url?.startsWith("http") ? s.photo_url : `${BASE}${s.photo_url}`;
                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                                            <td className="px-8 py-5">
                                                {s.photo_url ? (
                                                    <div 
                                                        onClick={() => openPreview(photo, `${s.first_name} ${s.last_name}`)}
                                                        className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 bg-white shadow-sm cursor-zoom-in group-hover:scale-110 group-hover:border-blue-200 transition-all"
                                                    >
                                                        <img src={photo} alt={s.first_name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-300 uppercase italic">
                                                        {s.first_name?.[0]}{s.last_name?.[0]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 font-black text-slate-900 text-[11px] italic tracking-tight uppercase">{s.admission_no}</td>
                                            <td className="px-8 py-5 font-black text-slate-900 uppercase italic text-xs">{s.first_name} {s.last_name}</td>
                                            <td className="px-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">L-{s.class || "—"}</td>
                                            <td className="px-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">S-{s.section || "—"}</td>
                                            <td className="px-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">#{s.roll_no || "—"}</td>
                                            <td className="px-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">{s.dob ? new Date(s.dob).toLocaleDateString("en-GB") : "—"}</td>
                                            <td className="px-8 py-5">
                                                {s.blood_group ? (
                                                    <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-lg italic uppercase shadow-sm border border-rose-100">{s.blood_group}</span>
                                                ) : (
                                                    <span className="text-slate-200">—</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50">
                                                    {deleting === s.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2.5}/>}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <ImageModal 
                isOpen={previewImg.open} 
                onClose={closePreview} 
                imageUrl={previewImg.url} 
                title={previewImg.title} 
            />
        </div>
    );
}

function F({ label, value, ch, ph, type = "text" }) {
    return (
        <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">{label}</label>
            <input type={type} placeholder={ph} value={value || ""} onChange={(e) => ch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 text-xs font-black uppercase italic text-slate-900 outline-none focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-200" />
        </div>
    );
}
