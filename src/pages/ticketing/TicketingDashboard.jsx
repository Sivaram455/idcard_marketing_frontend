import { useState, useEffect } from "react";
import { 
    Ticket, Clock, CheckCircle, AlertCircle, 
    Search, Plus, Filter, MessageSquare, 
    ChevronRight, User, Calendar, Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGetTickets, apiUpdateTicket, apiGetDevelopers } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../auth/AuthContext";

export default function TicketingDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All Status");
    const [filterDev, setFilterDev] = useState("");
    const [developers, setDevelopers] = useState([]);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        fetchTickets();
        fetchDevelopers();
    }, []);

    const fetchDevelopers = async () => {
        try {
            const data = await apiGetDevelopers();
            if (data.success) setDevelopers(data.data);
        } catch (err) {
            console.error("Failed to fetch developers:", err);
        }
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await apiGetTickets();
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (err) {
            showToast(err.message || "Failed to fetch tickets", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAssign = async (e, ticketId, developerId = null) => {
        e.stopPropagation(); // Prevent navigating to details
        const devId = developerId || user.id;
        try {
            const data = await apiUpdateTicket(ticketId, { 
                assigned_to: devId, 
                status: 'IN_PROGRESS' 
            });
            if (data.success) {
                showToast("Ticket assigned successfully!", "success");
                fetchTickets();
            }
        } catch (err) {
            showToast(err.message || "Failed to assign ticket", "error");
        }
    };

    const stats = [
        { label: "Total Tickets", value: tickets.length, icon: Ticket, color: "bg-blue-50 text-blue-600" },
        { label: "Open", value: tickets.filter(t => t.status === 'OPEN').length, icon: Clock, color: "bg-amber-50 text-amber-600" },
        { label: "Resolved", value: tickets.filter(t => t.status === 'RESOLVED').length, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
        { label: "High Priority", value: tickets.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length, icon: AlertCircle, color: "bg-rose-50 text-rose-600" },
    ];

    const isInternal = user?.role === 'admin' || user?.role === 'GMMC_ADMIN' || user?.role === 'SUPPORT' || user?.role === 'DEVELOPER';

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toString().includes(searchTerm);
        const matchesStatus = filterStatus === "All Status" || t.status === filterStatus.toUpperCase().replace(" ", "_");
        const matchesDev = !filterDev || t.assigned_to === parseInt(filterDev);
        return matchesSearch && matchesStatus && matchesDev;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'text-rose-600 bg-rose-50';
            case 'HIGH': return 'text-orange-600 bg-orange-50';
            case 'MEDIUM': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all technical support tickets across tenants.</p>
                </div>
                <button 
                    onClick={() => navigate("/ticketing/new")}
                    className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 text-sm"
                >
                    <Plus size={18} />
                    Create New Ticket
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900 leading-none mt-1">{loading ? "..." : stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Table Area */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search tickets by title or ID..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
                            <Filter size={18} />
                        </button>
                        <select 
                            className="bg-gray-50 border-none text-sm rounded-xl py-2 pl-3 pr-8 focus:ring-2 focus:ring-amber-500 transition-all font-medium text-gray-600"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option>All Status</option>
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                            <option>Closed</option>
                        </select>
                        {isInternal && (
                            <select 
                                className="bg-gray-50 border-none text-sm rounded-xl py-2 pl-3 pr-8 focus:ring-2 focus:ring-amber-500 transition-all font-medium text-gray-600"
                                value={filterDev}
                                onChange={(e) => setFilterDev(e.target.value)}
                            >
                                <option value="">All Developers</option>
                                {developers.map(dev => (
                                    <option key={dev.id} value={dev.id.toString()}>{dev.full_name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Assign</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Team</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8 h-16 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/ticketing/${ticket.id}`)}>
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-xs font-bold text-gray-400">#TK-{ticket.id.toString().padStart(4, '0')}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{ticket.title}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium italic">
                                                        <Calendar size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-bold px-1.5 py-0.5 bg-gray-100 rounded">
                                                        {ticket.tenant_name || 'System'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {isInternal && !ticket.assigned_to ? (
                                                <div className="relative inline-block w-full max-w-[140px]" onClick={(e) => e.stopPropagation()}>
                                                    <select 
                                                        className="w-full bg-indigo-50 border-none rounded-xl text-[10px] font-bold py-1.5 pl-2 pr-6 appearance-none focus:ring-2 focus:ring-indigo-400 transition-all text-indigo-700 cursor-pointer shadow-sm hover:bg-indigo-100"
                                                        value=""
                                                        onChange={(e) => handleQuickAssign(e, ticket.id, e.target.value)}
                                                    >
                                                        <option value="" disabled hidden>Assign Dev...</option>
                                                        {developers.map(dev => (
                                                            <option key={dev.id} value={dev.id}>
                                                                {dev.full_name.split(' ')[0]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                                                        <User size={10} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    {ticket.assigned_to ? (
                                                        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600" title={`Assigned to ${ticket.assignee_name}`}>
                                                            <CheckCircle size={14} />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-300 italic">Open Pool</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[10px] text-right">
                                                        <p className="font-bold text-gray-700 leading-tight truncate max-w-[80px]">{ticket.creator_name?.split(" ")[0]}</p>
                                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Reporter</p>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                                        <User size={10} className="text-indigo-600" />
                                                    </div>
                                                </div>
                                                {ticket.assigned_to && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[10px] text-right">
                                                            <p className="font-bold text-emerald-700 leading-tight truncate max-w-[80px]">{ticket.assignee_name?.split(" ")[0]}</p>
                                                            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter text-nowrap">Assigned Dev</p>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                                            <CheckCircle size={10} className="text-emerald-600" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all group-hover:translate-x-1">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Ticket size={32} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-600">No tickets found</p>
                                                <p className="text-xs">Try adjusting your filters or search term.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Help / Activity Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <MessageSquare size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Recent Activity</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">View real-time updates on ticket resolutions and developer comments.</p>
                        <button className="text-xs font-bold text-amber-600 hover:underline">View activity log →</button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Settings size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Technical Support</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">Are you facing system-critical issues? Please use the high priority channel.</p>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">System status (99.9%) →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
