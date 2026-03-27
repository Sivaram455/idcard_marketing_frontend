import { useEffect, useState, useMemo } from "react";
import { apiGetUsers, apiGetTenants, apiCreateUser, apiUpdateUser, apiResetUserPassword } from "../../utils/api";
import { Plus, Search, Pencil, Key, Loader2, X, Check, Users, ShieldCheck, Mail, Phone, ChevronLeft, ChevronRight, Filter, MoreVertical, Building2, UserCircle } from "lucide-react";

const ROLES = ["GMMC_ADMIN", "SCHOOL_ADMIN", "PRINTER", "AGENT", "SUPPORT", "DEVELOPER"];
const ROLE_LABELS = {
    GMMC_ADMIN: "GMMC Admin",
    SCHOOL_ADMIN: "School Admin",
    PRINTER: "Printer",
    AGENT: "Agent",
    SUPPORT: "Support",
    DEVELOPER: "Developer"
};
const ROLE_COLORS = {
    GMMC_ADMIN: "bg-indigo-50 text-indigo-700 border-indigo-100",
    SCHOOL_ADMIN: "bg-blue-50 text-blue-700 border-blue-100",
    PRINTER: "bg-violet-50 text-violet-700 border-violet-100",
    AGENT: "bg-emerald-50 text-emerald-700 border-emerald-100",
    SUPPORT: "bg-amber-50 text-amber-700 border-amber-100",
    DEVELOPER: "bg-slate-900 text-white border-slate-900"
};

const EMPTY = { full_name: "", email: "", phone: "", password: "", role: "SCHOOL_ADMIN", tenant_id: "", status: "ACTIVE" };
const ITEMS_PER_PAGE = 10;

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

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

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

    const filtered = useMemo(() => {
        return users.filter((u) =>
            (roleFilter === "ALL" || u.role === roleFilter) &&
            `${u.full_name} ${u.email} ${u.phone || ""}`.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, roleFilter, search]);

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [search, roleFilter]);

    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'GMMC_ADMIN').length,
        nodeAdmins: users.filter(u => u.role === 'SCHOOL_ADMIN').length,
        active: users.filter(u => u.status === 'ACTIVE').length
    }), [users]);

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50/30 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <UserCircle size={20} className="text-indigo-600" />
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Identity & Access</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Manage users, roles, and system-wide permissions.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all transform active:scale-95"
                >
                    <Plus size={18} /> Provision New User
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Accounts", value: stats.total, icon: Users, color: "indigo" },
                    { label: "Root Access", value: stats.admins, icon: ShieldCheck, color: "rose" },
                    { label: "Node Managers", value: stats.nodeAdmins, icon: Building2, color: "blue" },
                    { label: "Active Live", value: stats.active, icon: Check, color: "emerald" },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : s.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600 group-hover:scale-110 transition-transform`}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                {/* Search & Role Filter Bar */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/20">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text" placeholder="Search by name, email, phone..."
                                value={search} onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
                            {["ALL", ...ROLES].map((r) => (
                                <button
                                    key={r} onClick={() => setRoleFilter(r)}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-xl transition-all ${roleFilter === r ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {r === "ALL" ? "Global" : ROLE_LABELS[r]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            Match found: <span className="text-slate-900 font-bold">{filtered.length}</span>
                        </p>
                    </div>
                </div>

                {/* Dense Table */}
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={32} className="animate-spin text-indigo-500" />
                        <p className="text-sm font-medium text-slate-400 italic">Decrypting identity database...</p>
                    </div>
                ) : pagedData.length === 0 ? (
                    <div className="py-24 text-center">
                        <Users size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 text-sm font-medium">No identities discovered matching your query.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    {["Identity", "Role Assignment", "Node Association", "Access Status", "Actions"].map((h) => (
                                        <th key={h} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pagedData.map((u) => (
                                    <tr key={u.id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                                                    {u.full_name?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{u.full_name}</span>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 italic">
                                                        <Mail size={10} /> {u.email}
                                                        {u.phone && <><span className="text-slate-200">•</span> <Phone size={10} /> {u.phone}</>}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${ROLE_COLORS[u.role] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                {ROLE_LABELS[u.role] || u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={13} className="text-slate-300" />
                                                <span className="text-xs font-medium text-slate-600">{u.tenant_name || "Central Hub"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm">
                                                    <Pencil size={15} />
                                                </button>
                                                <button onClick={() => openPwd(u)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm">
                                                    <Key size={15} />
                                                </button>
                                                <button className="p-2 text-slate-300 hover:text-slate-600">
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Frame <span className="text-slate-900 font-black">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-black">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> <span className="text-slate-300 px-1">/</span> Total Registry <span className="text-slate-900 font-black">{filtered.length}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p} onClick={() => setCurrentPage(p)}
                                    className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${currentPage === p ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-white hover:text-slate-600 border border-transparent hover:border-slate-200'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* User create/edit modal */}
            {modal && (
                <PremiumModal title={editing ? "Update Presence" : "Provision Identity"} onClose={() => setModal(false)}>
                    {error && <ErrBox msg={error} />}
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <F label="Full Registry Name" value={form.full_name} ch={(v) => set("full_name", v)} ph="John Doe" />
                            <F label="Access Email (Locked)" value={form.email} ch={(v) => set("email", v)} ph="email@example.com" type="email" disabled={!!editing} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <F label="Contact Number" value={form.phone} ch={(v) => set("phone", v)} ph="+91 XXXXXXXXXX" />
                            {!editing && <F label="Initial Credentials" value={form.password} ch={(v) => set("password", v)} ph="Secure Password" type="password" />}
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance Level</label>
                                <select value={form.role} onChange={(e) => set("role", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all">
                                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Attachment</label>
                                <select value={form.tenant_id || ""} onChange={(e) => set("tenant_id", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all">
                                    <option value="">System Hub</option>
                                    {tenants.map((t) => <option key={t.id} value={t.id}>{t.tenant_name}</option>)}
                                </select>
                            </div>
                        </div>
                        {editing && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lifecycle Status</label>
                                <div className="flex gap-2">
                                    {["ACTIVE", "INACTIVE"].map(s => (
                                        <button
                                            key={s} type="button" onClick={() => set("status", s)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Btns onCancel={() => setModal(false)} saving={saving} label={editing ? "Update Identity" : "Authorize Provisioning"} />
                    </form>
                </PremiumModal>
            )}

            {/* Reset password modal */}
            {pwdModal && (
                <PremiumModal title={`Reset Authentication`} subtitle={pwdUser?.full_name} onClose={() => setPwdModal(false)}>
                    {pwdErr && <ErrBox msg={pwdErr} />}
                    <form onSubmit={handlePwd} className="space-y-5">
                        <F label="Forced New Password" value={newPwd} ch={setNewPwd} ph="Min. 6 alphanumeric" type="password" />
                        <p className="text-[10px] text-slate-400 font-medium italic mt-2">Updating this will revoke the previous cryptographic secret immediately.</p>
                        <Btns onCancel={() => setPwdModal(false)} saving={saving} label="Confirm Secret Reset" danger />
                    </form>
                </PremiumModal>
            )}
        </div>
    );
}

function PremiumModal({ title, subtitle, onClose, children }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 relative">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none italic">{title}</h2>
                    {subtitle && <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 italic">{subtitle}</p>}
                    <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-rose-600 transition-colors bg-white p-2 rounded-xl border border-slate-100 shadow-sm"><X size={18} /></button>
                </div>
                <div className="px-10 py-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

function ErrBox({ msg }) {
    return (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
            <Shield size={16} className="shrink-0" />
            <p className="text-[11px] font-bold uppercase tracking-tight">{msg}</p>
        </div>
    );
}

function Btns({ onCancel, saving, label, danger }) {
    return (
        <div className="flex gap-4 pt-6">
            <button type="button" onClick={onCancel} className="px-6 py-3 rounded-2xl text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-slate-600 transition-all">Dismiss</button>
            <button type="submit" disabled={saving}
                className={`flex-1 text-white text-[11px] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl transition-all shadow-xl disabled:opacity-60 flex items-center justify-center gap-2 ${danger ? "bg-slate-900 hover:bg-rose-600 shadow-slate-100" : "bg-slate-900 hover:bg-indigo-600 shadow-indigo-100"}`}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                {label}
            </button>
        </div>
    );
}

function F({ label, value, ch, ph, type = "text", disabled }) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <input type={type} placeholder={ph} value={value || ""} onChange={(e) => ch(e.target.value)} disabled={disabled}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50/50 disabled:text-slate-300 transition-all font-sans" />
        </div>
    );
}

function Shield(props) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
}

