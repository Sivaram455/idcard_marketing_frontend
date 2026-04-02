import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiCreateRequest, apiBulkCreateStudents, apiAddStudent, apiUploadFile, apiGetTenants } from "../../utils/api";
import * as XLSX from "xlsx";
import {
    ChevronLeft, ChevronRight, Check, Upload, Download,
    UserPlus, Trash2, FileSpreadsheet, Loader2, AlertCircle,
    Image, X, CheckCircle, FileArchive, Search, ChevronDown
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const BLANK_ROW = () => ({
    _id: Math.random(),
    admission_no: "", first_name: "", last_name: "",
    class: "", section: "", roll_no: "", dob: "", blood_group: "",
    photo_url: "",          // ← included
    _photoUploading: false, // ← upload state per row
});

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BASE = "http://localhost:5001";

// ── Image upload for school-level assets ──────────────────────────────────────
function ImageUploadField({ label, folder, value, onChange }) {
    const ref = useRef();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [fileSize, setFileSize] = useState(0);
    const [fileName, setFileName] = useState("");

    const handle = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        if (!ALLOWED.includes(f.type)) { setError("JPG, PNG, WebP or GIF only."); e.target.value = ""; return; }
        if (f.size > MAX_BYTES) { setError(`Max ${MAX_MB}MB (yours: ${(f.size / 1024 / 1024).toFixed(1)}MB).`); e.target.value = ""; return; }
        setUploading(true); setError("");
        try {
            const res = await apiUploadFile(f, folder);
            onChange(res.data.url); setFileName(f.name); setFileSize(f.size);
        } catch (e) { setError("Upload failed: " + e.message); }
        finally { setUploading(false); e.target.value = ""; }
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
                {label} <span className="text-gray-400">(optional · max {MAX_MB}MB)</span>
            </label>
            {value ? (
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                    <img src={`${BASE}${value}`} alt={label} className="w-12 h-12 object-contain rounded border border-gray-200 bg-white flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{fileName || value.split("/").pop()}</p>
                        {fileSize > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{(fileSize / 1024).toFixed(0)} KB</p>}
                    </div>
                    <button type="button" onClick={() => { onChange(""); setFileName(""); setFileSize(0); }} className="text-gray-400 hover:text-red-500 flex-shrink-0"><X size={15} /></button>
                </div>
            ) : (
                <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 text-sm py-4 rounded-lg transition-all disabled:opacity-60 group">
                    {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Image size={15} className="group-hover:scale-110 transition-transform" /> Click to upload</>}
                </button>
            )}
            {error && <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"><AlertCircle size={12} />{error}</div>}
            <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handle} />
        </div>
    );
}

// ── File upload for archives ──────────────────────────────────────
function ArchiveUploadField({ label, folder, value, onChange }) {
    const ref = useRef();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [fileSize, setFileSize] = useState(0);
    const [fileName, setFileName] = useState("");

    const handle = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        const validTypes = ["application/zip", "application/x-zip-compressed", "application/x-rar-compressed"];
        if (!validTypes.includes(f.type) && !f.name.match(/\.(zip|rar)$/i)) {
            setError("ZIP or RAR only."); e.target.value = ""; return;
        }
        if (f.size > 100 * 1024 * 1024) { setError(`Max 100MB (yours: ${(f.size / 1024 / 1024).toFixed(1)}MB).`); e.target.value = ""; return; }
        setUploading(true); setError("");
        try {
            const res = await apiUploadFile(f, folder);
            onChange(res.data.url); setFileName(f.name); setFileSize(f.size);
        } catch (e) { setError("Upload failed: " + e.message); }
        finally { setUploading(false); e.target.value = ""; }
    };

    return (
        <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
                {label} <span className="text-gray-400">(optional · max 100MB)</span>
            </label>
            {value ? (
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded border border-gray-200 flex flex-col items-center justify-center flex-shrink-0">
                        <FileArchive size={16} />
                        <span className="text-[9px] font-bold mt-0.5">ZIP</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{fileName || value.split("/").pop()}</p>
                        {fileSize > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{(fileSize / 1024).toFixed(0)} KB</p>}
                    </div>
                    <button type="button" onClick={() => { onChange(""); setFileName(""); setFileSize(0); }} className="text-gray-400 hover:text-red-500 flex-shrink-0"><X size={15} /></button>
                </div>
            ) : (
                <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 text-sm py-4 rounded-lg transition-all disabled:opacity-60 group">
                    {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Upload size={15} className="group-hover:-translate-y-1 transition-transform" /> Click to upload student photos (.zip)</>}
                </button>
            )}
            {error && <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"><AlertCircle size={12} />{error}</div>}
            <input ref={ref} type="file" accept=".zip,.rar" className="hidden" onChange={handle} />
        </div>
    );
}

// ── Inline photo picker for table rows ───────────────────────────────────────
function InlinePhoto({ url, uploading, onPick, onClear }) {
    const ref = useRef();
    return (
        <td className="px-2 py-1.5">
            {url ? (
                <div className="relative w-9 h-9">
                    <img src={url.startsWith("http") ? url : `${BASE}${url}`}
                        alt="photo" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                    <button onClick={onClear}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center text-red-400 hover:text-red-600">
                        <X size={9} />
                    </button>
                </div>
            ) : (
                <button onClick={() => ref.current?.click()} disabled={uploading}
                    className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 hover:border-indigo-400 flex items-center justify-center text-gray-300 hover:text-indigo-400 transition-all disabled:opacity-50">
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
                </button>
            )}
            <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={onPick} />
        </td>
    );
}

// ── Per-row photo cell in the Excel preview table ────────────────────────────
// Needs to be its own component so useRef is at component top-level
function ExcelPhotoRow({ s, idx, onPhotoChange, onPhotoClear }) {
    const ref = useRef();
    const src = s.photo_url ? (s.photo_url.startsWith("http") ? s.photo_url : `${BASE}${s.photo_url}`) : null;
    return (
        <tr>
            <td className="px-3 py-2">
                {src ? (
                    <div className="relative w-8 h-8">
                        <img src={src} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        <button onClick={onPhotoClear}
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-red-400">
                            <X size={8} />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => ref.current?.click()} disabled={s._photoUploading}
                        className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-indigo-400 flex items-center justify-center text-gray-300 hover:text-indigo-400 transition-all disabled:opacity-50">
                        {s._photoUploading ? <Loader2 size={11} className="animate-spin" /> : <Image size={11} />}
                    </button>
                )}
                <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={onPhotoChange} />
            </td>
            <td className="px-3 py-2 font-medium text-gray-700">{s.admission_no}</td>
            <td className="px-3 py-2 text-gray-600">{s.first_name}</td>
            <td className="px-3 py-2 text-gray-500">{s.last_name}</td>
            <td className="px-3 py-2 text-gray-500">{s.class}</td>
            <td className="px-3 py-2 text-gray-500">{s.section}</td>
            <td className="px-3 py-2 text-gray-500">{s.dob}</td>
            <td className="px-3 py-2 text-gray-500">{s.blood_group}</td>
        </tr>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CreateRequest() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const fileRef = useRef();

    const [step, setStep] = useState(1);
    const [info, setInfo] = useState({
        remarks: "",
        school_logo_url: "",
        principal_signature_url: "",
        old_id_card_url: "",
        old_lanyard_url: "",
        photos_zip_url: "",
    });
    const [submittingInfo, setSubmittingInfo] = useState(false);
    const [requestId, setRequestId] = useState(null);
    const [requestNo, setRequestNo] = useState(null);

    // Tenant Selection for Admins
    const [tenants, setTenants] = useState([]);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState(user?.tenant_id || "");
    const [tenantSearch, setTenantSearch] = useState("");

    const adminRoles = ['admin', 'GMMC_ADMIN', 'GMMC-Admin', 'gmmc_admin', 'operations', 'marketer'];
    const isAdmin = adminRoles.includes(user?.role?.toLowerCase()) || adminRoles.includes(user?.role);

    useEffect(() => {
        if (isAdmin) {
            setLoadingTenants(true);
            apiGetTenants()
                .then(res => setTenants(res.data || []))
                .catch(() => {})
                .finally(() => setLoadingTenants(false));
        }
    }, [isAdmin]);

    // Manual rows
    const [rows, setRows] = useState([BLANK_ROW()]);
    const [savingRows, setSavingRows] = useState(false);
    const [rowError, setRowError] = useState("");
    const [rowSuccess, setRowSuccess] = useState("");

    // Excel
    const [excelRows, setExcelRows] = useState(null);
    const [uploadingXls, setUploadingXls] = useState(false);

    // ── Step 1 ────────────────────────────────────────────────────
    const createRequestIfNeeded = async () => {
        if (requestId) return requestId;
        if (!selectedTenantId) throw new Error("Please select a target school.");
        try {
            const res = await apiCreateRequest({
                tenant_id: selectedTenantId,
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
        } catch (err) {
            throw new Error("Failed to create request: " + err.message);
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault(); setSubmittingInfo(true);
        try {
            await createRequestIfNeeded();
            setStep(2);
        } catch (err) { alert(err.message); }
        finally { setSubmittingInfo(false); }
    };

    // ── Manual rows ───────────────────────────────────────────────
    const setRowField = (idx, key, val) =>
        setRows(p => p.map((r, i) => i === idx ? { ...r, [key]: val } : r));

    const addRow = () => setRows(p => [...p, BLANK_ROW()]);
    const removeRow = (idx) => setRows(p => p.filter((_, i) => i !== idx));

    // Upload photo for a specific row
    const handleRowPhoto = async (idx, e) => {
        const f = e.target.files[0]; if (!f) return;
        if (!ALLOWED.includes(f.type)) { setRowError("Photo: JPG/PNG/WebP only."); e.target.value = ""; return; }
        if (f.size > MAX_BYTES) { setRowError(`Photo too large (max ${MAX_MB}MB).`); e.target.value = ""; return; }
        setRowField(idx, "_photoUploading", true); setRowError("");
        try {
            const res = await apiUploadFile(f, "photos");
            setRowField(idx, "photo_url", res.data.url);
        } catch { setRowError("Photo upload failed."); }
        finally { setRowField(idx, "_photoUploading", false); e.target.value = ""; }
    };

    const handleSaveRows = async () => {
        const valid = rows.filter(r => r.admission_no.trim() && r.first_name.trim());
        if (!valid.length) { setRowError("Fill at least one row (Admission No + First Name required)."); return; }
        setRowError(""); setSavingRows(true);
        try {
            // Lazy-create request if we skipped Step 1
            const activeReqId = await createRequestIfNeeded();

            for (const r of valid) {
                await apiAddStudent({ ...r, request_id: activeReqId, tenant_id: selectedTenantId });
            }
            setRowSuccess(`${valid.length} student${valid.length > 1 ? "s" : ""} saved!`);
            setRows([BLANK_ROW()]);
            setTimeout(() => setRowSuccess(""), 3000);
        } catch (err) { setRowError(err.message); }
        finally { setSavingRows(false); }
    };

    // ── Excel ─────────────────────────────────────────────────────
    const downloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            ["Admission No *", "First Name *", "Last Name", "Class", "Section", "Roll No", "DOB (YYYY-MM-DD)", "Blood Group", "Photo URL"],
            ["ADM001", "Ravi", "Kumar", "10", "A", "1", "2009-04-15", "O+", "https://example.com/photo.jpg"],
        ]);
        ws["!cols"] = Array(9).fill({ wch: 22 });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
    };

    const handleFileChange = (e) => {
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

    // Upload photo for a specific excel preview row
    const handleExcelRowPhoto = async (idx, e) => {
        const f = e.target.files[0]; if (!f) return;
        if (!ALLOWED.includes(f.type)) { alert("JPG/PNG/WebP only"); e.target.value = ""; return; }
        if (f.size > MAX_BYTES) { alert(`Max ${MAX_MB}MB`); e.target.value = ""; return; }
        setExcelRows(p => p.map((r, i) => i === idx ? { ...r, _photoUploading: true } : r));
        try {
            const res = await apiUploadFile(f, "photos");
            setExcelRows(p => p.map((r, i) => i === idx ? { ...r, photo_url: res.data.url, _photoUploading: false } : r));
        } catch { alert("Upload failed"); setExcelRows(p => p.map((r, i) => i === idx ? { ...r, _photoUploading: false } : r)); }
        finally { e.target.value = ""; }
    };

    const handleExcelUpload = async () => {
        if (!excelRows?.length) return;
        setUploadingXls(true); setRowError("");
        try {
            // Lazy-create request if we skipped Step 1
            const activeReqId = await createRequestIfNeeded();

            await apiBulkCreateStudents(excelRows, selectedTenantId, activeReqId);
            setRowSuccess(`${excelRows.length} students uploaded!`);
            setExcelRows(null);
            setTimeout(() => setRowSuccess(""), 3000);
        } catch (err) { setRowError(err.message); }
        finally { setUploadingXls(false); }
    };

    // ─────────────────────────────────────────────────────────────
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button onClick={() => navigate("/idcard/dashboard")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
                <ChevronLeft size={16} /> Back to Dashboard
            </button>

            <h1 className="text-xl font-bold text-gray-900 mb-1">New ID Card Request</h1>
            <p className="text-sm text-gray-500 mb-6">{user?.tenant_name || "Your School"}</p>

            {/* Stepper */}
            <div className="flex items-center gap-0 mb-8">
                {[{ n: 1, label: "Request Info" }, { n: 2, label: "Add Students" }, { n: 3, label: "Done" }].map(({ n, label }, i) => (
                    <div key={n} className="flex items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${step > n ? "bg-green-500 text-white" : step === n ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                                {step > n ? <Check size={13} /> : n}
                            </div>
                            <span className={`text-sm font-medium hidden sm:block ${step === n ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                        </div>
                        {i < 2 && <div className={`w-12 h-px mx-3 ${step > n ? "bg-green-400" : "bg-gray-200"}`} />}
                    </div>
                ))}
            </div>

            {/* ── STEP 1 ──────────────────────────────────────────────── */}
            {step === 1 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-5">Request Details</h2>
                    <form onSubmit={handleCreateRequest} className="space-y-5">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 flex justify-between items-center">
                            <div><strong>Author:</strong> {user?.full_name}</div>
                            <div><strong>Role:</strong> {user?.role}</div>
                        </div>

                        {isAdmin && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target School / Tenant</label>
                                <div className="relative">
                                    <select
                                        disabled={loadingTenants}
                                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer uppercase italic tracking-widest"
                                        value={selectedTenantId}
                                        onChange={(e) => setSelectedTenantId(e.target.value)}
                                    >
                                        <option value="">{loadingTenants ? "Synchronizing Data..." : "Select Target School..."}</option>
                                        {tenants.map(t => (
                                            <option key={t.id} value={t.id}>{t.tenant_name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        {loadingTenants ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <ChevronDown size={14} strokeWidth={3} />}
                                    </div>
                                </div>
                                {tenants.length === 0 && !loadingTenants && (
                                    <p className="text-[8px] text-amber-600 font-black uppercase mt-1 px-1 flex items-center gap-1">
                                        <AlertCircle size={10} /> No school records found.
                                    </p>
                                )}
                            </div>
                        )}

                        {!isAdmin && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                                <strong>Target School:</strong> {user?.tenant_name || "Not assigned"}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks <span className="text-gray-400">(optional)</span></label>
                            <textarea rows={3} value={info.remarks} onChange={e => setInfo(p => ({ ...p, remarks: e.target.value }))}
                                placeholder="E.g. New batch — Class 10, blue lanyard..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ImageUploadField label="School Logo" folder="logos" value={info.school_logo_url} onChange={url => setInfo(p => ({ ...p, school_logo_url: url }))} />
                            <ImageUploadField label="Principal Signature" folder="signatures" value={info.principal_signature_url} onChange={url => setInfo(p => ({ ...p, principal_signature_url: url }))} />
                            <ImageUploadField label="Old ID Card Sample" folder="samples" value={info.old_id_card_url} onChange={url => setInfo(p => ({ ...p, old_id_card_url: url }))} />
                            <ImageUploadField label="Old Lanyard" folder="lanyards" value={info.old_lanyard_url} onChange={url => setInfo(p => ({ ...p, old_lanyard_url: url }))} />
                            <ArchiveUploadField label="Student Photos ZIP" folder="archives" value={info.photos_zip_url} onChange={url => setInfo(p => ({ ...p, photos_zip_url: url }))} />
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                            <button type="button" onClick={() => {
                                setInfo({ remarks: "", school_logo_url: "", principal_signature_url: "", old_id_card_url: "", old_lanyard_url: "" });
                                setStep(2); // Just skip UI state without creating DB record
                            }} disabled={submittingInfo}
                                className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60 transition-colors">
                                Skip & Add Students
                            </button>
                            <button type="submit" disabled={submittingInfo}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60 transition-colors">
                                {submittingInfo && <Loader2 size={14} className="animate-spin" />}
                                Save & Continue <ChevronRight size={15} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── STEP 2 ──────────────────────────────────────────────── */}
            {step === 2 && (
                <div className="space-y-4">
                    {requestNo && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                            <Check size={15} className="text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-800">Request <strong>{requestNo}</strong> created. Now add student details below.</p>
                        </div>
                    )}

                    {rowError && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"><AlertCircle size={14} />{rowError}</div>}
                    {rowSuccess && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg"><Check size={14} />{rowSuccess}</div>}

                    {/* ── Option A: Manual ───────────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <UserPlus size={16} className="text-indigo-600" />
                                <p className="text-sm font-semibold text-gray-800">Option A — Enter Students Manually</p>
                            </div>
                            <button onClick={addRow} className="text-xs text-indigo-600 hover:underline font-medium">+ Add Row</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {["Photo", "Adm No *", "First Name *", "Last Name", "Class", "Sec", "Roll", "DOB", "Blood", ""].map(h => (
                                            <th key={h} className="text-left px-2 py-2.5 font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rows.map((row, idx) => (
                                        <tr key={row._id}>
                                            {/* Photo upload cell */}
                                            <InlinePhoto
                                                url={row.photo_url}
                                                uploading={row._photoUploading}
                                                onPick={(e) => handleRowPhoto(idx, e)}
                                                onClear={() => setRowField(idx, "photo_url", "")}
                                            />
                                            <td className="px-2 py-1.5"><input value={row.admission_no} onChange={e => setRowField(idx, "admission_no", e.target.value)} placeholder="ADM001" className="w-20 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-gray-800" /></td>
                                            <td className="px-2 py-1.5"><input value={row.first_name} onChange={e => setRowField(idx, "first_name", e.target.value)} placeholder="Ravi" className="w-20 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-gray-800" /></td>
                                            <td className="px-2 py-1.5"><input value={row.last_name} onChange={e => setRowField(idx, "last_name", e.target.value)} placeholder="Kumar" className="w-20 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-gray-800" /></td>
                                            <td className="px-2 py-1.5"><input value={row.class} onChange={e => setRowField(idx, "class", e.target.value)} placeholder="10" className="w-12 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-gray-800" /></td>
                                            <td className="px-2 py-1.5"><input value={row.section} onChange={e => setRowField(idx, "section", e.target.value)} placeholder="A" className="w-10 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-gray-800" /></td>
                                            <td className="px-2 py-1.5"><input value={row.roll_no} onChange={e => setRowField(idx, "roll_no", e.target.value)} placeholder="01" className="w-10 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-gray-800" /></td>
                                            <td className="px-2 py-1.5"><input value={row.dob} onChange={e => setRowField(idx, "dob", e.target.value)} type="date" className="w-32 border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-gray-800" /></td>
                                            <td className="px-2 py-1.5">
                                                <select value={row.blood_group} onChange={e => setRowField(idx, "blood_group", e.target.value)} className="w-16 border border-gray-200 rounded px-1 py-1.5 outline-none text-gray-800">
                                                    <option value="">—</option>
                                                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {rows.length > 1 && <button onClick={() => removeRow(idx)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                            <button onClick={addRow} className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">+ Add another row</button>
                            <button onClick={handleSaveRows} disabled={savingRows}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-60 transition-colors">
                                {savingRows ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save Students
                            </button>
                        </div>
                    </div>

                    {/* ── Option B: Excel ────────────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet size={16} className="text-emerald-600" />
                                <p className="text-sm font-semibold text-gray-800">Option B — Upload Excel File</p>
                            </div>
                            <button onClick={downloadTemplate} className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors">
                                <Download size={12} /> Download Template
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 space-y-1">
                                <p><strong>How:</strong> Download template → fill details (Photo URL optional) → upload below.</p>
                                <p className="text-indigo-600 font-medium">💡 After uploading Excel, you can attach photos per student before saving.</p>
                            </div>

                            {!excelRows ? (
                                <button onClick={() => fileRef.current?.click()}
                                    className="flex items-center gap-2 border border-dashed border-gray-300 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 text-sm font-medium px-6 py-4 rounded-lg w-full justify-center transition-colors">
                                    <Upload size={16} /> Choose Excel File (.xlsx)
                                </button>
                            ) : (
                                <>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm text-gray-700 font-medium">{excelRows.length} students — attach photos below (optional)</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setExcelRows(null)} className="text-xs border border-gray-300 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50">Discard</button>
                                            <button onClick={handleExcelUpload} disabled={uploadingXls}
                                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                                                {uploadingXls ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload All
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto max-h-56 overflow-y-auto border border-gray-100 rounded-lg">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>{["Photo", "Adm No", "First Name", "Last Name", "Class", "Sec", "DOB", "Blood"].map(h => (
                                                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {excelRows.map((s, i) => (
                                                    <ExcelPhotoRow
                                                        key={s._id || i}
                                                        s={s}
                                                        idx={i}
                                                        onPhotoChange={(e) => handleExcelRowPhoto(i, e)}
                                                        onPhotoClear={() => setExcelRows(p => p.map((r, ri) => ri === i ? { ...r, photo_url: "" } : r))}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button onClick={() => setStep(1)}
                            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <ChevronLeft size={15} /> Previous
                        </button>
                        <button onClick={() => setStep(3)}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                            Finish &amp; Submit <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 3 ──────────────────────────────────────────────── */}
            {step === 3 && (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={28} className="text-green-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Request Submitted!</h2>
                    <p className="text-sm text-gray-500 mb-1">Sent to GMMC for review.</p>
                    <p className="text-sm font-semibold text-indigo-600 mb-6">Request No: {requestNo}</p>
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={() => navigate("/idcard/requests")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                            View All Requests
                        </button>
                        <button onClick={() => setStep(2)}
                            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <ChevronLeft size={15} /> Back to Add Students
                        </button>
                        <button onClick={() => { setStep(1); setInfo({ remarks: "", school_logo_url: "", principal_signature_url: "", old_id_card_url: "", old_lanyard_url: "", photos_zip_url: "" }); setRows([BLANK_ROW()]); setExcelRows(null); setRequestId(null); setRequestNo(null); }}
                            className="border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            New Request
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
