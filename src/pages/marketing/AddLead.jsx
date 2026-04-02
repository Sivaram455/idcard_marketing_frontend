import { useState, useEffect } from "react";
import { apiCreateMarketingSchool, apiUpdateMarketingSchool, apiGetMarketingSchoolDetail } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ChevronLeft, CreditCard, User, Mail, 
    Phone, MapPin, MessageSquare, Loader2, Save,
    PlusCircle, Building2, Shield, Target, GraduationCap,
    LayoutGrid, ChevronDown, CheckCircle, Boxes, X
} from "lucide-react";

// Dense UI Constants
const inputCls = "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200";
const labelCls = "block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-0.5";

const INTEREST_OPTIONS = [
    "Admission Management", "Student Information System", "Attendance (Student)",
    "Attendance (Staff)", "Fee Management", "Online Payments", "Exams & Results",
    "Report Cards", "Timetable", "Homework / Assignments", "Parent Portal",
    "Student Portal", "Teacher Portal", "Transport Management", "Hostel Management",
    "Library Management", "HR & Payroll", "Inventory", "SMS / WhatsApp Alerts",
    "Mobile App Required", "ID Card"
];

const Field = ({ label, children, className = "", error }) => (
    <div className={`space-y-0.5 ${className}`}>
        <label className={labelCls}>{label}</label>
        {children}
        {error && <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-0.5 ml-1 animate-pulse">{error}</p>}
    </div>
);

export default function AddLead() {
    const { id } = useParams(); // For edit mode
    const isEdit = !!id;
    const toast = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        school_name: "",
        contact_person1: "",
        contact_person2: "",
        mobile: "",
        email: "",
        address: "",
        city: "",
        state: "",
        comments: "",
        interested_in: "",
        studentscount: "",
        demorequire: "",
        Board: ""
    });

    // Helper to get selected interests as array
    const selectedInterests = formData.interested_in 
        ? formData.interested_in.split(',').map(i => i.trim()).filter(Boolean)
        : [];

    useEffect(() => {
        if (isEdit) {
            fetchLeadData();
        }
    }, [id]);

    const fetchLeadData = async () => {
        try {
            const res = await apiGetMarketingSchoolDetail(id);
            if (res.data) {
                setFormData({
                    school_name: res.data.school_name || "",
                    contact_person1: res.data.contact_person1 || "",
                    contact_person2: res.data.contact_person2 || "",
                    mobile: res.data.mobile || "",
                    email: res.data.email || "",
                    address: res.data.address || "",
                    city: res.data.city || "",
                    state: res.data.state || "",
                    comments: res.data.comments || "",
                    interested_in: res.data.interested_in || "",
                    studentscount: res.data.studnetscount || res.data.studentscount || "",
                    demorequire: res.data.demorequire || "",
                    Board: res.data.Board || ""
                });
            }
        } catch (err) {
            toast.error("Resource acquisition failed");
            navigate("/marketing/leads");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        
        // Mobile validation: check if it's 10 digits
        if (formData.mobile) {
            const cleanMobile = formData.mobile.replace(/\D/g, '');
            if (cleanMobile.length !== 10) {
                newErrors.mobile = "Mobile must be 10 digits";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleInterest = (opt) => {
        let current = [...selectedInterests];
        if (current.includes(opt)) {
            current = current.filter(i => i !== opt);
        } else {
            current.push(opt);
        }
        setFormData({ ...formData, interested_in: current.join(',') });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please correct errors in form");
            return;
        }
        setLoading(true);
        try {
            if (isEdit) {
                await apiUpdateMarketingSchool(id, formData);
                toast.success("Operational data updated");
                setTimeout(() => navigate(`/marketing/schools/${id}`), 1000);
            } else {
                await apiCreateMarketingSchool(formData);
                toast.success("Lead registered in pipeline");
                setTimeout(() => navigate('/marketing/leads'), 1000);
            }
        } catch (err) {
            toast.error(err.message || `Deployment error`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <div className="relative mb-4">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                    <Target size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse font-outfit">Retrieving Lead Intel...</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Header Section - More Compact */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Shield size={12} className="text-indigo-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Pipeline Registry</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            {isEdit ? "Update" : "Register"} <span className="text-indigo-600">Lead</span>
                        </h1>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Main Form Fields */}
                <div className="lg:col-span-12 xl:col-span-12 space-y-5">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8 divide-x divide-slate-50">
                            
                            {/* Left Column: Institutional & Context */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={13} className="text-indigo-500" />
                                        <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-outfit">Institutional Context</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <Field label="School Name *">
                                                <input required name="school_name" value={formData.school_name} onChange={handleChange} className={inputCls} placeholder="Establishment Name" />
                                            </Field>
                                        </div>
                                        <Field label="City">
                                            <input name="city" value={formData.city} onChange={handleChange} className={inputCls} placeholder="City" />
                                        </Field>
                                        <Field label="State">
                                            <input name="state" value={formData.state} onChange={handleChange} className={inputCls} placeholder="Region" />
                                        </Field>
                                        <Field label="Board">
                                            <select name="Board" value={formData.Board} onChange={handleChange} className={inputCls}>
                                                <option value="">Select Board</option>
                                                <option>CBSE</option>
                                                <option>ICSE</option>
                                                <option>State Board</option>
                                                <option>IB</option>
                                                <option>IGCSE</option>
                                                <option>Other</option>
                                            </select>
                                        </Field>
                                        <Field label="Total Students">
                                            <input name="studentscount" value={formData.studentscount} onChange={handleChange} className={inputCls} placeholder="e.g. 500" type="text" />
                                        </Field>
                                        <Field label="Demo Required">
                                            <select name="demorequire" value={formData.demorequire} onChange={handleChange} className={inputCls}>
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                                <option value="Already Done">Already Done</option>
                                            </select>
                                        </Field>
                                        <div className="md:col-span-2">
                                            <Field label="Physical Address">
                                                <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className={`${inputCls} resize-none min-h-[50px]`} placeholder="Street, Building..." />
                                            </Field>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <div className="flex items-center gap-2 mb-2 border-t border-slate-50 pt-4">
                                        <GraduationCap size={13} className="text-rose-500" />
                                        <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-outfit">Contact Intel</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Primary Decision Maker">
                                            <input required name="contact_person1" value={formData.contact_person1} onChange={handleChange} className={inputCls} placeholder="Full Name" />
                                        </Field>
                                        <Field label="Direct Connectivity (Mobile)" error={errors.mobile}>
                                            <input name="mobile" value={formData.mobile} onChange={handleChange} className={`${inputCls} ${errors.mobile ? 'border-rose-400 focus:border-rose-500' : ''}`} placeholder="10 Digits" />
                                        </Field>
                                        <Field label="Secondary Liaison">
                                            <input name="contact_person2" value={formData.contact_person2} onChange={handleChange} className={inputCls} placeholder="Alt Name" />
                                        </Field>
                                        <Field label="Official Email Protocol" error={errors.email}>
                                            <input name="email" type="email" value={formData.email} onChange={handleChange} className={`${inputCls} ${errors.email ? 'border-rose-400 focus:border-rose-500' : ''}`} placeholder="school@domain.com" />
                                        </Field>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Module Interest Multi-Select */}
                            <div className="lg:pl-8 space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Boxes size={13} className="text-indigo-500" />
                                        <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-outfit">Module Interest (Multi-Select)</h3>
                                    </div>
                                    
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 max-h-[280px] overflow-y-auto scrollbar-thin">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                                            {INTEREST_OPTIONS.map(opt => {
                                                const active = selectedInterests.includes(opt);
                                                return (
                                                    <button 
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => toggleInterest(opt)}
                                                        className={`flex items-center gap-2 group p-1.5 rounded-lg transition-all text-left ${active ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-indigo-50 text-slate-500'}`}
                                                    >
                                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${active ? 'bg-white border-white' : 'bg-white border-slate-200 group-hover:border-indigo-300'}`}>
                                                            {active && <CheckCircle size={10} className="text-indigo-600" strokeWidth={4} />}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-tight truncate leading-none">
                                                            {opt}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* Selection Count / Multi-Tags */}
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {selectedInterests.length === 0 ? (
                                            <p className="text-[9px] text-slate-300 font-bold uppercase italic tracking-widest">No modules identified yet...</p>
                                        ) : (
                                            <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{selectedInterests.length} MODULES IDENTIFIED</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <Field label="Intelligence Summary / Internal Notes">
                                        <textarea 
                                            name="comments" 
                                            value={formData.comments} 
                                            onChange={handleChange} 
                                            rows="4" 
                                            className={`${inputCls} resize-none italic text-slate-500 font-medium`} 
                                            placeholder="Competitor presence, specific pain points, negotiation status..." 
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* Control Footer - Tighter */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest max-w-sm italic">
                                Registry operational check: ensure institutional accuracy before commitment.
                            </p>
                            <div className="flex items-center gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => navigate(-1)} 
                                    className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors italic font-outfit"
                                >
                                    Abort
                                </button>
                                <button 
                                    disabled={loading} 
                                    type="submit" 
                                    className="bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black uppercase tracking-[0.15em] italic py-2.5 px-6 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] font-outfit text-[10px]"
                                >
                                    {loading ? (
                                        <><Loader2 size={13} className="animate-spin" /> Synchronizing...</>
                                    ) : (
                                        <>{isEdit ? <Save size={13} strokeWidth={3} /> : <CheckCircle size={13} strokeWidth={3} />} {isEdit ? "Update Command" : "Initialize Lead"}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}