import { useState, useEffect, useMemo } from "react";
import { apiGetAllMarketingSchools, apiGetUsers, apiAssignSchool } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import {
    UserPlus, Building2, Search, Users,
    CheckCircle, Loader2, Calendar, Info,
    TrendingUp, ArrowRight, ChevronLeft, X, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssignLeads() {
    const toast = useToast();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        school_id: "",
        agent_id: "",
        assigned_date: new Date().toISOString().split("T")[0],
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [schoolsRes, usersRes] = await Promise.all([
                apiGetAllMarketingSchools(),
                apiGetUsers(),
            ]);
            setSchools(schoolsRes.data || []);
            const filteredAgents = usersRes.data?.filter((u) =>
                ["AGENT", "agent", "marketing", "MARKETING", "GMMC_ADMIN"].includes(u.role)
            ) || [];
            setAgents(filteredAgents);
        } catch {
            toast.error("Failed to load data. Please refresh.");
        } finally {
            setFetching(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!formData.school_id || !formData.agent_id)
            return toast.error("Please select both a school and an agent.");

        setLoading(true);
        try {
            await apiAssignSchool(formData);
            toast.success("Lead assigned successfully!");
            setFormData((prev) => ({ ...prev, school_id: "" }));
            fetchData();
        } catch (err) {
            toast.error(err.message || "Failed to assign lead.");
        } finally {
            setLoading(false);
        }
    };

    const unassignedSchools = useMemo(() =>
        schools
            .filter((s) => s.assigned_to == null || s.assigned_to === '' || s.assigned_to === 0)
            .sort((a, b) => a.school_name.localeCompare(b.school_name)),
        [schools]
    );

    const filteredPool = useMemo(() =>
        unassignedSchools.filter((s) =>
            s.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.city?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [unassignedSchools, searchTerm]
    );

    const selectedSchool = schools.find((s) => s.id == formData.school_id);
    const selectedAgent = agents.find((a) => a.id == formData.agent_id);

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-400">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
                <p className="text-sm text-gray-400">Loading data...</p>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-6xl mx-auto pb-12">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Assign Leads</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {unassignedSchools.length} school{unassignedSchools.length !== 1 ? "s" : ""} waiting to be assigned
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left: Assignment Form ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Form Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <UserPlus size={14} className="text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-800">Assign a Lead</h2>
                                <p className="text-xs text-gray-400">Pick a school, choose an agent and set the date</p>
                            </div>
                        </div>

                        <form onSubmit={handleAssign} className="p-5 space-y-4">

                            {/* School Select */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    School <span className="text-red-400">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.school_id}
                                    onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                >
                                    <option value="">— Select a school —</option>
                                    {unassignedSchools.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.school_name}{s.city ? ` — ${s.city}` : ""}
                                        </option>
                                    ))}
                                </select>
                                {unassignedSchools.length === 0 && (
                                    <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                                        <Info size={11} /> All schools are already assigned.
                                    </p>
                                )}
                            </div>

                            {/* Agent Select */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Assign To (Agent) <span className="text-red-400">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.agent_id}
                                    onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                >
                                    <option value="">— Select an agent —</option>
                                    {agents.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.full_name} ({a.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Assigned Date
                                </label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={formData.assigned_date}
                                        onChange={(e) => setFormData({ ...formData, assigned_date: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Preview of selection */}
                            {(selectedSchool || selectedAgent) && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 space-y-1.5">
                                    <p className="text-xs font-semibold text-indigo-700 mb-2">Assignment Summary</p>
                                    {selectedSchool && (
                                        <div className="flex items-center gap-2 text-xs text-indigo-700">
                                            <Building2 size={12} className="shrink-0" />
                                            <span className="font-medium">{selectedSchool.school_name}</span>
                                            {selectedSchool.city && <span className="text-indigo-400">· {selectedSchool.city}</span>}
                                        </div>
                                    )}
                                    {selectedAgent && (
                                        <div className="flex items-center gap-2 text-xs text-indigo-700">
                                            <ArrowRight size={12} className="shrink-0" />
                                            <span className="font-medium">{selectedAgent.full_name}</span>
                                            <span className="text-indigo-400">· {selectedAgent.role}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !formData.school_id || !formData.agent_id}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-all shadow-sm"
                            >
                                {loading ? (
                                    <><Loader2 size={15} className="animate-spin" /> Assigning...</>
                                ) : (
                                    <><CheckCircle size={15} /> Assign Lead</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ── Agent Summary Cards ── */}
                    {agents.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-800">Agent Workload</h2>
                                    <p className="text-xs text-gray-400">How many leads each agent currently has</p>
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {agents.map((agent) => {
                                    const count = schools.filter((s) => s.assigned_to === agent.id).length;
                                    const pct = Math.min((count / 10) * 100, 100);
                                    return (
                                        <div
                                            key={agent.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${formData.agent_id == agent.id ? "border-indigo-300 bg-indigo-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}
                                        >
                                            <div 
                                                onClick={() => setFormData((f) => ({ ...f, agent_id: agent.id }))}
                                                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0 border border-gray-200 cursor-pointer"
                                            >
                                                {agent.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-semibold text-gray-800 truncate">{agent.full_name}</p>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/marketing/agent-analytics/${agent.id}`); }}
                                                        className="p-1 rounded-md hover:bg-white text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="View Analytics"
                                                    >
                                                        <BarChart3 size={12} />
                                                    </button>
                                                </div>
                                                <div 
                                                    onClick={() => setFormData((f) => ({ ...f, agent_id: agent.id }))}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${pct > 80 ? "bg-emerald-500" : pct > 40 ? "bg-indigo-500" : "bg-amber-400"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center mt-0.5">
                                                        <p className="text-[10px] text-gray-400">{agent.role}</p>
                                                        <span className="text-[10px] font-bold text-indigo-600">{count} leads</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: Unassigned Schools Panel ── */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col" style={{ maxHeight: "520px" }}>
                        <div className="px-4 py-3.5 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-800">Unassigned Schools</h2>
                                    <p className="text-xs text-gray-400">{unassignedSchools.length} schools waiting</p>
                                </div>
                                {searchTerm && (
                                    <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
                                        {filteredPool.length} found
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by name or city..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-indigo-400 focus:bg-white transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredPool.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                                    <Building2 size={28} strokeWidth={1.5} className="mb-2" />
                                    <p className="text-xs font-medium text-gray-400">
                                        {searchTerm ? "No schools match your search" : "All schools are assigned"}
                                    </p>
                                </div>
                            ) : (
                                filteredPool.map((s) => {
                                    const isSelected = formData.school_id == s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setFormData((f) => ({ ...f, school_id: s.id }))}
                                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                                                isSelected
                                                    ? "bg-indigo-600 text-white"
                                                    : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-gray-800"}`}>
                                                    {s.school_name}
                                                </p>
                                                <p className={`text-[10px] mt-0.5 ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
                                                    {s.city || "—"}
                                                </p>
                                            </div>
                                            {isSelected && <CheckCircle size={14} className="shrink-0 text-indigo-200" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-3">
                        <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-600">
                            Once assigned, a lead is exclusive to that agent.
                            You can reassign it anytime from the school's detail page.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
