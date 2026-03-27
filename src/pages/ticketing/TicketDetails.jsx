import { useState, useEffect } from "react";
import {
    ArrowLeft, Calendar, User, Clock, CheckCircle,
    AlertCircle, MessageSquare, Send, ChevronRight,
    Paperclip, ShieldAlert, History, FileText
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetTicketById, apiUpdateTicket } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../auth/AuthContext";

export default function TicketDetails() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const data = await apiGetTicketById(id);
            if (data.success) {
                setTicket(data.ticket);
                setNewStatus(data.ticket.status);
            }
        } catch (err) {
            showToast(err.message || "Failed to fetch ticket", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            const data = await apiUpdateTicket(id, { status: newStatus });
            if (data.success) {
                showToast("Ticket status updated!", "success");
                fetchTicket();
            }
        } catch (err) {
            showToast(err.message || "Update failed", "error");
        }
    };

    const handleAssignToMe = async () => {
        try {
            const data = await apiUpdateTicket(id, { assigned_to: user.id, status: 'IN_PROGRESS' });
            if (data.success) {
                showToast("Ticket assigned to you!", "success");
                fetchTicket();
            }
        } catch (err) {
            showToast(err.message || "Assignment failed", "error");
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse text-gray-400 font-bold">Loading ticket details...</div>;
    if (!ticket) return <div className="p-12 text-center text-red-500 font-bold">Ticket not found or access denied.</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'border-amber-400 text-amber-600 bg-amber-50';
            case 'IN_PROGRESS': return 'border-blue-400 text-blue-600 bg-blue-50';
            case 'RESOLVED': return 'border-emerald-400 text-emerald-600 bg-emerald-50';
            case 'CLOSED': return 'border-gray-400 text-gray-500 bg-gray-50';
            default: return 'border-gray-400 text-gray-500 bg-gray-50';
        }
    };

    const isInternal = user?.role === 'admin' || user?.role === 'GMMC_ADMIN' || user?.role === 'SUPPORT' || user?.role === 'DEVELOPER';

    const poppins = { fontFamily: "'Poppins', sans-serif" };

    return (
        <div style={poppins} className="max-w-6xl mx-auto space-y-5 pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/ticketing")}
                        className="p-2 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-gray-400 hover:text-gray-700 shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">#TK-{ticket.id.toString().padStart(4, '0')}</span>
                            <h1 className="text-lg font-extrabold text-gray-900 leading-tight tracking-tight uppercase italic">{ticket.title}</h1>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                            <Calendar size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 border-2 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'OPEN' && <Clock size={14} />}
                        {ticket.status === 'RESOLVED' && <CheckCircle size={14} />}
                        {ticket.status}
                    </div>
                    {isInternal && (
                        <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                            <select
                                className="bg-transparent border-none text-xs font-bold py-1.5 focus:ring-0 mr-2"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                            <button
                                onClick={handleUpdateStatus}
                                className="bg-amber-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                            >
                                Save Status
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content Area */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Description Card */}
                    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <div className="flex border-b border-gray-50 pb-4 mb-5 justify-between items-start">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                                    <User size={16} className="text-indigo-600 font-bold" />
                                </div>
                                <div className="text-sm leading-none">
                                    <p className="font-extrabold text-gray-900 text-xs uppercase tracking-tight">{ticket.creator_name}</p>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">Reporter</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">School Root</p>
                                <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded-lg text-[10px] font-black border border-gray-100 uppercase tracking-tighter shadow-sm">{ticket.tenant_name || 'System Base'}</span>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-bold text-xs">
                            {ticket.description.split('\n').map((line, i) => (
                                <p key={i} className="mb-3">{line}</p>
                            ))}
                        </div>

                        {ticket.attachments && ticket.attachments.length > 0 ? (
                            <div className="mt-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black mb-3 uppercase tracking-widest">
                                    <Paperclip size={12} strokeWidth={3} /> {ticket.attachments.length} Artifact{ticket.attachments.length > 1 ? 's' : ''} detected
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ticket.attachments.map(att => (
                                        <a
                                            key={att.id}
                                            href={`http://localhost:5001${att.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-200 transition-all group"
                                        >
                                            <div className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-gray-800 truncate uppercase tracking-tighter">{att.file_name}</p>
                                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{new Date(att.uploaded_at).toLocaleDateString()}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold">
                                    <Paperclip size={14} /> NO ATTACHMENTS PROVIDED
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Chat Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                            <MessageSquare className="text-indigo-500" size={16} strokeWidth={3} />
                            <h2 className="font-black text-gray-900 text-xs uppercase tracking-widest leading-none">Intelligence Feed</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3 opacity-80">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-100 shadow-sm">
                                    <ShieldAlert size={12} strokeWidth={3} className="text-amber-600" />
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                                    <p className="text-[8px] font-black text-amber-600 mb-1 uppercase tracking-[0.2em]">Protocol Message</p>
                                    Initial manifest established. Priority assigned to the pool.
                                </div>
                            </div>

                            <p className="text-center text-[8px] text-gray-300 font-black uppercase tracking-[0.3em] py-2">Stream Nominal</p>
                        </div>
                        <div className="px-6 pb-6 bg-white">
                            <div className="relative group">
                                <textarea
                                    placeholder="Annotate case file..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none shadow-inner italic"
                                    rows="1"
                                ></textarea>
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                    <Send size={14} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div className="space-y-6 md:sticky md:top-24 h-fit">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 -z-0 opacity-40"></div>
                        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-4 relative z-10 flex items-center gap-2">
                            <History size={12} /> Sidebar Summary
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-1">Status</p>
                                <div className="flex items-center gap-2 font-black text-sm text-gray-700 uppercase">
                                    <div className={`w-2 h-2 rounded-full ${ticket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-amber-500 pulse-slow'}`}></div>
                                    {ticket.status}
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-1">Priority</p>
                                <div className={`flex items-center gap-1.5 font-black text-xs px-2.5 py-1 rounded-lg w-fit ${ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <AlertCircle size={14} /> {ticket.priority}
                                </div>
                            </div>
                            <div className="border-t border-gray-50 pt-4">
                                <p className="text-[11px] font-bold text-gray-400 mb-1">Assigned Support</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full ${ticket.assigned_to ? 'bg-indigo-100' : 'bg-gray-100'} flex items-center justify-center border ${ticket.assigned_to ? 'border-indigo-200' : 'border-gray-200'}`}>
                                        <User size={14} className={ticket.assigned_to ? 'text-indigo-600' : 'text-gray-400'} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-700 leading-tight">
                                            {ticket.assignee_name || 'UNASSIGNED'}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {ticket.assigned_to ? 'Assigned Developer' : 'Available to pick up'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {user?.role === 'DEVELOPER' && !ticket.assigned_to && (
                                <button
                                    onClick={handleAssignToMe}
                                    className="w-full mt-2 bg-indigo-50 text-indigo-700 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    Assign to me <ChevronRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2 underline decoration-indigo-400 underline-offset-4">Technical Details</h4>
                        <p className="text-[10px] text-indigo-100 leading-relaxed font-medium">Use internal debugging tools if this issue is related to the database schema or API endpoints.</p>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-[10px]">
                                <span className="opacity-60">Version</span>
                                <span className="font-black">v2.4.0-pro</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="opacity-60">Node Instance</span>
                                <span className="font-black">US-WEST-1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
