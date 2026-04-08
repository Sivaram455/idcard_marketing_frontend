import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    apiGetOrders, apiGetOrderStats, apiCreateOrder, apiUpdateOrder,
    apiDeleteOrder, apiGetMarketingSchools,
    apiCreateRzpOrder, apiVerifyRzpPayment,
    apiRecordCashPayment, apiGetOrderPayments, apiGetPaymentStats
} from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import {
    Plus, X, Search, RefreshCw, Building2, Package,
    DollarSign, Calendar, CheckCircle, Clock, Loader2,
    Save, CreditCard, Banknote, History, Printer,
    TrendingUp, TrendingDown, Edit3, Trash2, ChevronDown,
    AlertCircle, IndianRupee, BarChart3, Download
} from "lucide-react";

const poppins = { fontFamily: "'Poppins', sans-serif" };

const MODULE_OPTIONS = [
    "Admission Management", "Student Information System", "Attendance (Student)",
    "Attendance (Staff)", "Fee Management", "Online Payments", "Exams & Results",
    "Report Cards", "Timetable", "Homework / Assignments", "Parent Portal",
    "Student Portal", "Teacher Portal", "Transport Management", "Hostel Management",
    "Library Management", "HR & Payroll", "Inventory", "SMS / WhatsApp Alerts",
    "Mobile App Required", "ID Card", "Website"
];

const STATUS_COLORS = {
    Draft:     "bg-slate-100 text-slate-600",
    Confirmed: "bg-blue-100 text-blue-700",
    Active:    "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-600",
};

const PAY_STATUS_COLORS = {
    Pending: "bg-red-50 text-red-600",
    Partial: "bg-amber-50 text-amber-700",
    Paid:    "bg-emerald-50 text-emerald-700",
};

const emptyForm = {
    school_id: "", modules: "", total_amount: "", initial_payment: "0",
    payment_mode: "Cash", payment_status: "Pending", expected_go_live: "",
    order_date: new Date().toISOString().split('T')[0], contract_signed: "No",
    contact_person: "", cost_per_student: "", remarks: "", status: "Draft"
};

const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

export default function OrderBooking() {
    const navigate = useNavigate();
    const toast = useToast();
    const invoiceRef = useRef();

    // Core data
    const [orders, setOrders]     = useState([]);
    const [schools, setSchools]   = useState([]);
    const [stats, setStats]       = useState({});
    const [payStats, setPayStats] = useState({});
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);

    // Filters
    const [search, setSearch]           = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [payFilter, setPayFilter]     = useState("ALL");

    // Order modal
    const [showModal, setShowModal]         = useState(false);
    const [editId, setEditId]               = useState(null);
    const [form, setForm]                   = useState(emptyForm);
    const [selectedModules, setSelectedModules] = useState([]);

    // Payment modal
    const [showPayModal, setShowPayModal] = useState(false);
    const [payOrder, setPayOrder]         = useState(null);
    const [payAmount, setPayAmount]       = useState("");
    const [payMode, setPayMode]           = useState("cash"); // "cash" | "online"

    // History modal
    const [showHistModal, setShowHistModal] = useState(false);
    const [histOrder, setHistOrder]         = useState(null);
    const [histTxns, setHistTxns]           = useState([]);
    const [histLoading, setHistLoading]     = useState(false);

    // Invoice modal
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        fetchAll();
        const params = new URLSearchParams(window.location.search);
        const preSchoolId = params.get('school_id');
        if (preSchoolId) {
            setForm(f => ({ ...f, school_id: preSchoolId }));
            setShowModal(true);
        }
        // Load Razorpay SDK
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => { try { document.body.removeChild(script); } catch(e){} };
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [ordersRes, schoolsRes, statsRes, payStatsRes] = await Promise.all([
                apiGetOrders(),
                apiGetMarketingSchools(),
                apiGetOrderStats(),
                apiGetPaymentStats(),
            ]);
            setOrders(ordersRes.data || []);
            setSchools(schoolsRes.data || []);
            setStats(statsRes.data || {});
            setPayStats(payStatsRes.data || {});
        } catch (err) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // ─── Order CRUD ──────────────────────────────────────────────
    const openCreate = () => {
        setEditId(null); setForm(emptyForm); setSelectedModules([]); setShowModal(true);
    };
    const openEdit = (order) => {
        setEditId(order.id);
        setForm({
            school_id: order.school_id || "", modules: order.modules || "",
            total_amount: order.total_amount || "", initial_payment: order.initial_payment || "0",
            payment_mode: order.payment_mode || "Cash", payment_status: order.payment_status || "Pending",
            expected_go_live: order.expected_go_live ? order.expected_go_live.split('T')[0] : "",
            order_date: order.order_date ? order.order_date.split('T')[0] : "",
            contract_signed: order.contract_signed || "No", contact_person: order.contact_person || "",
            cost_per_student: order.cost_per_student || "", remarks: order.remarks || "",
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
        e.preventDefault(); setSaving(true);
        try {
            const payload = { ...form, modules: selectedModules.join(',') };
            if (editId) { await apiUpdateOrder(editId, payload); toast.success("Order updated"); }
            else { await apiCreateOrder(payload); toast.success("Order created"); }
            setShowModal(false); fetchAll();
        } catch (err) { toast.error(err.message || "Failed to save order"); }
        finally { setSaving(false); }
    };
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this order?")) return;
        try { await apiDeleteOrder(id); toast.success("Deleted"); fetchAll(); }
        catch { toast.error("Failed to delete"); }
    };

    // ─── Payment Flow ─────────────────────────────────────────────
    const openPayModal = (order) => {
        const remaining = Number(order.total_amount) - Number(order.initial_payment);
        if (remaining <= 0) { toast.info("Order is already fully paid"); return; }
        setPayOrder(order);
        setPayAmount(remaining.toFixed(0));
        setPayMode("cash");
        setShowPayModal(true);
    };

    const handleCashPayment = async () => {
        if (!payAmount || Number(payAmount) <= 0) { toast.error("Enter valid amount"); return; }
        setSaving(true);
        try {
            await apiRecordCashPayment(payOrder.id, Number(payAmount));
            toast.success("Cash payment recorded ✓");
            setShowPayModal(false);
            fetchAll();
        } catch (err) { toast.error(err.message || "Failed to record payment"); }
        finally { setSaving(false); }
    };

    const handleOnlinePayment = async () => {
        if (!payAmount || Number(payAmount) <= 0) { toast.error("Enter valid amount"); return; }
        setSaving(true);
        try {
            const res = await apiCreateRzpOrder(payOrder.id, Number(payAmount));
            const { id: rzp_order_id, amount, currency, key_id } = res.data;
            const options = {
                key: key_id, amount, currency,
                name: "ID Market",
                description: `Payment for ${payOrder.school_name}`,
                order_id: rzp_order_id,
                handler: async (response) => {
                    try {
                        await apiVerifyRzpPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.success("Online payment successful! ✓");
                        setShowPayModal(false);
                        fetchAll();
                    } catch { toast.error("Payment verification failed"); }
                },
                prefill: { name: payOrder.contact_person || "" },
                theme: { color: "#4f46e5" },
                modal: { ondismiss: () => setSaving(false) }
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (r) => {
                toast.error("Payment failed: " + r.error.description);
                setSaving(false);
            });
            rzp.open();
        } catch (err) { toast.error(err.message || "Failed to initiate payment"); setSaving(false); }
    };

    // ─── Transaction History ──────────────────────────────────────
    const openHistory = async (order) => {
        setHistOrder(order); setShowHistModal(true); setHistLoading(true);
        try {
            const res = await apiGetOrderPayments(order.id);
            setHistTxns(res.data || []);
        } catch { toast.error("Failed to load history"); }
        finally { setHistLoading(false); }
    };

    // ─── Invoice ──────────────────────────────────────────────────
    const openInvoice = (order, txn = null) => {
        setInvoiceData({ order, txn }); setShowInvoice(true);
    };
    const handlePrint = () => {
        const content = invoiceRef.current.innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Invoice</title>
            <style>
                body { font-family: 'Arial', sans-serif; margin: 0; padding: 24px; color: #1e293b; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #4f46e5; }
                .logo { font-size: 22px; font-weight: 900; color: #4f46e5; } 
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
                td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                .total-row td { font-weight: 700; font-size: 14px; background: #f8faff; }
                .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; }
            </style></head><body>${content}</body></html>
        `);
        win.document.close(); win.focus(); win.print(); win.close();
    };

    const handleDownloadPDF = async () => {
        if (!invoiceData) return;
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const { order, txn } = invoiceData;
        const pageW = 210;
        const margin = 18;
        const contentW = pageW - margin * 2;
        let y = 20;

        // ── Header band ──────────────────────────────────────────
        doc.setFillColor(79, 70, 229); // indigo-600
        doc.rect(0, 0, pageW, 36, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('ID Market', margin, 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(199, 210, 254); // indigo-200
        doc.text('Smart School ERP Solutions', margin, 23);

        // Invoice label on right
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(199, 210, 254);
        doc.text('INVOICE', pageW - margin, 13, { align: 'right' });
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text(`#${String(order.id).padStart(6, '0')}`, pageW - margin, 22, { align: 'right' });
        doc.setFontSize(8);
        doc.setTextColor(199, 210, 254);
        const invoiceDate = txn?.created_at || order.order_date;
        doc.text(invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—', pageW - margin, 30, { align: 'right' });

        y = 50;

        // ── Billed To ────────────────────────────────────────────
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('BILLED TO', margin, y);
        y += 5;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(order.school_name || '—', margin, y);
        y += 5;
        if (order.contact_person) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(`Attn: ${order.contact_person}`, margin, y);
            y += 4;
        }
        y += 6;

        // ── Divider ──────────────────────────────────────────────
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 7;

        // ── Modules table ────────────────────────────────────────
        const modules = (order.modules || '').split(',').filter(Boolean).map(m => m.trim());

        // Table header
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y - 4, contentW, 9, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text('MODULE / ITEM', margin + 4, y + 1);
        doc.text('AMOUNT', pageW - margin - 4, y + 1, { align: 'right' });
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        modules.forEach((mod, i) => {
            if (i % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(margin, y - 3.5, contentW, 7.5, 'F');
            }
            doc.setTextColor(51, 65, 85);
            doc.text(mod, margin + 4, y + 1);
            doc.setTextColor(148, 163, 184);
            doc.text('—', pageW - margin - 4, y + 1, { align: 'right' });
            y += 8;
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
        });

        y += 3;
        // Total contract row
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(margin, y - 3, contentW, 10, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text('Total Contract Value', margin + 4, y + 3.5);
        doc.setTextColor(79, 70, 229);
        doc.text(`Rs.${Number(order.total_amount || 0).toLocaleString('en-IN')}`, pageW - margin - 4, y + 3.5, { align: 'right' });
        y += 16;

        // ── Payment Summary ───────────────────────────────────────
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, contentW, txn ? 36 : 28, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentW, txn ? 36 : 28, 2, 2, 'S');

        const summaryX = margin + 5;
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Total Collected', summaryX, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105); // emerald-600
        doc.text(`Rs.${Number(order.initial_payment || 0).toLocaleString('en-IN')}`, pageW - margin - 5, y, { align: 'right' });
        y += 9;

        const balanceDue = Number(order.total_amount || 0) - Number(order.initial_payment || 0);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Balance Due', summaryX, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(balanceDue > 0 ? 239 : 5, balanceDue > 0 ? 68 : 150, balanceDue > 0 ? 68 : 105);
        doc.text(`Rs.${balanceDue.toLocaleString('en-IN')}`, pageW - margin - 5, y, { align: 'right' });
        y += 9;

        if (txn) {
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.2);
            doc.line(summaryX, y - 2, pageW - margin - 5, y - 2);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`This Payment (${txn.method || 'payment'})`, summaryX, y + 5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            doc.text(`Rs.${Number(txn.amount || 0).toLocaleString('en-IN')}`, pageW - margin - 5, y + 5, { align: 'right' });
        }

        // ── Footer ───────────────────────────────────────────────
        const footerY = 282;
        doc.setFillColor(241, 245, 249);
        doc.rect(0, footerY - 4, pageW, 14, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Thank you for your business!', pageW / 2, footerY + 2, { align: 'center' });
        doc.text('ID Market · supportsmartschoolserp.com', pageW / 2, footerY + 6.5, { align: 'center' });

        // Save
        const fileName = `Invoice_${String(order.id).padStart(6,'0')}_${(order.school_name || 'order').replace(/\s+/g,'-')}.pdf`;
        doc.save(fileName);
    };

    // ─── Filters ──────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = [...orders];
        if (statusFilter !== "ALL") list = list.filter(o => o.status === statusFilter);
        if (payFilter !== "ALL") list = list.filter(o => o.payment_status === payFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(o =>
                o.school_name?.toLowerCase().includes(q) ||
                o.modules?.toLowerCase().includes(q) ||
                o.contact_person?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [orders, statusFilter, payFilter, search]);

    // Aggregates from filtered list
    const totalRevenue   = filtered.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const totalCollected = filtered.reduce((s, o) => s + Number(o.initial_payment || 0), 0);
    const totalPending   = totalRevenue - totalCollected;

    return (
        <div style={poppins} className="p-6 max-w-7xl mx-auto space-y-5">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Marketing</p>
                    <h1 className="text-2xl font-bold text-slate-800">Order Booking</h1>
                    <p className="text-xs text-slate-400 mt-0.5">{orders.length} orders · Last updated just now</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchAll} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                        <RefreshCw size={16} className={loading ? "animate-spin text-indigo-500" : ""} />
                    </button>
                    <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200">
                        <Plus size={16} /> New Order
                    </button>
                </div>
            </div>

            {/* ── Analytics Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total Revenue", value: fmt(totalRevenue), icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50", sub: `${filtered.length} orders` },
                    { label: "Collected", value: fmt(totalCollected), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", sub: `Cash: ${fmt(payStats.cash_collected)} · Online: ${fmt(payStats.online_collected)}` },
                    { label: "Pending Balance", value: fmt(totalPending), icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", sub: `${filtered.filter(o => o.payment_status !== 'Paid').length} unpaid orders` },
                    { label: "Fully Paid", value: filtered.filter(o => o.payment_status === 'Paid').length, icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50", sub: `${filtered.filter(o => o.payment_status === 'Partial').length} partial payments` },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                                <s.icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-bold text-slate-800 leading-none">{s.value}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 truncate">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {['ALL','Draft','Confirmed','Active','Cancelled'].map(k => (
                        <button key={k} onClick={() => setStatusFilter(k)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === k ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                            {k}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {['ALL','Pending','Partial','Paid'].map(k => (
                        <button key={k} onClick={() => setPayFilter(k)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${payFilter === k ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                            {k}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search school, module, contact..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
                    {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>}
                </div>
            </div>

            {/* ── Orders Table ── */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {!loading && filtered.length > 0 && (
                    <div className="grid px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                        style={{ gridTemplateColumns: "1.8fr 1.2fr 0.85fr 1.1fr 0.8fr 0.75fr 100px" }}>
                        <span>School</span><span>Modules</span><span>Total</span>
                        <span>Collected / Pending</span><span>Go Live</span><span>Status</span><span />
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Package size={32} className="mb-3 text-slate-200" strokeWidth={1.5} />
                        <p className="text-sm font-semibold text-slate-500">No orders found</p>
                        <button onClick={openCreate} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1.5">
                            <Plus size={13} /> Create First Order
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map(order => {
                            const mods = order.modules ? order.modules.split(',') : [];
                            const collected = Number(order.initial_payment || 0);
                            const total = Number(order.total_amount || 0);
                            const pending = total - collected;
                            const pct = total > 0 ? Math.min(100, (collected / total) * 100) : 0;

                            return (
                                <div key={order.id}
                                    className="grid items-center px-5 py-4 hover:bg-slate-50/70 transition-colors group"
                                    style={{ gridTemplateColumns: "1.8fr 1.2fr 0.85fr 1.1fr 0.8fr 0.75fr 100px" }}>

                                    {/* School */}
                                    <div className="flex items-center gap-2.5 min-w-0 pr-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                            <Building2 size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{order.school_name}</p>
                                            <p className="text-[10px] text-slate-400">#{String(order.id).padStart(4,'0')} · {fmtDate(order.order_date)}</p>
                                        </div>
                                    </div>

                                    {/* Modules */}
                                    <div className="pr-4">
                                        <div className="flex flex-wrap gap-1">
                                            {mods.slice(0,2).map((m,i) => (
                                                <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded truncate max-w-[90px]">{m.trim()}</span>
                                            ))}
                                            {mods.length > 2 && <span className="text-[9px] text-slate-400 font-medium">+{mods.length-2}</span>}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="text-sm font-bold text-slate-700">{fmt(total)}</div>

                                    {/* Collected / Pending */}
                                    <div className="pr-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-emerald-600">{fmt(collected)}</span>
                                            {pending > 0 && <span className="text-[10px] font-bold text-red-500">-{fmt(pending)}</span>}
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${PAY_STATUS_COLORS[order.payment_status] || 'bg-slate-100 text-slate-500'}`}>
                                            {order.payment_status}
                                        </span>
                                    </div>

                                    {/* Go Live */}
                                    <div className="text-xs text-slate-500">{fmtDate(order.expected_go_live)}</div>

                                    {/* Order Status */}
                                    <div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500'}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 justify-end">
                                        {pending > 0 && (
                                            <button onClick={() => openPayModal(order)}
                                                title="Pay Now"
                                                className="p-1.5 rounded-lg text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                <IndianRupee size={13} />
                                            </button>
                                        )}
                                        <button onClick={() => openHistory(order)} title="Transaction History"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                                            <History size={13} />
                                        </button>
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

            {/* ── Order Create/Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div style={poppins} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{editId ? "Edit Order" : "New Order"}</h2>
                                <p className="text-xs text-slate-400">Fill in the booking details below</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">School *</label>
                                    <select required value={form.school_id} onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all">
                                        <option value="">Select School</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.school_name} — {s.city || 'N/A'}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Order Date</label>
                                    <input type="date" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Expected Go Live</label>
                                    <input type="date" value={form.expected_go_live} onChange={e => setForm(f => ({ ...f, expected_go_live: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contact Person</label>
                                    <input type="text" placeholder="Name at school" value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contract Signed</label>
                                    <select value={form.contract_signed} onChange={e => setForm(f => ({ ...f, contract_signed: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all">
                                        <option>No</option><option>Yes</option><option>In Progress</option>
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
                                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100'}`}>
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Cost/Student (₹)</label>
                                    <input type="number" placeholder="0" value={form.cost_per_student} onChange={e => setForm(f => ({ ...f, cost_per_student: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Total Amount (₹) *</label>
                                    <input type="number" required placeholder="0" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Initial Payment (₹)</label>
                                    <input type="number" placeholder="0" value={form.initial_payment} onChange={e => setForm(f => ({ ...f, initial_payment: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Order Status</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all">
                                        <option>Draft</option><option>Confirmed</option><option>Active</option><option>Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Remarks / Notes</label>
                                <textarea rows={2} placeholder="Any additional notes..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none" />
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
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

            {/* ── Payment Modal ── */}
            {showPayModal && payOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPayModal(false)}>
                    <div style={poppins} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>

                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-800">Record Payment</h2>
                                <p className="text-xs text-slate-400 truncate max-w-[200px]">{payOrder.school_name}</p>
                            </div>
                            <button onClick={() => setShowPayModal(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 text-center">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-medium">Total</p>
                                    <p className="text-sm font-bold text-slate-700">{fmt(payOrder.total_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-medium">Paid</p>
                                    <p className="text-sm font-bold text-emerald-600">{fmt(payOrder.initial_payment)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-medium">Pending</p>
                                    <p className="text-sm font-bold text-red-500">{fmt(Number(payOrder.total_amount) - Number(payOrder.initial_payment))}</p>
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Amount to Pay (₹)</label>
                                <div className="relative">
                                    <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="number" autoFocus value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0"
                                        className="w-full pl-9 pr-4 py-3 text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-800" />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">* Enter partial advance or full remaining balance</p>
                            </div>

                            {/* Payment Mode Tabs */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2">Payment Mode</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setPayMode("cash")}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${payMode === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <Banknote size={18} /> Cash
                                    </button>
                                    <button type="button" onClick={() => setPayMode("online")}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${payMode === 'online' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <CreditCard size={18} /> Online
                                    </button>
                                </div>
                            </div>

                            {/* Pay Button */}
                            {payMode === 'cash' ? (
                                <button onClick={handleCashPayment} disabled={saving}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Banknote size={18} />}
                                    Record Cash · {fmt(payAmount || 0)}
                                </button>
                            ) : (
                                <button onClick={handleOnlinePayment} disabled={saving}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                                    Pay Online via Razorpay · {fmt(payAmount || 0)}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Transaction History Modal ── */}
            {showHistModal && histOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHistModal(false)}>
                    <div style={poppins} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

                        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-800">Transaction History</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{histOrder.school_name}</p>
                                <div className="flex gap-3 mt-2 text-xs">
                                    <span className="font-medium text-slate-500">Total: <strong className="text-slate-700">{fmt(histOrder.total_amount)}</strong></span>
                                    <span className="font-medium text-emerald-600">Paid: <strong>{fmt(histOrder.initial_payment)}</strong></span>
                                    <span className="font-medium text-red-500">Due: <strong>{fmt(Number(histOrder.total_amount) - Number(histOrder.initial_payment))}</strong></span>
                                </div>
                            </div>
                            <button onClick={() => setShowHistModal(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 mt-0.5"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {histLoading ? (
                                <div className="flex items-center justify-center py-16"><Loader2 size={22} className="animate-spin text-indigo-400" /></div>
                            ) : histTxns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <History size={28} className="mb-3 text-slate-200" />
                                    <p className="text-sm font-semibold text-slate-500">No transactions yet</p>
                                    <p className="text-xs mt-1">Payments will appear here once collected</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {histTxns.map((txn, i) => (
                                        <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${txn.method === 'cash' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                    {txn.method === 'cash' ? <Banknote size={16} /> : <CreditCard size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700 capitalize">{txn.method === 'cash' ? 'Cash Payment' : `Online · ${txn.method}`}</p>
                                                    <p className="text-[10px] text-slate-400">{fmtDate(txn.created_at)} · {txn.rzp_order_id?.startsWith('CASH') ? 'Manual' : txn.rzp_payment_id || 'Pending'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600">{fmt(txn.amount)}</p>
                                                <button onClick={() => { setShowHistModal(false); openInvoice(histOrder, txn); }}
                                                    className="text-[10px] text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-0.5 ml-auto">
                                                    <Printer size={10} /> Invoice
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                            <button onClick={() => openPayModal(histOrder)}
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                                <IndianRupee size={14} /> Add Payment
                            </button>
                            <button onClick={() => openInvoice(histOrder)}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all">
                                <Printer size={14} /> Full Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Invoice Modal ── */}
            {showInvoice && invoiceData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInvoice(false)}>
                    <div style={poppins} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800">Invoice</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={handleDownloadPDF}
                                    className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-emerald-700 transition-all">
                                    <Download size={13} /> Download PDF
                                </button>
                                <button onClick={handlePrint}
                                    className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all">
                                    <Printer size={13} /> Print
                                </button>
                                <button onClick={() => setShowInvoice(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div ref={invoiceRef}>
                                {/* Invoice Header */}
                                <div className="header flex justify-between items-start pb-5 border-b-2 border-indigo-500 mb-6">
                                    <div>
                                        <p className="logo text-2xl font-black text-indigo-600">ID Market</p>
                                        <p className="text-xs text-slate-500 mt-1">Smart School ERP Solutions</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Invoice</p>
                                        <p className="text-lg font-bold text-slate-800">#{String(invoiceData.order.id).padStart(6,'0')}</p>
                                        <p className="text-xs text-slate-400">{fmtDate(invoiceData.txn?.created_at || invoiceData.order.order_date)}</p>
                                    </div>
                                </div>

                                {/* Billed To */}
                                <div className="mb-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</p>
                                    <p className="text-base font-bold text-slate-800">{invoiceData.order.school_name}</p>
                                    {invoiceData.order.contact_person && <p className="text-sm text-slate-500">Attn: {invoiceData.order.contact_person}</p>}
                                </div>

                                {/* Line Items */}
                                <table className="w-full text-sm mb-4">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded-l-lg">Item</th>
                                            <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded-r-lg">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(invoiceData.order.modules || '').split(',').filter(Boolean).map((m, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 text-slate-700">{m.trim()}</td>
                                                <td className="px-3 py-2 text-right text-slate-500">—</td>
                                            </tr>
                                        ))}
                                        <tr className="border-t border-slate-100">
                                            <td className="px-3 py-3 font-bold text-slate-800">Total Contract Value</td>
                                            <td className="px-3 py-3 text-right font-bold text-slate-800">{fmt(invoiceData.order.total_amount)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Payment Summary */}
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Collected</span>
                                        <span className="font-bold text-emerald-600">{fmt(invoiceData.order.initial_payment)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Balance Due</span>
                                        <span className="font-bold text-red-500">{fmt(Number(invoiceData.order.total_amount) - Number(invoiceData.order.initial_payment))}</span>
                                    </div>
                                    {invoiceData.txn && (
                                        <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                                            <span className="text-slate-500">This Payment ({invoiceData.txn.method})</span>
                                            <span className="font-bold text-indigo-600">{fmt(invoiceData.txn.amount)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 text-center text-xs text-slate-400">
                                    <p>Thank you for your business!</p>
                                    <p className="mt-1">ID Market · supportsmartschoolserp.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
