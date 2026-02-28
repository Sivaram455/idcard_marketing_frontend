import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequestById, apiCreateApproval, apiCreateSample, apiUploadFile } from "../../utils/api";
import {
    ArrowLeft, FileText, Users, Image, Clock, RefreshCw,
    CheckCircle, XCircle, AlertCircle, Upload, Loader2, Check,
    ChevronRight, User
} from "lucide-react";

const BASE = "http://localhost:5001";

const STATUS_CFG = {
    SUBMITTED: { label: "Submitted", color: "bg-blue-50 text-blue-700", step: 0 },
    GMMC_APPROVED: { label: "GMMC Approved", color: "bg-indigo-50 text-indigo-700", step: 1 },
    GMMC_REJECTED: { label: "GMMC Rejected", color: "bg-red-50 text-red-700", step: 1 },
    PRINTER_APPROVED: { label: "Printer Approved", color: "bg-purple-50 text-purple-700", step: 2 },
    PRINTER_REJECTED: { label: "Printer Rejected", color: "bg-red-50 text-red-700", step: 2 },
    SAMPLE_UPLOADED: { label: "Sample Uploaded", color: "bg-amber-50 text-amber-700", step: 3 },
    SCHOOL_VERIFIED: { label: "School Verified", color: "bg-teal-50 text-teal-700", step: 4 },
    GMMC_VERIFIED: { label: "GMMC Verified", color: "bg-cyan-50 text-cyan-700", step: 5 },
    BULK_PRINT_APPROVED: { label: "Print Approved", color: "bg-green-50 text-green-700", step: 6 },
};

const STEPS = ["Submitted", "GMMC Review", "Printer Review", "Sample Upload", "School Verify", "GMMC Final", "Print Approved"];

// What action can this role take given current status?
// Uses MAPPED roles: admin, printer, school (AuthContext normalises GMMC_ADMIN→admin etc.)
const getAction = (role, status) => {
    if (role === "admin" && status === "SUBMITTED") return { stage: "GMMC", type: "review" };
    if (role === "admin" && status === "SCHOOL_VERIFIED") return { stage: "FINAL", type: "review" };
    if (role === "printer" && status === "GMMC_APPROVED") return { stage: "PRINTER", type: "review" };
    if (role === "printer" && status === "PRINTER_APPROVED") return { stage: "PRINTER", type: "sample" };
    if (role === "school" && status === "SAMPLE_UPLOADED") return { stage: "SCHOOL", type: "review" };
    return null;
};

// ── Tiny image uploader used for samples ─────────────────────────────────────
function SampleImagePicker({ label, value, onChange }) {
    const ref = useRef();
    const [busy, setBusy] = useState(false);
    const handle = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        setBusy(true);
        try { const r = await apiUploadFile(f, "samples"); onChange(r.data.url); }
        catch { alert("Upload failed"); }
        finally { setBusy(false); e.target.value = ""; }
    };
    return (
        <div>
            <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
            {value ? (
                <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img src={value.startsWith("http") ? value : `${BASE}${value}`}
                        alt={label} className="w-full h-32 object-contain" />
                    <button onClick={() => onChange("")}
                        className="absolute top-1 right-1 bg-white border border-gray-200 rounded-full p-0.5 text-gray-400 hover:text-red-500">
                        <XCircle size={14} />
                    </button>
                </div>
            ) : (
                <button onClick={() => ref.current?.click()} disabled={busy}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 text-xs py-6 rounded-lg transition-all disabled:opacity-60">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {busy ? "Uploading..." : `Upload ${label}`}
                </button>
            )}
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RequestDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("overview");
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const [comments, setComments] = useState("");
    const [sampleF, setSampleF] = useState("");
    const [sampleB, setSampleB] = useState("");

    const load = async () => {
        setLoading(true);
        try { const r = await apiGetRequestById(id); setRequest(r.data); }
        catch { /* handled below */ }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [id]);

    const action = request ? getAction(user?.role, request.current_status) : null;
    const cfg = STATUS_CFG[request?.current_status] || { label: request?.current_status, color: "bg-gray-100 text-gray-600", step: 0 };
    const step = cfg.step;

    // ── Approval / rejection ─────────────────────────────────────
    const doApproval = async (verdict) => {
        setBusy(true); setMsg(null);
        try {
            await apiCreateApproval({ request_id: parseInt(id), action: verdict, action_stage: action.stage, comments });
            setMsg({ ok: true, text: `${verdict === "APPROVED" ? "Approved" : "Rejected"} successfully.` });
            setComments("");
            await load();
        } catch (e) { setMsg({ ok: false, text: e.message }); }
        finally { setBusy(false); }
    };

    // ── Sample upload (printer uploads sample card images) ───────
    const doSample = async () => {
        if (!sampleF || !sampleB) { setMsg({ ok: false, text: "Upload both front and back images." }); return; }
        setBusy(true); setMsg(null);
        try {
            await apiCreateSample({ request_id: parseInt(id), sample_front_url: sampleF, sample_back_url: sampleB });
            setMsg({ ok: true, text: "Sample uploaded. School will verify." });
            setSampleF(""); setSampleB("");
            await load();
        } catch (e) { setMsg({ ok: false, text: e.message }); }
        finally { setBusy(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={22} className="animate-spin text-gray-300 mr-3" />
            <span className="text-sm text-gray-400">Loading request...</span>
        </div>
    );
    if (!request) return (
        <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">Request not found.</p>
            <button onClick={() => navigate("/idcard/requests")} className="mt-3 text-indigo-600 text-sm hover:underline">← Back</button>
        </div>
    );

    const uploadsRaw = [
        { label: "School Logo", url: request.school_logo_url },
        { label: "Principal Signature", url: request.principal_signature_url },
        { label: "Old ID Card Sample", url: request.old_id_card_url },
        { label: "Excel File", url: request.excel_file_url },
        { label: "Photos ZIP", url: request.photos_zip_url },
    ].filter((f) => f.url && f.url !== "");

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">

            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate("/idcard/requests")} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={19} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-gray-900">{request.request_no}</h1>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {request.tenant_name} · by {request.created_by_name || "—"} · {new Date(request.created_at).toLocaleDateString("en-IN")}
                    </p>
                </div>
                <button onClick={load} className="text-gray-400 hover:text-gray-700 transition-colors"><RefreshCw size={16} /></button>
            </div>

            {/* Workflow progress bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center flex-1 min-w-0">
                            <div className="flex flex-col items-center flex-shrink-0">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${i < step ? "bg-green-500 text-white"
                                        : i === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                                            : "bg-gray-100 text-gray-400"}`}>
                                    {i < step ? <Check size={12} /> : i + 1}
                                </div>
                                <p className={`text-[9px] font-semibold mt-1 text-center leading-tight max-w-[55px]
                                    ${i <= step ? "text-indigo-700" : "text-gray-300"}`}>{s}</p>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < step ? "bg-green-400" : "bg-gray-100"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── ACTION PANEL — shown prominently when role has pending action ── */}
            {action && (
                <div className={`border-2 rounded-xl p-5 ${action.type === "sample" ? "border-purple-200 bg-purple-50" : "border-amber-200 bg-amber-50"}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.type === "sample" ? "bg-purple-100" : "bg-amber-100"}`}>
                            {action.type === "sample" ? <Upload size={16} className="text-purple-600" /> : <AlertCircle size={16} className="text-amber-600" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">
                                {action.type === "sample" ? "Upload ID Card Sample" : `Your review is required — ${action.stage} stage`}
                            </p>
                            <p className="text-xs text-gray-500">
                                {action.stage === "GMMC" && "Review this request and approve or reject it."}
                                {action.stage === "PRINTER" && action.type === "review" && "Check if you can print this request."}
                                {action.stage === "PRINTER" && action.type === "sample" && "Upload front and back sample images of the ID card."}
                                {action.stage === "SCHOOL" && "Review the sample uploaded by the printer and verify."}
                                {action.stage === "FINAL" && "Final GMMC approval before bulk printing begins."}
                            </p>
                        </div>
                    </div>

                    {msg && (
                        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-4
                            ${msg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                            {msg.ok ? <Check size={14} /> : <AlertCircle size={14} />} {msg.text}
                        </div>
                    )}

                    {/* ── Sample upload (Printer uploads card images) */}
                    {action.type === "sample" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <SampleImagePicker label="Front Side" value={sampleF} onChange={setSampleF} />
                                <SampleImagePicker label="Back Side" value={sampleB} onChange={setSampleB} />
                            </div>
                            <button onClick={doSample} disabled={busy || !sampleF || !sampleB}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50 transition-colors">
                                {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                                Submit Sample for School Verification
                            </button>
                        </div>
                    )}

                    {/* ── Approve / Reject */}
                    {action.type === "review" && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Comments <span className="text-gray-400">(optional)</span></label>
                                <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)}
                                    placeholder="Add a note about your decision..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none bg-white" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => doApproval("APPROVED")} disabled={busy}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50 transition-colors">
                                    {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                    Approve
                                </button>
                                <button onClick={() => doApproval("REJECTED")} disabled={busy}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50 transition-colors">
                                    {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-100">
                    {[
                        { key: "overview", label: "Overview", icon: FileText },
                        { key: "students", label: `Students (${request.students?.length || 0})`, icon: Users },
                        { key: "samples", label: `Samples (${request.samples?.length || 0})`, icon: Image },
                        { key: "timeline", label: `Timeline (${request.approvals?.length || 0})`, icon: Clock },
                    ].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all
                                ${tab === key ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
                            <Icon size={13} /> {label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {/* ── Overview ── */}
                    {tab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Uploaded Assets</p>
                                {uploadsRaw.length === 0 ? (
                                    <p className="text-sm text-gray-400">No files uploaded.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {uploadsRaw.map((f, i) => {
                                            const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(f.url);
                                            const src = f.url.startsWith("http") ? f.url : `${BASE}${f.url}`;
                                            return (
                                                <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2">
                                                    {isImg
                                                        ? <img src={src} alt={f.label} className="w-10 h-10 object-contain rounded border border-gray-100 bg-white flex-shrink-0" />
                                                        : <div className="w-10 h-10 bg-gray-50 rounded border border-gray-100 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-gray-400" /></div>
                                                    }
                                                    <p className="text-sm text-gray-700 flex-1 font-medium">{f.label}</p>
                                                    <a href={src} target="_blank" rel="noreferrer"
                                                        className="text-xs text-indigo-600 hover:underline flex-shrink-0">View</a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Remarks</p>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[80px]">
                                    <p className="text-sm text-gray-600">{request.remarks || "No remarks."}</p>
                                </div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Request Info</p>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Total Students</span><span className="font-medium text-gray-800">{request.students?.length || 0}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Submitted</span><span className="font-medium text-gray-800">{new Date(request.created_at).toLocaleDateString("en-IN")}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">School</span><span className="font-medium text-gray-800">{request.tenant_name}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Students ── */}
                    {tab === "students" && (
                        request.students?.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-8">No students in this request.</p>
                            : <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>{["Photo", "Adm No", "Name", "Class", "Blood Group", "Status"].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {request.students.map((s) => {
                                        const src = s.photo_url ? (s.photo_url.startsWith("http") ? s.photo_url : `${BASE}${s.photo_url}`) : null;
                                        return (
                                            <tr key={s.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    {src ? <img src={src} alt={s.first_name} className="w-8 h-8 object-cover rounded-full border border-gray-200" />
                                                        : <div className="w-8 h-8 rounded-full bg-indigo-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-indigo-400">{s.first_name?.[0]}{s.last_name?.[0]}</div>}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs font-medium">{s.admission_no}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                                                <td className="px-4 py-3 text-gray-500">{s.class || "—"}{s.section ? `-${s.section}` : ""}</td>
                                                <td className="px-4 py-3">{s.blood_group ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-medium">{s.blood_group}</span> : "—"}</td>
                                                <td className="px-4 py-3"><span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-medium">{s.status}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                    )}

                    {/* ── Samples ── */}
                    {tab === "samples" && (
                        request.samples?.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-8">No samples uploaded yet.</p>
                            : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {request.samples.map((s) => {
                                    const front = s.sample_front_url?.startsWith("http") ? s.sample_front_url : `${BASE}${s.sample_front_url}`;
                                    const back = s.sample_back_url?.startsWith("http") ? s.sample_back_url : `${BASE}${s.sample_back_url}`;
                                    return (
                                        <div key={s.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="grid grid-cols-2 divide-x divide-gray-100">
                                                <div className="p-3">
                                                    <p className="text-xs text-gray-400 font-medium mb-2 text-center">Front</p>
                                                    <img src={front} alt="front" className="w-full h-28 object-contain border border-gray-100 rounded-lg bg-gray-50" />
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-xs text-gray-400 font-medium mb-2 text-center">Back</p>
                                                    <img src={back} alt="back" className="w-full h-28 object-contain border border-gray-100 rounded-lg bg-gray-50" />
                                                </div>
                                            </div>
                                            <div className="px-4 py-2.5 border-t border-gray-100 flex justify-between items-center">
                                                <p className="text-xs text-gray-400">By: {s.uploaded_by_name || "—"}</p>
                                                <p className="text-xs text-gray-400">{new Date(s.uploaded_at).toLocaleDateString("en-IN")}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                    )}

                    {/* ── Timeline ── */}
                    {tab === "timeline" && (
                        request.approvals?.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-8">No actions taken yet.</p>
                            : <div className="space-y-3">
                                {request.approvals.map((a) => (
                                    <div key={a.id} className="flex gap-4 items-start">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                        ${a.action === "APPROVED" ? "bg-green-100" : "bg-red-100"}`}>
                                            {a.action === "APPROVED"
                                                ? <CheckCircle size={15} className="text-green-600" />
                                                : <XCircle size={15} className="text-red-500" />}
                                        </div>
                                        <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{a.action_by_name || "—"}</p>
                                                    <p className="text-xs text-gray-400">{a.action_role} · {a.action_stage}</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                                                ${a.action === "APPROVED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                                                    {a.action}
                                                </span>
                                            </div>
                                            {a.comments && <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">{a.comments}</p>}
                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(a.created_at).toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    )}
                </div>
            </div>
        </div>
    );
}
