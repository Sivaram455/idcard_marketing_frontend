import { useState, useEffect, useRef } from "react"; 
import { useParams, useNavigate } from "react-router-dom"; 
import { useAuth } from "../../auth/AuthContext"; 
import { apiGetRequestById, apiCreateApproval, apiCreateSample, apiUploadFile, apiDispatchRequest } from "../../utils/api"; 
import { 
    ArrowLeft, FileText, Users, Image as ImageIcon, Clock, RefreshCw, 
    CheckCircle, XCircle, AlertCircle, Upload, Loader2, Check, 
    ChevronRight, User, Send, ExternalLink, Download, Eye
} from "lucide-react"; 
import ImageModal from "./ImageModal";

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
    DISPATCHED: { label: "Dispatched", color: "bg-blue-600 text-white", step: 7 }, 
}; 

const STEPS = ["Submitted", "GMMC Review", "Printer Review", "Sample Upload", "School Verified", "GMMC Final", "Print Approved", "Dispatched"]; 

const getAction = (role, status) => { 
    if (role === "admin" && status === "SUBMITTED") return { stage: "SUBMITTED", display: "GMMC", type: "review", next: "Send to Printer" }; 
    if (role === "admin" && status === "SCHOOL_VERIFIED") return { stage: "SCHOOL_VERIFIED", display: "GMMC FINAL", type: "review", next: "Finalize for Print" }; 
    if (role === "printer" && status === "GMMC_APPROVED") return { stage: "GMMC_APPROVED", display: "PRINTER", type: "review", next: "Accept Job" }; 
    if (role === "printer" && status === "PRINTER_APPROVED") return { stage: "PRINTER_APPROVED", display: "PRINTER", type: "sample", next: "Upload Digital Proof" }; 
    if (role === "school" && status === "SAMPLE_UPLOADED") return { stage: "SAMPLE_UPLOADED", display: "SCHOOL", type: "review", next: "Verify Proof" }; 
    if (role === "admin" && status === "GMMC_VERIFIED") return { stage: "GMMC_VERIFIED", display: "BULK PRINT", type: "review", next: "Authorize Bulk Print" }; 
    if (role === "printer" && status === "BULK_PRINT_APPROVED") return { stage: "BULK_PRINT_APPROVED", display: "DISPATCH", type: "dispatch", next: "Confirm Logistics" }; 
    return null; 
}; 

function SampleImagePicker({ label, value, onChange, onPreview }) { 
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
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic tracking-widest">{label}</p> 
            {value ? ( 
                <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50 group"> 
                    <img src={value.startsWith("http") ? value : `${BASE}${value}`} 
                        alt={label} className="w-full h-20 object-contain cursor-pointer" onClick={() => onPreview(value, label)} /> 
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onPreview(value, label)} 
                            className="bg-white border border-slate-200 rounded p-1 text-indigo-600 hover:bg-indigo-50"> 
                            <Eye size={10} /> 
                        </button> 
                        <button onClick={() => onChange("")} 
                            className="bg-white border border-slate-200 rounded p-1 text-rose-500 hover:bg-rose-50"> 
                            <XCircle size={10} /> 
                        </button> 
                    </div>
                </div> 
            ) : ( 
                <button onClick={() => ref.current?.click()} disabled={busy} 
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-200 hover:border-indigo-400 text-slate-400 hover:text-indigo-600 text-[9px] font-black uppercase py-4 rounded-lg transition-all disabled:opacity-60 bg-white"> 
                    {busy ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />} 
                    {busy ? "Syncing..." : `Upload ${label}`} 
                </button> 
            )} 
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} /> 
        </div> 
    ); 
} 

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
    const [trackingInfo, setTrackingInfo] = useState(""); 
    const [preview, setPreview] = useState({ open: false, url: "", title: "" });

    const openPreview = (url, title) => {
        const fullUrl = url.startsWith("http") ? url : `${BASE}${url}`;
        setPreview({ open: true, url: fullUrl, title });
    };

    const load = async () => { 
        setLoading(true); 
        try { const r = await apiGetRequestById(id); setRequest(r.data); } 
        catch { /* Error handled by UI check */ } 
        finally { setLoading(false); } 
    }; 
    useEffect(() => { load(); }, [id]); 

    // Use .status instead of .current_status as that's what the API typically returns 
    const statusVal = request?.status || request?.current_status; 
    const action = request ? getAction(user?.role, statusVal) : null; 
    const cfg = STATUS_CFG[statusVal] || { label: statusVal, color: "bg-gray-100 text-gray-600", step: 0 }; 
    const step = cfg.step; 

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

    const doDispatch = async () => { 
        if (!trackingInfo) { setMsg({ ok: false, text: "Please enter tracking information." }); return;} 
        setBusy(true); setMsg(null); 
        try { 
            await apiDispatchRequest(parseInt(id), trackingInfo); 
            await apiCreateApproval({ request_id: parseInt(id), action: "APPROVED", action_stage: "DISPATCH", comments: `Dispatched: ${trackingInfo}` 
            }); 
            setMsg({ ok: true, text: "Cards marked as dispatched!" }); 
            setTrackingInfo(""); 
            await load(); 
        } catch (e) { setMsg({ ok: false, text: e.message }); } 
        finally { setBusy(false); } 
    }; 

    if (loading) return ( 
        <div className="flex items-center justify-center h-64"> 
            <Loader2 size={18} className="animate-spin text-gray-300 mr-2" /> 
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Synchronizing...</span> 
        </div> 
    ); 
    if (!request) return ( 
        <div className="p-4 text-center"> 
            <p className="text-gray-400 text-xs font-bold uppercase">Node Void</p> 
            <button onClick={() => navigate("/idcard/requests")} className="mt-2 text-indigo-600 text-xs font-bold hover:underline italic">← RE-INDEX</button> 
        </div> 
    ); 

    const uploadsRaw = [ 
        { label: "Logo", url: request.school_logo_url }, 
        { label: "Sign", url: request.principal_signature_url }, 
        { label: "Sample", url: request.old_id_card_url }, 
        { label: "Excel", url: request.excel_file_url }, 
        { label: "ZIP", url: request.photos_zip_url }, 
    ].filter((f) => f.url && f.url !== ""); 

    return ( 
        <div className="p-3 max-w-[1440px] mx-auto space-y-2"> 
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2"> 
                <button onClick={() => navigate("/idcard/requests")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors border border-slate-100"> 
                    <ArrowLeft size={16} /> 
                </button> 
                <div className="flex-1 min-w-0"> 
                    <div className="flex items-center gap-2"> 
                        <h1 className="text-base font-black text-slate-900 uppercase italic truncate">{request.request_no}</h1> 
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span> 
                    </div> 
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate opacity-60"> 
                        {request.tenant_name} // {new Date(request.created_at).toLocaleDateString("en-GB")} 
                    </p> 
                </div> 
                <button onClick={load} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-colors border border-slate-100 rounded-lg"><RefreshCw size={14} /></button> 
            </div> 

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 overflow-x-auto scrollbar-hide"> 
                <div className="flex items-center min-w-[700px]"> 
                    {STEPS.map((s, i) => ( 
                        <div key={i} className="flex items-center flex-1 min-w-0"> 
                            <div className="flex flex-col items-center flex-shrink-0"> 
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all 
                                    ${i < step ? "bg-emerald-500 text-white" 
                                        : i === step ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                            : "bg-white border border-slate-100 text-slate-300"}`}> 
                                    {i < step ? <Check size={12} strokeWidth={3} /> : i + 1} 
                                </div> 
                                <p className={`text-[8px] font-black mt-1 text-center leading-tight uppercase tracking-tighter 
                                    ${i <= step ? "text-slate-900 italic" : "text-slate-300"}`}>{s}</p> 
                            </div> 
                            {i < STEPS.length - 1 && ( 
                                <div className={`h-0.5 flex-1 mx-1 mb-3 ${i < step ? "bg-emerald-400" : "bg-slate-100"}`} /> 
                            )} 
                        </div> 
                    ))} 
                </div> 
            </div> 

            {action && ( 
                <div className={`border-2 rounded-xl p-3 relative overflow-hidden group ${action.type === "sample" ? "border-indigo-100 bg-indigo-50/30" : "border-amber-100 bg-amber-50/30"}`}> 
                    <div className="flex items-start gap-3 relative z-10"> 
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.type === "sample" ? "bg-indigo-600 text-white" : "bg-amber-500 text-white"}`}> 
                            {action.type === "sample" ? <ImageIcon size={16} /> : <AlertCircle size={16} />} 
                        </div> 
                        <div className="flex-1 min-w-0"> 
                            <div className="flex items-center gap-2"> 
                                <p className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight"> 
                                    {action.type === "sample" ? "Transmit Digital Proof" : `AWAITING ${action.display} AUTHORIZATION`} 
                                </p> 
                                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[7px] font-black uppercase rounded tracking-widest animate-pulse">Required</span> 
                            </div> 
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 italic"> 
                                Next Step: {action.next} 
                            </p> 
                        </div> 
                    </div> 

                    {msg && ( 
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg mt-3 
                            ${msg.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm" : "bg-rose-50 text-rose-700 border border-rose-100 shadow-sm"}`}> 
                            {msg.ok ? <Check size={12} strokeWidth={3} /> : <AlertCircle size={12} strokeWidth={3} />} {msg.text} 
                        </div> 
                    )} 

                    <div className="mt-3"> 
                        {action.type === "sample" && ( 
                            <div className="space-y-3"> 
                                <div className="grid grid-cols-2 gap-3"> 
                                    <SampleImagePicker label="Front View" value={sampleF} onChange={setSampleF} onPreview={openPreview} /> 
                                    <SampleImagePicker label="Back View" value={sampleB} onChange={setSampleB} onPreview={openPreview} /> 
                                </div> 
                                <button onClick={doSample} disabled={busy || !sampleF || !sampleB} 
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-lg disabled:opacity-50 transition-all shadow-xl shadow-slate-200"> 
                                    {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} 
                                    Transmit Stream to School 
                                </button> 
                            </div> 
                        )} 

                        {action.type === "review" && ( 
                            <div className="space-y-2"> 
                                <input value={comments} onChange={(e) => setComments(e.target.value)} 
                                    placeholder="OPERATIONAL REMARKS (OPTIONAL)..." 
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest outline-none focus:border-indigo-600 bg-white shadow-inner" /> 
                                <div className="flex gap-2"> 
                                    <button onClick={() => doApproval("APPROVED")} disabled={busy} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5 rounded-lg disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"> 
                                        {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} 
                                        Authorize 
                                    </button> 
                                    <button onClick={() => doApproval("REJECTED")} disabled={busy} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 text-[10px] font-black uppercase tracking-[0.2em] py-2.5 rounded-lg disabled:opacity-50 transition-all"> 
                                        {busy ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} 
                                        Reject 
                                    </button> 
                                </div> 
                            </div> 
                        )} 
                        
                        {action.type === "dispatch" && ( 
                            <div className="space-y-2"> 
                                <input value={trackingInfo} onChange={(e) => setTrackingInfo(e.target.value)} 
                                    placeholder="ENTER TRACKING ID / AWB..." 
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest outline-none focus:border-indigo-600 bg-white shadow-inner" /> 
                                <button onClick={doDispatch} disabled={busy} 
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-lg disabled:opacity-50 transition-all shadow-xl shadow-indigo-100"> 
                                    {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} 
                                    Finalize Dispatch 
                                </button> 
                            </div> 
                        )} 
                    </div> 
                </div> 
            )} 

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[400px]"> 
                <div className="flex bg-slate-50/30 border-b border-slate-100 px-2 overflow-x-auto scrollbar-hide"> 
                    {[ 
                        { key: "overview", label: "Overview", icon: FileText }, 
                        { key: "students", label: `Students (${request.students?.length || 0})`, icon: Users }, 
                        { key: "samples", label: `Samples (${request.samples?.length || 0})`, icon: ImageIcon }, 
                        { key: "timeline", label: `Timelines (${request.approvals?.length || 0})`, icon: Clock }, 
                    ].map(({ key, label, icon: Icon }) => ( 
                        <button key={key} onClick={() => setTab(key)} 
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap 
                                ${tab === key ? "border-indigo-600 text-indigo-600 bg-white italic" : "border-transparent text-slate-300 hover:text-slate-600"}`}> 
                            <Icon size={12} strokeWidth={3} /> {label} 
                        </button> 
                    ))} 
                </div> 

                <div className="p-3 flex-1 animate-in fade-in duration-500"> 
                    {tab === "overview" && ( 
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> 
                            <div className="lg:col-span-2"> 
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 italic">Ingested Assets</p> 
                                {uploadsRaw.length === 0 ? ( 
                                    <p className="text-[10px] text-slate-300 italic p-4 text-center border border-dashed border-slate-100 rounded-lg">Null Buffer</p> 
                                ) : ( 
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2"> 
                                        {uploadsRaw.map((f, i) => { 
                                            const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(f.url); 
                                            const src = f.url.startsWith("http") ? f.url : `${BASE}${f.url}`; 
                                            return ( 
                                                <div key={i} className="flex items-center gap-2 border border-slate-100 rounded-lg px-2 py-1 bg-white hover:border-indigo-200 transition-all group cursor-pointer" onClick={() => isImg && openPreview(f.url, f.label)}> 
                                                    {isImg 
                                                        ? <img src={src} alt={f.label} className="w-7 h-7 object-contain rounded border border-slate-50 bg-slate-50 shrink-0 group-hover:scale-110 transition-transform" /> 
                                                        : <div className="w-7 h-7 bg-slate-50 rounded border border-slate-50 flex items-center justify-center shrink-0"><FileText size={12} className="text-slate-200" /></div> 
                                                    } 
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[8px] text-slate-900 font-black uppercase truncate italic leading-tight">{f.label}</p>
                                                        <div className="flex gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); isImg ? openPreview(f.url, f.label) : window.open(src, "_blank"); }} className="text-[7px] font-black text-indigo-600 hover:underline uppercase tracking-widest">VIEW</button> 
                                                            <a href={src} download target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[7px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">GET</a>
                                                        </div>
                                                    </div>
                                                </div> 
                                            ); 
                                        })} 
                                    </div> 
                                )} 
                            </div> 
                            <div className="space-y-3"> 
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 italic">Cycle Metadata</p> 
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 space-y-1.5"> 
                                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Manifest</span><span className="text-[10px] font-black text-slate-900 italic">{request.students?.length || 0} Nodes</span></div> 
                                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Ingestion</span><span className="text-[10px] font-black text-slate-900 italic">{new Date(request.created_at).toLocaleDateString("en-GB")}</span></div> 
                                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Origin</span><span className="text-[10px] font-black text-slate-900 italic truncate ml-4">{request.tenant_name}</span></div> 
                                    </div> 
                                </div>

                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 italic">Operational Remarks</p> 
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 min-h-[60px]"> 
                                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic uppercase">{request.remarks || "No constraints logged."}</p> 
                                    </div> 
                                </div>
 
                                {request.tracking_info && ( 
                                    <div className="p-3 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-100"> 
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Logistics ID</p> 
                                        <p className="text-[11px] font-black italic mt-0.5 tracking-tight truncate">{request.tracking_info}</p> 
                                    </div> 
                                )} 
                            </div> 
                        </div> 
                    )} 
 
                     {tab === "students" && ( 
                         request.students?.length === 0 
                             ? <p className="text-[10px] text-slate-300 font-black uppercase italic text-center py-12">Manifest Zero</p> 
                             : <div className="overflow-x-auto border border-slate-100 rounded-lg"> 
                                 <table className="w-full text-left"> 
                                     <thead className="bg-slate-50/50 border-b border-slate-100"> 
                                         <tr>{["Identity", "Node ID", "Manifest Name", "Level", "Type", "Status"].map((h) => ( 
                                             <th key={h} className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{h}</th> 
                                         ))}</tr> 
                                     </thead> 
                                     <tbody className="divide-y divide-slate-50"> 
                                         {request.students.map((s) => { 
                                             const src = s.photo_url ? (s.photo_url.startsWith("http") ? s.photo_url : `${BASE}${s.photo_url}`) : null; 
                                             return ( 
                                                 <tr key={s.id} className="hover:bg-slate-50 transition-colors"> 
                                                     <td className="px-3 py-1.5"> 
                                                         {src ? <img src={src} alt={s.first_name} className="w-7 h-7 object-cover rounded border border-slate-100 bg-white cursor-pointer" onClick={() => openPreview(s.photo_url, `${s.first_name} ${s.last_name}`)} /> 
                                                             : <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-[9px] font-black text-slate-200">{s.first_name?.[0]}{s.last_name?.[0]}</div>} 
                                                     </td> 
                                                     <td className="px-3 py-1.5 text-slate-900 text-[9px] font-black italic tracking-tighter uppercase">{s.admission_no}</td> 
                                                     <td className="px-3 py-1.5 text-[9px] font-black text-slate-900 uppercase italic truncate">{s.first_name} {s.last_name}</td> 
                                                     <td className="px-3 py-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.class || "—"}{s.section ? `-${s.section}` : ""}</td> 
                                                     <td className="px-3 py-1.5">{s.blood_group ? <span className="text-[7px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 italic">{s.blood_group}</span> : "—"}</td> 
                                                     <td className="px-3 py-1.5"><span className="text-[7px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 italic uppercase tracking-tighter">{s.status}</span></td> 
                                                 </tr> 
                                             ); 
                                         })} 
                                     </tbody> 
                                 </table> 
                             </div> 
                     )} 
 
                     {tab === "samples" && ( 
                         request.samples?.length === 0 
                             ? <p className="text-[10px] text-slate-300 font-black uppercase italic text-center py-12">Stream Null</p> 
                             : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"> 
                                 {request.samples.map((s, idx) => { 
                                     return ( 
                                         <div key={s.id} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm hover:border-indigo-200 transition-all group"> 
                                             <div className="grid grid-cols-2 divide-x divide-slate-50 bg-slate-50/30"> 
                                                 <div className="p-1.5 cursor-pointer" onClick={() => openPreview(s.sample_front_url, `Sample V${idx+1} Front`)}> 
                                                     <img src={s.sample_front_url.startsWith("http") ? s.sample_front_url : `${BASE}${s.sample_front_url}`} alt="front" className="w-full h-20 object-contain border border-white rounded shadow-inner group-hover:scale-105 transition-transform" /> 
                                                 </div> 
                                                 <div className="p-1.5 cursor-pointer" onClick={() => openPreview(s.sample_back_url, `Sample V${idx+1} Back`)}> 
                                                     <img src={s.sample_back_url.startsWith("http") ? s.sample_back_url : `${BASE}${s.sample_back_url}`} alt="back" className="w-full h-20 object-contain border border-white rounded shadow-inner group-hover:scale-105 transition-transform" /> 
                                                 </div> 
                                             </div> 
                                             <div className="px-2 py-1 border-t border-slate-50 flex justify-between items-center bg-white"> 
                                                 <p className="text-[7px] font-black text-slate-400 uppercase italic tracking-tighter">NODE V{idx + 1}</p> 
                                                 <p className="text-[7px] font-black text-slate-300 italic">{new Date(s.uploaded_at).toLocaleDateString("en-GB")}</p> 
                                             </div> 
                                         </div> 
                                     ); 
                                 })} 
                             </div> 
                     )} 
 
                     {tab === "timeline" && ( 
                         request.approvals?.length === 0 
                             ? <p className="text-[10px] text-slate-300 font-black uppercase italic text-center py-12">Audit Null</p> 
                             : <div className="space-y-2 max-w-2xl mx-auto"> 
                                 {request.approvals.map((a, idx) => ( 
                                     <div key={a.id} className="flex gap-3 items-start relative"> 
                                         {idx !== request.approvals.length - 1 && (
                                             <div className="absolute left-3 top-7 w-0.5 h-full bg-slate-100" />
                                         )}
                                         <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 z-10 shadow-lg 
                                         ${a.action === "APPROVED" ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-rose-500 text-white shadow-rose-100"}`}> 
                                             {a.action === "APPROVED" 
                                                 ? <Check size={12} strokeWidth={4} /> 
                                                 : <XCircle size={12} strokeWidth={4} />} 
                                         </div> 
                                         <div className="flex-1 border border-slate-100 rounded-xl px-3 py-2 bg-white hover:border-indigo-100 transition-all"> 
                                             <div className="flex items-start justify-between gap-2"> 
                                                 <div> 
                                                     <p className="text-[10px] font-black text-slate-900 uppercase italic truncate">{a.action_by_name || "SYSTEM"}</p> 
                                                     <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">{a.action_role} // {a.action_stage}</p> 
                                                 </div> 
                                                 <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase italic tracking-tighter flex-shrink-0 
                                                 ${a.action === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}> 
                                                     {a.action} 
                                                 </span> 
                                             </div> 
                                             {a.comments && <p className="text-[9px] font-bold text-slate-500 mt-1.5 border-t border-slate-50 pt-1.5 italic uppercase leading-relaxed">"{a.comments}"</p>} 
                                             <p className="text-[7px] text-slate-300 font-black mt-1 text-right uppercase italic">{new Date(a.created_at).toLocaleString("en-GB")}</p> 
                                         </div> 
                                     </div> 
                                 ))} 
                             </div> 
                     )} 
                 </div> 
             </div> 
             <ImageModal 
                isOpen={preview.open} 
                onClose={() => setPreview({ ...preview, open: false })} 
                imageUrl={preview.url} 
                title={preview.title} 
             />
         </div> 
     ); 
} 
