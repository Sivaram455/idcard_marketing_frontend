import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetOrders, apiGetOrderStats, apiCreateOrder, apiUpdateOrder, apiDeleteOrder, apiGetMarketingSchools } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import {
    Plus, X, Search, RefreshCw, Building2, Package,
    DollarSign, Calendar, CheckCircle, Clock, FileText,
    ChevronRight, Edit3, Trash2, TrendingUp, Loader2, Save
} from "lucide-react";

const poppins = { fontFamily: "'Poppins', sans-serif" };

const MODULE_OPTIONS = [
    "Admission Management", "Student Information System", "Attendance (Student)",
    "Attendance (Staff)", "Fee Management", "Online Payments", "Exams & Results",
    "Report Cards", "Timetable", "Homework / Assignments", "Parent Portal",
    "Student Portal", "Teacher Portal", "Transport Management", "Hostel Management",
    "Library Management", "HR & Payroll", "Inventory", "SMS / WhatsApp Alerts",
    "Mobile App Required", "ID Card"
];

const STATUS_COLORS = {
    Draft:     "bg-slate-100 text-slate-600",
    Confirmed: "bg-blue-100 text-blue-700",
    Active:    "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-600",
};

const PAYMENT_STATUS_COLORS = {
    Pending:   "bg-amber-100 text-amber-700",
    Partial:   "bg-orange-100 text-orange-700",
    Paid:      "bg-emerald-100 text-emerald-700",
};

const emptyForm = {
    school_id: "", modules: "", total_amount: "", initial_payment: "",
    payment_mode: "Cash", payment_status: "Pending", expected_go_live: "",
    order_date: new Date().toISOString().split('T')[0], contract_signed: "No",
    contact_person: "", cost_per_student: "", remarks: "", status: "Draft"
};

export default function OrderBooking() {
    const navigate = useNavigate();
    const toast = useToast();

    const [orders, setOrders] = useState([]);
    const [schools, setSchools] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [selectedModules, setSelectedModules] = useState([]);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [ordersRes, schoolsRes, statsRes] = await Promise.all([
                apiGetOrders(),
                apiGetMarketingSchools(),
                apiGetOrderStats(),
            ]);
            setOrders(ordersRes.data || []);
            setSchools(schoolsRes.data || []);
            setStats(statsRes.data || {});
        } catch (err) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setSelectedModules([]);
        setShowModal(true);
    };

    const openEdit = (order) => {
        setEditId(order.id);
        setForm({
            school_id: order.school_id || "",
            modules: order.modules || "",
            total_amount: order.total_amount || "",
            initial_payment: order.initial_payment || "",
            payment_mode: order.payment_mode || "Cash",
            payment_status: order.payment_status || "Pending",
            expected_go_live: order.expected_go_live ? order.expected_go_live.split('T')[0] : "",
            order_date: order.order_date ? order.order_date.split('T')[0] : "",
            contract_signed: order.contract_signed || "No",
            contact_person: order.contact_person || "",
            cost_per_student: order.cost_per_student || "",
            remarks: order.remarks || "",
            status: order.status || "Draft",
        });
        setSelectedModules(order.modules ? order.modules.split(',').map(m => m.trim()) : []);
        setShowModal(true);
    };

    const toggleModule = (mod) => {
        const updated = selectedModules.includes(mod)
            ? selectedModules.filter(m => m !== mod)
            : [...selectedModules, mod];
        setSelectedModules(updated);
        setForm(f => ({ ...f, modules: updated.join(',') }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, modules: selectedModules.join(',') };
            if (editId) {
                await apiUpdateOrder(editId, payload);
                toast.success("Order updated");
            } else {
                await apiCreateOrder(payload);
                toast.success("Order created");
            }
            setShowModal(false);
            fetchAll();
        } catch (err) {
            toast.error(err.message || "Failed to save order");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this order?")) return;
        try {
            await apiDeleteOrder(id);
            toast.success("Order deleted");
            fetchAll();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const filtered = useMemo(() => {
        let list = [...orders];
        if (statusFilter !== "ALL") list = list.filter(o => o.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(o =>
                o.school_name?.toLowerCase().includes(q) ||
                o.modules?.toLowerCase().includes(q) ||
                o.contact_person?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [orders, statusFilter, search]);

    const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0';

    return (
        <div style={poppins} className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Marketing</p>
                    <h1 className="text-2xl font-bold text-slate-800">Order Booking</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{stats.total || 0} total orders</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchAll} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                        <RefreshCw size={16} className={loading ? "animate-spin text-indigo-500" : ""} />
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200">
                        <Plus size={16} /> New Order
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total Orders", value: stats.total || 0, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Total Revenue", value: fmt(stats.total_revenue), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Collected", value: fmt(stats.total_collected), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active", value: stats.active || 0, icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                            <s.icon size={18} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-800 leading-none">{s.value}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {['ALL', 'Draft', 'Confirmed', 'Active', 'Cancelled'].map(key => (
                        <button key={key} onClick={() => setStatusFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                statusFilter === key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}>
                            {key}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by school, module, contact..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700 placeholder-slate-400"
                    />
                    {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {!loading && filtered.length > 0 && (
                    <div className="grid px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                        style={{ gridTemplateColumns: "1.8fr 1.4fr 0.8fr 0.8fr 0.8fr 0.8fr 80px" }}>
                        <span>School</span>
                        <span>Modules</span>
                        <span>Total</span>
                        <span>Collected</span>
                        <span>Go Live</span>
                        <span>Status</span>
                        <span />
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-indigo-400" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Package size={32} className="mb-3 text-slate-200" strokeWidth={1.5} />
                        <p className="text-sm font-semibold text-slate-500">No orders found</p>
                        <button onClick={openCreate}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1.5">
                            <Plus size={13} /> Create First Order
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map(order => {
                            const mods = order.modules ? order.modules.split(',') : [];
                            return (
                                <div key={order.id}
                                    className="grid items-center px-5 py-4 hover:bg-slate-50 transition-colors group"
                                    style={{ gridTemplateColumns: "1.8fr 1.4fr 0.8fr 0.8fr 0.8fr 0.8fr 80px" }}>
                                    
                                    <div className="flex items-center gap-2.5 min-w-0 pr-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                            <Building2 size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{order.school_name}</p>
                                            <p className="text-[10px] text-slate-400">#{order.id?.toString().padStart(4,'0')} • {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN') : '—'}</p>
                                        </div>
                                    </div>

                                    <div className="pr-4">
                                        <div className="flex flex-wrap gap-1">
                                            {mods.slice(0,2).map((m,i) => (
                                                <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded truncate max-w-[100px]">{m.trim()}</span>
                                            ))}
                                            {mods.length > 2 && <span className="text-[9px] text-slate-400 font-medium">+{mods.length - 2}</span>}
                                        </div>
                                    </div>

                                    <div className="text-sm font-semibold text-slate-700">{fmt(order.total_amount)}</div>

                                    <div>
                                        <p className="text-sm font-semibold text-emerald-600">{fmt(order.initial_payment)}</p>
                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-slate-100 text-slate-500'}`}>
                                            {order.payment_status}
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        {order.expected_go_live ? new Date(order.expected_go_live).toLocaleDateString('en-IN') : '—'}
                                    </div>

                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500'}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 justify-end">
                                        <button onClick={() => openEdit(order)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                            <Edit3 size={13} />
                                        </button>
                                        <button onClick={() => handleDelete(order.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Order Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div style={poppins} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{editId ? "Edit Order" : "New Order"}</h2>
                                <p className="text-xs text-slate-400">Fill in the booking details below</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            
                            {/* School & Basic */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">School *</label>
                                    <select required value={form.school_id} onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700">
                                        <option value="">Select School</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.school_name} — {s.city || 'N/A'}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Order Date</label>
                                    <input type="date" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Expected Go Live *</label>
                                    <input type="date" value={form.expected_go_live} onChange={e => setForm(f => ({ ...f, expected_go_live: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contact Person</label>
                                    <input type="text" placeholder="Name at school" value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700 placeholder-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contract Signed</label>
                                    <select value={form.contract_signed} onChange={e => setForm(f => ({ ...f, contract_signed: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700">
                                        <option>No</option>
                                        <option>Yes</option>
                                        <option>In Progress</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modules */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                    Modules / Products
                                    {selectedModules.length > 0 && <span className="ml-2 text-indigo-600 font-bold">{selectedModules.length} selected</span>}
                                </label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {MODULE_OPTIONS.map(mod => {
                                            const active = selectedModules.includes(mod);
                                            return (
                                                <button key={mod} type="button" onClick={() => toggleModule(mod)}
                                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                                                        active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100'
                                                    }`}>
                                                    <div className={`w-3 h-3 rounded border shrink-0 flex items-center justify-center ${active ? 'bg-white border-white' : 'border-slate-300'}`}>
                                                        {active && <CheckCircle size={9} className="text-indigo-600" strokeWidth={3} />}
                                                    </div>
                                                    <span className="truncate">{mod}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Cost per Student (₹)</label>
                                    <input type="number" placeholder="0" value={form.cost_per_student} onChange={e => setForm(f => ({ ...f, cost_per_student: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Total Amount (₹)</label>
                                    <input type="number" placeholder="0" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Initial Payment (₹)</label>
                                    <input type="number" placeholder="0" value={form.initial_payment} onChange={e => setForm(f => ({ ...f, initial_payment: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Payment Mode</label>
                                    <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700">
                                        <option>Cash</option>
                                        <option>Cheque</option>
                                        <option>Bank Transfer</option>
                                        <option>UPI</option>
                                        <option>Online</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Payment Status</label>
                                    <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700">
                                        <option>Pending</option>
                                        <option>Partial</option>
                                        <option>Paid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Status & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Order Status</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700">
                                        <option>Draft</option>
                                        <option>Confirmed</option>
                                        <option>Active</option>
                                        <option>Cancelled</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Remarks / Notes</label>
                                    <textarea rows={2} placeholder="Any additional notes..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700 placeholder-slate-300 resize-none" />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {editId ? "Update Order" : "Create Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
