import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMarketingSchools } from "../../utils/api";
import { Search, Plus, MapPin, ChevronRight, RefreshCw } from "lucide-react";

export default function MarketingLeads() {
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const res = await apiGetMarketingSchools();
            setSchools(res.data || []);
            setFiltered(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(schools.filter(s => 
            s.school_name.toLowerCase().includes(q) || 
            (s.city || "").toLowerCase().includes(q)
        ));
    }, [search, schools]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your school pipeline and prospects</p>
                </div>
                <button
                    onClick={() => navigate('/marketing/add')}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-black transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> New Lead
                </button>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search schools..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={fetchSchools} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm">No leads found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map((school) => (
                            <div 
                                key={school.id}
                                onClick={() => navigate(`/marketing/schools/${school.id}`)}
                                className="group px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="space-y-1">
                                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{school.school_name}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {school.city || "No location"}</span>
                                        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-600">{school.status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-medium text-gray-700">{school.mobile || school.email || "-"}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{school.contact_person1 || "No contact"}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}