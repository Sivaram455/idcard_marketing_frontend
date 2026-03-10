import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiGetRequests } from "../../utils/api";
import {
    FileText, CheckCircle, Plus,
    ChevronRight, Loader2, AlertCircle, TrendingUp, BarChart, Users,
    LogOut, Layers, Activity
} from "lucide-react";

const STATUS_META = {
    SUBMITTED: { label: "Submitted", color: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-400" },
    GMMC_APPROVED: { label: "GMMC Approved", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    GMMC_REJECTED: { label: "GMMC Rejected", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    PRINTER_APPROVED: { label: "Printer Approved", color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
    PRINTER_REJECTED: { label: "Printer Rejected", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    SAMPLE_UPLOADED: { label: "Sample Uploaded", color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
    SCHOOL_VERIFIED: { label: "School Verified", color: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
    GMMC_VERIFIED: { label: "GMMC Verified", color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
    BULK_PRINT_APPROVED: { label: "Print Approved", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
};

export default function IDCardDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        apiGetRequests()
            .then((r) => {
                if (isMounted) setRequests(r.data || []);
            })
            .catch((err) => {
                console.error(err);
                if (isMounted) setError("Failed to fetch dashboard data.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    const isSchool = useMemo(() => ["school", "SCHOOL_ADMIN"].includes(user?.role), [user?.role]);
    const isAdmin = useMemo(() => ["admin", "GMMC_ADMIN"].includes(user?.role), [user?.role]);

    // ── Memoized Analytics Calculations ──────────────────────────────────────
    const stats = useMemo(() => {
        const total = requests.length;
        const completed = requests.filter(r => r.status === "BULK_PRINT_APPROVED").length;
        const rejected = requests.filter(r => r.status?.includes("REJECTED")).length;
        const inProgress = total - completed - rejected;

        const totalStudents = requests.reduce((sum, r) => sum + (Number(r.total_students) || 0), 0);
        const printedStudents = requests
            .filter(r => r.status === "BULK_PRINT_APPROVED")
            .reduce((sum, r) => sum + (Number(r.total_students) || 0), 0);
        
        const studentsInPrinting = requests
            .filter(r => ["GMMC_VERIFIED", "BULK_PRINT_APPROVED"].includes(r.status))
            .reduce((sum, r) => sum + (Number(r.total_students) || 0), 0);

        // Actionable logic
        let actionableCount = 0;
        if (isAdmin) actionableCount = requests.filter(r => ["SUBMITTED", "SCHOOL_VERIFIED"].includes(r.status)).length;
        else if (user?.role === "printer") actionableCount = requests.filter(r => ["GMMC_APPROVED", "PRINTER_APPROVED"].includes(r.status)).length;
        else if (isSchool) actionableCount = requests.filter(r => r.status === "SAMPLE_UPLOADED").length;

        return { total, completed, rejected, inProgress, totalStudents, printedStudents, studentsInPrinting, actionableCount };
    }, [requests, isAdmin, isSchool, user?.role]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date) ? "N/A" : date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
    };

    // ── Components ──────────────────────────────────────────────────────────
    const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 pointer-events-none ${colorClass.split(' ')[0]}`} />
            <div className="flex justify-between items-start mb-4 relative">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="relative">
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{loading ? "—" : value}</h3>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(isAdmin ? "/admin-portal" : "/idcard/dashboard")}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center shadow-inner">
                            <Layers size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-900 tracking-tight">GMMC PORTAL</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {user?.full_name?.charAt(0) || "U"}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900 leading-tight">{user?.full_name || "User"}</p>
                                <p className="text-xs text-gray-500">{isAdmin ? "Super Admin" : user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6 flex-1">
                {isAdmin && (
                    <button onClick={() => navigate("/admin-portal")} className="text-sm font-medium text-gray-500 hover:text-indigo-600 mb-2 inline-flex items-center gap-1 transition-colors">
                        <ChevronRight size={14} className="rotate-180" /> Back to Admin Portal
                    </button>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">
                            Welcome back, {user?.full_name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-indigo-200 text-sm sm:text-base max-w-xl leading-relaxed">
                            {isSchool
                                ? `Manage ID card requests for ${user?.tenant_name || 'your school'}. Track progress from submission to printing.`
                                : "Monitor the ID card pipeline, review pending requests, and manage approvals across all schools."}
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-3 mt-4 sm:mt-0">
                        {isSchool && (
                            <button
                                onClick={() => navigate("/idcard/create-request")}
                                className="flex items-center gap-2 bg-white text-indigo-900 hover:bg-gray-50 hover:scale-[1.02] text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
                            >
                                <Plus size={18} /> Create Request
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-2">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {!loading && stats.actionableCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-amber-900">Action Required</h4>
                                <p className="text-sm text-amber-700">You have {stats.actionableCount} request(s) waiting for your review.</p>
                            </div>
                        </div>
                        <button onClick={() => navigate("/idcard/requests")} className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline bg-amber-100/50 px-4 py-2 rounded-lg transition-colors">
                            View now
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                    <StatCard title="Total Requests" value={stats.total} icon={FileText} colorClass="bg-blue-100 text-blue-600" />
                    <StatCard title="In Progress" value={stats.inProgress} subtitle="Moving through workflow" icon={TrendingUp} colorClass="bg-amber-100 text-amber-600" />
                    <StatCard title="Completed" value={stats.completed} subtitle="Ready for physical delivery" icon={CheckCircle} colorClass="bg-emerald-100 text-emerald-600" />
                    <StatCard title="Students Processed" value={stats.totalStudents} subtitle={`${stats.printedStudents} passed final approval`} icon={Users} colorClass="bg-purple-100 text-purple-600" />
                    <StatCard title="Printing" value={stats.studentsInPrinting} subtitle="Final production phase" icon={Activity} colorClass="bg-rose-100 text-rose-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:col-span-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart size={18} className="text-gray-400" />
                            <h2 className="text-base font-bold text-gray-800">Pipeline Breakdown</h2>
                        </div>
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
                        ) : stats.total === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <FileText size={32} className="mb-2 opacity-50" />
                                <p className="text-sm">No data to display</p>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1 justify-center flex flex-col">
                                {[
                                    { label: "New / Reviewing", count: requests.filter(r => ["SUBMITTED", "GMMC_APPROVED"].includes(r.status)).length, color: "bg-blue-500" },
                                    { label: "Sampling / Verification", count: requests.filter(r => ["PRINTER_APPROVED", "SAMPLE_UPLOADED", "SCHOOL_VERIFIED", "GMMC_VERIFIED"].includes(r.status)).length, color: "bg-amber-500" },
                                    { label: "Approved for Print", count: stats.completed, color: "bg-emerald-500" },
                                    { label: "Rejected", count: stats.rejected, color: "bg-red-500" }
                                ].map(item => item.count > 0 && (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                                            <span className="text-gray-600">{item.label}</span>
                                            <span className="text-gray-900">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-2.5 rounded-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${(item.count / stats.total) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h2 className="text-base font-bold text-gray-800">Recent Requests</h2>
                            <button onClick={() => navigate("/idcard/requests")} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                View All →
                            </button>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            {loading ? (
                                <div className="p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
                            ) : requests.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300"><FileText size={24} /></div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-1">No requests found</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Get started by creating a new ID card request.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            {["Request ID", "Students", "Status", "Created", ""].map((h) => (
                                                <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {requests.slice(0, 5).map((r) => {
                                            const meta = STATUS_META[r.status] || STATUS_META.SUBMITTED;
                                            return (
                                                <tr key={r.id} onClick={() => navigate(`/idcard/requests/${r.id}`)} className="hover:bg-indigo-50/40 cursor-pointer transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{r.request_no}</div>
                                                        {isAdmin && <div className="text-xs text-gray-500 mt-0.5">{r.tenant_name}</div>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Users size={14} className="text-gray-400" />
                                                            <span className="font-medium">{r.total_students ?? 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                                            {meta.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(r.created_at)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}