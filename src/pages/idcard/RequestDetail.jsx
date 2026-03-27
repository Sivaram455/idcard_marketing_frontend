import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequestById, apiCreateApproval, apiCreateSample, apiUploadFile, apiDispatchRequest } from "../../utils/api";
import {
    ArrowLeft, FileText, Users, Image, Clock, RefreshCw,
    CheckCircle, XCircle, AlertCircle, Upload, Loader2, Check, Layers,
    ChevronRight, User, Send, Plus, Download, FileSpreadsheet, Globe,
    ShieldCheck, Zap, Search
} from "lucide-react";
import AddStudentModal from "./AddStudentModal";

const BASE = "http://localhost:5001";
const STEPS = ["Submission", "GMMC Review", "Printer Review", "Digital Sample", "School Verify", "Final Verify", "Dispatch"];

const STATUS_CONFIG = {
    SUBMITTED: { label: "Submitted", step: 0, color: "bg-blue-50 text-blue-700 border-blue-200" },
    GMMC_APPROVED: { label: "GMMC Approved", step: 1, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    GMMC_REJECTED: { label: "GMMC Rejected", step: 1, color: "bg-red-50 text-red-700 border-red-200" },
    PRINTER_APPROVED: { label: "Printer Approved", step: 2, color: "bg-purple-50 text-purple-700 border-purple-200" },
    PRINTER_REJECTED: { label: "Printer Rejected", step: 2, color: "bg-red-50 text-red-700 border-red-200" },
    SAMPLE_UPLOADED: { label: "Sample Uploaded", step: 3, color: "bg-amber-50 text-amber-700 border-amber-200" },
    SCHOOL_VERIFIED: { label: "School Verified", step: 4, color: "bg-teal-50 text-teal-700 border-teal-200" },
    GMMC_VERIFIED: { label: "GMMC Verified", step: 5, color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    BULK_PRINT_APPROVED: { label: "Print Approved", step: 6, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function RequestDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionBusy, setActionBusy] = useState(false);
    const [tab, setTab] = useState("overview");
    const [msg, setMsg] = useState(null);

    // Form states for actions
    const [comments, setComments] = useState("");
    const [sampleF, setSampleF] = useState(null);
    const [sampleB, setSampleB] = useState(null);
    const [trackingInfo, setTrackingInfo] = useState("");
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await apiGetRequestById(id);
            setRequest(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const doApproval = async (status) => {
        setActionBusy(true); setMsg(null);
        try {
            await apiCreateApproval({ request_id: id, action: status, comments, action_stage: request.status });
            setMsg({ ok: true, text: `Protocol confirmed: ${status}` });
            setComments("");
            setTimeout(load, 1500);
        } catch (err) {
            setMsg({ ok: false, text: err.message });
        } finally {
            setActionBusy(false);
        }
    };

    const doSample = async () => {
        setActionBusy(true); setMsg(null);
        try {
            const fRes = await apiUploadFile(sampleF, "samples");
            const bRes = await apiUploadFile(sampleB, "samples");
            await apiCreateSample({ request_id: id, sample_front_url: fRes.data.url, sample_back_url: bRes.data.url });
            setMsg({ ok: true, text: "Digital assets synchronized." });
            setSampleF(null); setSampleB(null);
            setTimeout(load, 1500);
        } catch (err) {
            setMsg({ ok: false, text: err.message });
        } finally {
            setActionBusy(false);
        }
    };

    const doDispatch = async () => {
        setActionBusy(true); setMsg(null);
        try {
            await apiDispatchRequest({ request_id: id, tracking_info: trackingInfo });
            setMsg({ ok: true, text: "Logistics initialized." });
            setTrackingInfo("");
            setTimeout(load, 1500);
        } catch (err) {
            setMsg({ ok: false, text: err.message });
        } finally {
            setActionBusy(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 min-h-screen">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-sm font-black uppercase tracking-widest animate-pulse">Synchronizing Data Node...</p>
        </div>
    );

    if (!request) return (
        <div className="p-20 text-center min-h-screen flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200"><AlertCircle size={40} /></div>
            <h3 className="text-xl font-black text-slate-900 italic uppercase">Node Not Found</h3>
            <button onClick={() => navigate("/idcard/requests")} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">← Back to Archive</button>
        </div>
    );

    const cfg = STATUS_CONFIG[request.status] || { label: request.status, step: 0, color: "bg-slate-50 text-slate-600 border-slate-100" };
    const step = cfg.step;

    const role = user?.role;
    let action = null;
    if (role === "admin" || role === "GMMC_ADMIN") {
        if (request.status === "SUBMITTED") action = { stage: "GMMC", type: "review" };
        if (request.status === "SCHOOL_VERIFIED") action = { stage: "GMMC", type: "review" };
    } else if (role === "printer") {
        if (request.status === "GMMC_APPROVED") action = { stage: "PRINTER", type: "review" };
        if (request.status === "PRINTER_APPROVED") action = { stage: "PRINTER", type: "sample" };
        if (request.status === "GMMC_VERIFIED") action = { stage: "PRINTER", type: "dispatch" };
    } else if (role === "school") {
        if (request.status === "SAMPLE_UPLOADED") action = { stage: "SCHOOL", type: "review" };
    }

    const uploadsRaw = [
        { label: "Logo", url: request.school_logo_url },
        { label: "Sign.", url: request.principal_signature_url },
        { label: "Sample", url: request.old_id_card_url },
        { label: "Excel", url: request.excel_file_url },
        { label: "ZIP", url: request.photos_zip_url },
    ].filter((f) => f.url && f.url !== "");

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${color} text-white group-hover:scale-110 transition-transform`}>
                    <Icon size={12} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-slate-900 leading-none">{value}</h4>
                   <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1440px] mx-auto min-h-screen bg-slate-50/50 flex flex-col">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/idcard/requests")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-black text-slate-900 tracking-tighter italic uppercase">{request.request_no}</h1>
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{request.tenant_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={load} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><RefreshCw size={14} className={loading ? 'animate-spin' : ''}/></button>
                         <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><Layers size={14} /></button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-5 space-y-4 flex-1">
                {/* Visual Stepper & Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center overflow-x-auto scrollbar-hide">
                        {STEPS.map((s, i) => (
                            <div key={i} className={`flex items-center shrink-0 ${i < STEPS.length - 1 ? 'flex-1 min-w-[100px]' : ''}`}>
                                <div className="flex flex-col items-center">
                                    <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all mb-1
                                        ${i < step ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                                            : i === step ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110 ring-4 ring-indigo-50"
                                                : "bg-slate-100 text-slate-300"}`}>
                                        {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
                                    </div>
                                    <p className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight
                                        ${i <= step ? "text-slate-900" : "text-slate-200"}`}>{s}</p>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className="flex-1 px-2 mb-4">
                                        <div className={`h-0.5 rounded-full ${i < step ? "bg-emerald-400" : "bg-slate-50"}`} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                         <StatCard label="Admissions" value={request.total_students} icon={Users} color="bg-indigo-600" />
                         <StatCard label="Photos" value={request.students?.filter(s=>s.photo_url).length} icon={Image} color="bg-blue-600" />
                         <StatCard label="Design Cycle" value="v1.2" icon={RefreshCw} color="bg-amber-600" />
                         <StatCard label="Dispatch Prob" value="95%" icon={Zap} color="bg-rose-600" />
                    </div>
                </div>

                {action && (
                    <div className={`relative border border-slate-100 rounded-2xl p-6 shadow-md overflow-hidden bg-white animate-in zoom-in-95 duration-500`}>
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${action.type === "sample" ? "bg-purple-600" : "bg-amber-500"}`} />
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${action.type === "sample" ? "bg-purple-50 text-purple-600 shadow-purple-100" : "bg-amber-50 text-amber-600 shadow-amber-100"}`}>
                                {action.type === "sample" ? <Image size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h2 className="text-base font-black text-slate-900 uppercase italic tracking-tighter">
                                        {action.type === "sample" ? "Crafting Prototype Assets" : "Executive Action Required"}
                                    </h2>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        STAGE: {action.stage} · OPERATION: {action.type === "sample" ? "Proof Rendering" : "Auth Protocol"}
                                    </p>
                                </div>
                                {msg && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider animate-in slide-in-from-left-4
                                        ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                        {msg.ok ? <Check size={12} /> : <AlertCircle size={12} />} {msg.text}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {action.type === "sample" ? (
                                        <div className="flex gap-4 w-full">
                                            <SamplePicker label="Front Face" value={sampleF} onChange={setSampleF} />
                                            <SamplePicker label="Back Face" value={sampleB} onChange={setSampleB} />
                                            <button onClick={doSample} disabled={actionBusy || !sampleF || !sampleB} className="bg-purple-600 text-white px-6 rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-50">Upload Proofs</button>
                                        </div>
                                    ) : action.type === "review" ? (
                                        <div className="flex gap-3 w-full">
                                            <input value={comments} onChange={e=>setComments(e.target.value)} placeholder="Authorization comments..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none" />
                                            <button onClick={()=>doApproval("APPROVED")} disabled={actionBusy} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-emerald-100 shadow-lg">{actionBusy ? <Loader2 className="animate-spin" size={14}/> : 'Approve'}</button>
                                            <button onClick={()=>doApproval("REJECTED")} disabled={actionBusy} className="bg-rose-50 text-rose-600 border border-rose-100 px-6 py-3 rounded-xl font-black text-[10px] uppercase">Reject</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 w-full">
                                            <input value={trackingInfo} onChange={e=>setTrackingInfo(e.target.value)} placeholder="Tracking reference/AWB..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none" />
                                            <button onClick={doDispatch} disabled={actionBusy || !trackingInfo} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100">Finalize Dispatch</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex bg-slate-50 border-b border-slate-100 px-4">
                        {[
                            { key: "overview", label: "Assets", icon: FileText },
                            { key: "students", label: `Manifest (${request.students?.length || 0})`, icon: Users },
                            { key: "samples", label: `Proofs (${request.samples?.length || 0})`, icon: Image },
                            { key: "timeline", label: `Audit Trail`, icon: Clock },
                        ].map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setTab(key)}
                                className={`flex items-center gap-2 px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all border-b-2
                                    ${tab === key 
                                        ? "border-indigo-600 text-indigo-600 bg-white" 
                                        : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                                <Icon size={12} /> {label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 flex-1">
                        {tab === "overview" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Manufacturing Materials</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {uploadsRaw.map((f, i) => {
                                            const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(f.url);
                                            const src = f.url.startsWith("http") ? f.url : `${BASE}${f.url}`;
                                            return (
                                                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col items-center gap-2 hover:bg-white transition-all shadow-sm">
                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                                                        {isImg ? <img src={src} className="w-full h-full object-contain p-1" /> : <FileText size={16} className="text-slate-300" />}
                                                    </div>
                                                    <a href={src} target="_blank" rel="noreferrer" className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter truncate w-full text-center">{f.label}</a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                         <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Globe size={10}/> Order Intel</p>
                                         <div className="space-y-1">
                                             <div className="flex justify-between text-[11px] font-black text-slate-800 italic"><span>Volume Profile:</span> <span>{request.students?.length} Units</span></div>
                                             <div className="flex justify-between text-[11px] font-black text-slate-800 italic"><span>Cycle Node:</span> <span>{request.status}</span></div>
                                         </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Production Directives</h3>
                                     <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] font-medium text-slate-600 leading-relaxed italic h-full">
                                         {request.remarks || "No special remarks indicated for this production cycle."}
                                     </div>
                                </div>
                            </div>
                        )}

                        {tab === "students" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                     <div className="relative w-full max-w-xs">
                                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                         <input placeholder="Filter manifest..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white" />
                                     </div>
                                     {role === "school" && <button onClick={()=>setIsAddStudentOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100"><Plus size={12}/> Inject Record</button>}
                                </div>
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                     <table className="w-full text-left text-xs">
                                         <thead className="bg-slate-50">
                                             <tr>
                                                 <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                                                 <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity Data</th>
                                                 <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Academic</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-50">
                                             {request.students?.map(s => (
                                                 <tr key={s.id} className="hover:bg-slate-50/50">
                                                     <td className="px-4 py-2">
                                                         <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                                                             {s.photo_url ? <img src={s.photo_url.startsWith('http')?s.photo_url : `${BASE}${s.photo_url}`} className="w-full h-full object-cover" /> : <div className="text-[8px] font-black text-slate-300">{s.first_name?.[0]}</div>}
                                                         </div>
                                                     </td>
                                                     <td className="px-4 py-2">
                                                         <p className="font-black text-slate-900 italic leading-none">{s.first_name} {s.last_name}</p>
                                                         <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">{s.admission_no}</p>
                                                     </td>
                                                     <td className="px-4 py-2 text-right">
                                                         <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{s.class}{s.section?`-${s.section}`:''}</span>
                                                     </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                </div>
                            </div>
                        )}

                        {tab === "samples" && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {request.samples?.map((s, i) => (
                                    <div key={s.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm group">
                                        <div className="p-3 border-b border-slate-100 bg-white flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            <span>Iteration 0{i+1}</span>
                                            <span>{new Date(s.uploaded_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="grid grid-cols-2 p-4 gap-4">
                                            <div className="bg-white rounded-lg border border-slate-100 p-1 aspect-[3/4]"><img src={s.sample_front_url.startsWith('http')?s.sample_front_url : `${BASE}${s.sample_front_url}`} className="w-full h-full object-contain"/></div>
                                            <div className="bg-white rounded-lg border border-slate-100 p-1 aspect-[3/4]"><img src={s.sample_back_url.startsWith('http')?s.sample_back_url : `${BASE}${s.sample_back_url}`} className="w-full h-full object-contain"/></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {tab === "timeline" && (
                            <div className="space-y-6 max-w-2xl mx-auto py-4">
                                {request.approvals?.map(a => (
                                    <div key={a.id} className="flex gap-4 items-start">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${a.action === 'APPROVED' ? 'bg-emerald-500 shadow-lg shadow-emerald-50' : 'bg-rose-500'}`}>
                                            {a.action === 'APPROVED' ? <Check size={14}/> : <XCircle size={14}/>}
                                        </div>
                                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase italic">{a.action_by_name}</h4>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(a.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium italic underline decoration-indigo-100 mb-2">"{a.comments || 'Direct protocol approval.'}"</p>
                                            <div className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">{a.action_role} · {a.action_stage} PHASE</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} requestId={id} tenantId={user?.tenant_id} onAdded={load} />
        </div>
    );
}

function SamplePicker({ label, value, onChange }) {
    const ref = useRef();
    return (
        <div className="flex-1 flex flex-col gap-1.5 cursor-pointer" onClick={()=>ref.current?.click()}>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">{label}</p>
            <div className={`aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all p-1 overflow-hidden
                ${value ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-white'}`}>
                {value ? <img src={URL.createObjectURL(value)} className="w-full h-full object-contain" /> : <Upload size={16} className="text-slate-300" />}
            </div>
            <input ref={ref} type="file" className="hidden" onChange={e=>onChange(e.target.files[0])} />
        </div>
    );
}