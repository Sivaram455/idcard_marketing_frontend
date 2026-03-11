import { useEffect, useState } from "react";
import { apiGetUsers, apiGetTenants, apiCreateUser, apiUpdateUser, apiResetUserPassword } from "../../utils/api";
import { Plus, Search, Pencil, Key, Loader2, X, Check } from "lucide-react";

const ROLES = ["GMMC_ADMIN", "SCHOOL_ADMIN", "PRINTER", "AGENT"];
const ROLE_LABELS = { GMMC_ADMIN: "GMMC Admin", SCHOOL_ADMIN: "School Admin", PRINTER: "Printer", AGENT: "Agent" };
const ROLE_COLORS = { GMMC_ADMIN: "bg-indigo-50 text-indigo-700", SCHOOL_ADMIN: "bg-blue-50 text-blue-700", PRINTER: "bg-purple-50 text-purple-700", AGENT: "bg-green-50 text-green-700" };

const EMPTY = { full_name: "", email: "", phone: "", password: "", role: "SCHOOL_ADMIN", tenant_id: "", status: "ACTIVE" };

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [modal, setModal] = useState(false);
    const [pwdModal, setPwdModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [pwdUser, setPwdUser] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [newPwd, setNewPwd] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [pwdErr, setPwdErr] = useState("");

    const load = () => {
        setLoading(true);
        Promise.all([apiGetUsers(), apiGetTenants()])
            .then(([u, t]) => { setUsers(u.data || []); setTenants(t.data || []); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
    const openEdit = (u) => { setEditing(u); setForm({ ...u, password: "" }); setError(""); setModal(true); };
    const openPwd = (u) => { setPwdUser(u); setNewPwd(""); setPwdErr(""); setPwdModal(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.full_name || !form.email) { setError("Name and email are required."); return; }
        if (!editing && !form.password) { setError("Password is required."); return; }
        setSaving(true); setError("");
        try {
            editing
                ? await apiUpdateUser(editing.id, { full_name: form.full_name, phone: form.phone, role: form.role, status: form.status, tenant_id: form.tenant_id || null })
                : await apiCreateUser(form);
            setModal(false);
            load();
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    const handlePwd = async (e) => {
        e.preventDefault();
        if (newPwd.length < 6) { setPwdErr("Minimum 6 characters."); return; }
        setSaving(true); setPwdErr("");
        try {
            await apiResetUserPassword(pwdUser.id, newPwd);
            setPwdModal(false);
        } catch (err) { setPwdErr(err.message); }
        finally { setSaving(false); }
    };

    const filtered = users.filter((u) =>
        (roleFilter === "ALL" || u.role === roleFilter) &&
        `${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Users & Roles</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""} in the system</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <Plus size={15} /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 w-48" />
                </div>
                <div className="flex items-center gap-1">
                    {["ALL", ...ROLES].map((r) => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${roleFilter === r ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {r === "ALL" ? "All" : ROLE_LABELS[r]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
                ) : filtered.length === 0 ? (
                    <p className="p-8 text-center text-gray-400 text-sm">No users found.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {["Name", "Email", "Role", "Tenant", "Status", "Actions"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-gray-900">{u.full_name}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>
                                            {ROLE_LABELS[u.role] || u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500">{u.tenant_name || "—"}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${u.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(u)} title="Edit" className="text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={14} /></button>
                                            <button onClick={() => openPwd(u)} title="Reset Password" className="text-gray-400 hover:text-amber-600 transition-colors"><Key size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* User create/edit modal */}
            {modal && (
                <Modal title={editing ? "Edit User" : "Create User"} onClose={() => setModal(false)}>
                    {error && <ErrBox msg={error} />}
                    <form onSubmit={handleSave} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <F label="Full Name *" value={form.full_name} ch={(v) => set("full_name", v)} ph="John Doe" />
                            <F label="Email *" value={form.email} ch={(v) => set("email", v)} ph="email@example.com" type="email" disabled={!!editing} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <F label="Phone" value={form.phone} ch={(v) => set("phone", v)} ph="+91 XXXXXXXXXX" />
                            {!editing && <F label="Password *" value={form.password} ch={(v) => set("password", v)} ph="Min. 6 characters" type="password" />}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
                                <select value={form.role} onChange={(e) => set("role", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400">
                                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Assign Tenant</label>
                                <select value={form.tenant_id || ""} onChange={(e) => set("tenant_id", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400">
                                    <option value="">None</option>
                                    {tenants.map((t) => <option key={t.id} value={t.id}>{t.tenant_name}</option>)}
                                </select>
                            </div>
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
                        <Btns onCancel={() => setModal(false)} saving={saving} label={editing ? "Save" : "Create User"} />
                    </form>
                </Modal>
            )}

            {/* Reset password modal */}
            {pwdModal && (
                <Modal title={`Reset Password — ${pwdUser?.full_name}`} onClose={() => setPwdModal(false)}>
                    {pwdErr && <ErrBox msg={pwdErr} />}
                    <form onSubmit={handlePwd} className="space-y-3">
                        <F label="New Password" value={newPwd} ch={setNewPwd} ph="Min. 6 characters" type="password" />
                        <Btns onCancel={() => setPwdModal(false)} saving={saving} label="Reset Password" danger />
                    </form>
                </Modal>
            )}
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ErrBox({ msg }) {
    return <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{msg}</p>;
}

function Btns({ onCancel, saving, label, danger }) {
    return (
        <div className="flex gap-2 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
                className={`flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 ${danger ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {label}
            </button>
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
