import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetAdminStats, apiGetRequests } from "../../utils/api";
import { Building2, Users, FileText, Loader2 } from "lucide-react";

const ROLE_LABELS = { GMMC_ADMIN: "GMMC Admin", SCHOOL_ADMIN: "School Admin", PRINTER: "Printer" };

const STATUS_COLORS = {
    SUBMITTED: "bg-gray-100 text-gray-600",
    GMMC_APPROVED: "bg-blue-50 text-blue-600",
    GMMC_REJECTED: "bg-red-50 text-red-600",
    PRINTER_APPROVED: "bg-indigo-50 text-indigo-600",
    SAMPLE_UPLOADED: "bg-yellow-50 text-yellow-700",
    SCHOOL_VERIFIED: "bg-emerald-50 text-emerald-700",
    BULK_PRINT_APPROVED: "bg-green-50 text-green-700",
};

export default function AdminOverview() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [reqs, setReqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([apiGetAdminStats(), apiGetRequests()])
            .then(([s, r]) => {
                setStats(s.data);
                setReqs((r.data || []).slice(0, 6));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { icon: Building2, label: "Active Tenants", value: stats?.tenants, border: "border-l-indigo-500" },
                    { icon: Users, label: "Active Users", value: stats?.users, border: "border-l-violet-500" },
                    { icon: FileText, label: "Total Requests", value: stats?.requests, border: "border-l-blue-500" },
                ].map(({ icon: Icon, label, value, border }) => (
                    <div key={label} className={`bg-white border border-gray-200 border-l-4 ${border} rounded-xl p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-500">{label}</p>
                            <Icon size={16} className="text-gray-400" />
                        </div>
                        {loading ? (
                            <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
                        ) : (
                            <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Role breakdown */}
            {stats?.roleBreakdown?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Users by Role</p>
                    <div className="flex gap-3 flex-wrap">
                        {stats.roleBreakdown.map((r) => (
                            <div key={r.role} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                <span className="text-xs font-medium text-gray-700">{ROLE_LABELS[r.role] || r.role}</span>
                                <span className="text-xs font-bold text-gray-900">{r.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent requests */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Recent Requests</p>
                    <button onClick={() => navigate("/idcard/requests")} className="text-xs text-indigo-600 hover:underline">View all</button>
                </div>
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
                ) : reqs.length === 0 ? (
                    <p className="p-8 text-center text-gray-400 text-sm">No requests yet.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {["Request No", "School", "Students", "Status", "Date"].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reqs.map((r) => (
                                <tr
                                    key={r.id}
                                    onClick={() => navigate(`/idcard/requests/${r.id}`)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-5 py-3.5 font-medium text-indigo-600">{r.request_no}</td>
                                    <td className="px-5 py-3.5 text-gray-700">{r.tenant_name || "—"}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{r.total_students ?? "—"}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                                            {r.status?.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                                        {new Date(r.created_at).toLocaleDateString("en-IN")}
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
