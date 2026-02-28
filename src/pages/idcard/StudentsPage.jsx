import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
    apiGetStudentsByRequest, apiBulkCreateStudents,
    apiAddStudent, apiDeleteStudent, apiUploadFile
} from "../../utils/api";
import * as XLSX from "xlsx";
import {
    Upload, UserPlus, Trash2, Download, FileSpreadsheet,
    Loader2, Check, X, AlertCircle, ChevronLeft, Users, Image
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const EMPTY_STUDENT = {
    admission_no: "", first_name: "", last_name: "",
    class: "", section: "", roll_no: "", dob: "", blood_group: "", photo_url: "",
};
const BASE = "http://localhost:5001";

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
            <label className="block text-xs font-medium text-gray-600 mb-1">
                Photo <span className="text-gray-400">(optional · max 5MB)</span>
            </label>
            {value ? (
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
                    <img src={`${BASE}${value}`} alt="photo"
                        className="w-10 h-10 object-cover rounded border border-gray-200 bg-white flex-shrink-0" />
                    <p className="text-xs text-gray-500 flex-1 truncate">{value.split("/").pop()}</p>
                    <button type="button" onClick={() => onChange("")}
                        className="text-gray-400 hover:text-red-500"><X size={13} /></button>
                </div>
            ) : (
                <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
                    className="w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-300 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 text-xs py-3 rounded-lg transition-all disabled:opacity-60">
                    {uploading
                        ? <><Loader2 size={13} className="animate-spin" /> Uploading...</>
                        : <><Image size={13} /> Select photo</>}
                </button>
            )}
            {err && <p className="text-[10px] text-red-500 mt-1">{err}</p>}
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
            setSuccess("Student added successfully.");
            setForm(EMPTY_STUDENT);
            setShowAdd(false);
            load();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this student?")) return;
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
        XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
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
            setSuccess(`${preview.length} students uploaded successfully.`);
            setPreview(null);
            load();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) { setError(err.message); }
        finally { setUploading(false); }
    };

    // ─────────────────────────────────────────────────────────────
    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">Students</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Request #{requestId} · {students.length} student{students.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={downloadTemplate}
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download size={14} /> Template
                    </button>
                    <button onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileSpreadsheet size={14} /> Upload Excel
                    </button>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                    <button onClick={() => { setShowAdd(true); setError(""); setForm(EMPTY_STUDENT); }}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
                        <UserPlus size={14} /> Add Student
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"><AlertCircle size={14} />{error}</div>}
            {success && <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg"><Check size={14} />{success}</div>}

            {/* Excel Preview */}
            {preview && (
                <div className="mb-5 bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-amber-50">
                        <p className="text-sm font-semibold text-amber-800">{preview.length} students ready to upload</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPreview(null)} className="text-xs border border-gray-300 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50">Discard</button>
                            <button onClick={handleBulkUpload} disabled={uploading}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Confirm Upload
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>{["Photo", "Adm No", "First Name", "Last Name", "Class", "Sec", "Roll", "DOB", "Blood"].map((h) => (
                                    <th key={h} className="text-left px-4 py-2 font-semibold text-gray-500">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {preview.map((s, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            {s.photo_url
                                                ? <img src={s.photo_url} alt="" className="w-8 h-8 object-cover rounded border border-gray-200" onError={(e) => { e.target.style.display = "none"; }} />
                                                : <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center"><Image size={12} className="text-gray-300" /></div>
                                            }
                                        </td>
                                        <td className="px-4 py-2 text-gray-700 font-medium">{s.admission_no}</td>
                                        <td className="px-4 py-2 text-gray-700">{s.first_name}</td>
                                        <td className="px-4 py-2 text-gray-500">{s.last_name}</td>
                                        <td className="px-4 py-2 text-gray-500">{s.class}</td>
                                        <td className="px-4 py-2 text-gray-500">{s.section}</td>
                                        <td className="px-4 py-2 text-gray-500">{s.roll_no}</td>
                                        <td className="px-4 py-2 text-gray-500">{s.dob}</td>
                                        <td className="px-4 py-2 text-gray-500">{s.blood_group}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Student Form */}
            {showAdd && (
                <div className="mb-5 bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-gray-800">Add Student Manually</p>
                        <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                    </div>
                    <form onSubmit={handleAddSingle}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <F label="Admission No *" value={form.admission_no} ch={(v) => set("admission_no", v)} ph="ADM001" />
                            <F label="First Name *" value={form.first_name} ch={(v) => set("first_name", v)} ph="Ravi" />
                            <F label="Last Name" value={form.last_name} ch={(v) => set("last_name", v)} ph="Kumar" />
                            <F label="Roll No" value={form.roll_no} ch={(v) => set("roll_no", v)} ph="01" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <F label="Class" value={form.class} ch={(v) => set("class", v)} ph="10" />
                            <F label="Section" value={form.section} ch={(v) => set("section", v)} ph="A" />
                            <F label="DOB" value={form.dob} ch={(v) => set("dob", v)} ph="YYYY-MM-DD" type="date" />
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
                                <select value={form.blood_group} onChange={(e) => set("blood_group", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400">
                                    <option value="">—</option>
                                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Photo upload — full width */}
                        <div className="mb-3">
                            <PhotoPicker
                                value={form.photo_url}
                                onChange={(url) => set("photo_url", url)}
                            />
                        </div>

                        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                        <div className="flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setShowAdd(false)}
                                className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60 transition-colors">
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Add Student
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Students Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                ) : students.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users size={32} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-gray-400 text-sm">No students added yet.</p>
                        <p className="text-gray-400 text-xs mt-1">Use "Add Student" or "Upload Excel" to get started.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {["Photo", "Adm No", "Name", "Class", "Section", "Roll", "DOB", "Blood", ""].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        {s.photo_url
                                            ? <img src={s.photo_url.startsWith("http") ? s.photo_url : `${BASE}${s.photo_url}`}
                                                alt={s.first_name}
                                                className="w-9 h-9 object-cover rounded-full border border-gray-200" />
                                            : <div className="w-9 h-9 rounded-full bg-indigo-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-indigo-400">
                                                {s.first_name?.[0]}{s.last_name?.[0]}
                                            </div>
                                        }
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-700 text-xs">{s.admission_no}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.class || "—"}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.section || "—"}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.roll_no || "—"}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{s.dob ? new Date(s.dob).toLocaleDateString("en-IN") : "—"}</td>
                                    <td className="px-4 py-3">
                                        {s.blood_group
                                            ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-medium">{s.blood_group}</span>
                                            : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                                            className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50">
                                            {deleting === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function F({ label, value, ch, ph, type = "text" }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type={type} placeholder={ph} value={value || ""} onChange={(e) => ch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
        </div>
    );
}
