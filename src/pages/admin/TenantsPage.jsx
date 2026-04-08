import { useEffect, useState, useMemo } from "react";
import { apiGetTenants, apiCreateTenant, apiUpdateTenant } from "../../utils/api";
import { Plus, Search, Pencil, Loader2, X, Check, Building2, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Filter, MoreVertical, Globe } from "lucide-react";

const EMPTY = {
    tenant_code: "", tenant_name: "", address: "", city: "",
    state: "", pincode: "", contact_email: "", contact_phone: "", status: "ACTIVE",
};

const ITEMS_PER_PAGE = 8;

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    const load = () => {
        setLoading(true);
        apiGetTenants()
            .then((r) => setTenants(r.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
    const openEdit = (t) => { setEditing(t); setForm({ ...t }); setError(""); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.tenant_code || !form.tenant_name) { setError("Code and Name are required."); return; }
        setSaving(true); setError("");
        try {
            editing ? await apiUpdateTenant(editing.id, form) : await apiCreateTenant(form);
            setModal(false);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const filtered = useMemo(() => {
        return tenants.filter((t) =>
            `${t.tenant_name} ${t.tenant_code} ${t.city || ""} ${t.contact_email || ""}`.toLowerCase().includes(search.toLowerCase())
        );
    }, [tenants, search]);

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const stats = useMemo(() => ({
        total: tenants.length,
        active: tenants.filter(t => t.status === 'ACTIVE').length,
        inactive: tenants.filter(t => t.status !== 'ACTIVE').length
    }), [tenants]);

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50/30 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 size={20} className="text-indigo-600" />
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Tenants</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Manage school registrations and subscription status.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all transform active:scale-95"
                >
                    <Plus size={18} /> Register New School
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Schools", value: stats.total, icon: Globe, color: "indigo" },
                    { label: "Active Nodes", value: stats.active, icon: Check, color: "emerald" },
                    { label: "Pending/Disabled", value: stats.inactive, icon: X, color: "slate" },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tighter mt-1">{loading ? "..." : s.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600`}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                {/* Search & Filter Bar */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative w-full max-w-sm">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" placeholder="Search by name, code, or location..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                            <Filter size={18} />
                        </button>
                        <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                        <p className="text-xs font-medium text-slate-400">Showing {pagedData.length} of {filtered.length}</p>
                    </div>
                </div>

                {/* Table Section */}
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={32} className="animate-spin text-indigo-500" />
                        <p className="text-sm font-medium text-slate-400">Fetching tenant data...</p>
                    </div>
                ) : pagedData.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-200" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">No schools found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    {["Tenant Code", "School Identity", "Location Details", "Contact Information", "Status", "Actions"].map((h) => (
                                        <th key={h} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pagedData.map((t) => (
                                    <tr key={t.id} className="group hover:bg-indigo-50/30 transition-all">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                                                {t.tenant_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{t.tenant_name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-medium">Secondary Education Unit</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 max-w-[200px]">
                                                <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                                <span className="text-xs text-slate-600 leading-tight">
                                                    {[t.city, t.state].filter(Boolean).join(", ") || "Location not set"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {t.contact_email && (
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                        <Mail size={12} className="text-slate-300" /> {t.contact_email}
                                                    </div>
                                                )}
                                                {t.contact_phone && (
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                        <Phone size={12} className="text-slate-300" /> {t.contact_phone}
                                                    </div>
                                                )}
                                                {!t.contact_email && !t.contact_phone && <span className="text-xs text-slate-300">N/A</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${t.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all shadow-sm">
                                                    <Pencil size={15} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                                                    <MoreVertical size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="text-slate-900 font-bold">{filtered.length}</span> results
                    </p>
                    <div className="flex items-center gap-1">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center px-3">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button 
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 relative">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{editing ? "Edit Tenant Profile" : "Register New School"}</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Administrative Action Required</p>
                            <button onClick={() => setModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8">
                            {error && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6 flex items-center gap-2"><X size={14} /> {error}</p>}

                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <F label="Identification Code" value={form.tenant_code} ch={(v) => set("tenant_code", v)} ph="e.g. SCH-001" disabled={!!editing} icon={ShieldCheck} />
                                    <F label="Institution Name" value={form.tenant_name} ch={(v) => set("tenant_name", v)} ph="Full School Name" />
                                </div>
                                
                                <F label="Physical Address" value={form.address} ch={(v) => set("address", v)} ph="Street / Building No." />
                                
                                <div className="grid grid-cols-3 gap-3">
                                    <F label="City" value={form.city} ch={(v) => set("city", v)} ph="City" />
                                    <F label="State" value={form.state} ch={(v) => set("state", v)} ph="State" />
                                    <F label="Zip/Pin" value={form.pincode} ch={(v) => set("pincode", v)} ph="000000" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                                    <F label="Administrative Email" value={form.contact_email} ch={(v) => set("contact_email", v)} ph="admin@school.com" type="email" />
                                    <F label="Direct Contact" value={form.contact_phone} ch={(v) => set("contact_phone", v.replace(/\D/g, '').slice(0, 10))} ph="10 Digit Mobile Number" />
                                </div>

                                {editing && (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subscription Status</label>
                                        <div className="flex gap-2">
                                            {["ACTIVE", "INACTIVE"].map(s => (
                                                <button 
                                                    key={s} type="button" 
                                                    onClick={() => set("status", s)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${form.status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setModal(false)} className="px-6 py-2.5 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors border border-transparent">Dismiss</button>
                                    <button 
                                        type="submit" 
                                        disabled={saving} 
                                        className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black py-3 rounded-xl shadow-lg shadow-slate-100 transition-all disabled:opacity-60 flex items-center justify-center gap-2 uppercase tracking-widest"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        {editing ? "Update Profile" : "Register System Node"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function F({ label, value, ch, ph, type = "text", disabled, icon: Icon }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</label>
            <div className="relative group">
                <input 
                    type={type} placeholder={ph} value={value || ""} onChange={(e) => ch(e.target.value)} disabled={disabled}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 disabled:bg-slate-50 disabled:text-slate-400 transition-all" 
                />
            </div>
        </div>
    );
}

function ShieldCheck(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
    );
}

