import { useEffect, useState } from "react";
import { apiGetTenants, apiCreateTenant, apiUpdateTenant } from "../../utils/api";
import { Plus, Search, Pencil, Loader2, X, Check } from "lucide-react";

const EMPTY = {
    tenant_code: "", tenant_name: "", address: "", city: "",
    state: "", pincode: "", contact_email: "", contact_phone: "", status: "ACTIVE",
};

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

    const filtered = tenants.filter((t) =>
        `${t.tenant_name} ${t.tenant_code} ${t.city || ""}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{tenants.length} school{tenants.length !== 1 ? "s" : ""} registered</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={15} /> Add Tenant
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4 w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text" placeholder="Search..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
                ) : filtered.length === 0 ? (
                    <p className="p-8 text-center text-gray-400 text-sm">No tenants found.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {["Code", "School Name", "Location", "Contact", "Status", ""].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-gray-700 text-xs">{t.tenant_code}</td>
                                    <td className="px-5 py-3.5 font-medium text-gray-900">{t.tenant_name}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{[t.city, t.state].filter(Boolean).join(", ") || "—"}</td>
                                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                                        {t.contact_email && <div>{t.contact_email}</div>}
                                        {t.contact_phone && <div>{t.contact_phone}</div>}
                                        {!t.contact_email && !t.contact_phone && "—"}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${t.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-gray-900">{editing ? "Edit Tenant" : "Add Tenant"}</h2>
                            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                        </div>

                        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}

                        <form onSubmit={handleSave} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <F label="Code *" value={form.tenant_code} ch={(v) => set("tenant_code", v)} ph="SCH001" disabled={!!editing} />
                                <F label="School Name *" value={form.tenant_name} ch={(v) => set("tenant_name", v)} ph="School name" />
                            </div>
                            <F label="Address" value={form.address} ch={(v) => set("address", v)} ph="Street address" />
                            <div className="grid grid-cols-3 gap-2">
                                <F label="City" value={form.city} ch={(v) => set("city", v)} ph="City" />
                                <F label="State" value={form.state} ch={(v) => set("state", v)} ph="State" />
                                <F label="Pincode" value={form.pincode} ch={(v) => set("pincode", v)} ph="000000" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <F label="Email" value={form.contact_email} ch={(v) => set("contact_email", v)} ph="email@school.com" type="email" />
                                <F label="Phone" value={form.contact_phone} ch={(v) => set("contact_phone", v)} ph="+91 XXXXXX" />
                            </div>
                            {editing && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                    <select value={form.status} onChange={(e) => set("status", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400">
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                    {editing ? "Save" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function F({ label, value, ch, ph, type = "text", disabled }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type={type} placeholder={ph} value={value || ""} onChange={(e) => ch(e.target.value)} disabled={disabled}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 disabled:bg-gray-50 disabled:text-gray-400" />
        </div>
    );
}
