import { useState, useEffect } from "react";
import { apiCreateMarketingSchool, apiUpdateMarketingSchool, apiGetMarketingSchoolDetail } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ChevronLeft, Building2, User, Phone, 
    Mail, MapPin, Loader2, CheckCircle, 
    Globe, Users, Layers, MessageSquare, Save, X
} from "lucide-react";

const INTEREST_OPTIONS = [
    "Admission Management", "Student Information System", "Attendance (Student)",
    "Attendance (Staff)", "Fee Management", "Online Payments", "Exams & Results",
    "Report Cards", "Timetable", "Homework / Assignments", "Parent Portal",
    "Student Portal", "Teacher Portal", "Transport Management", "Hostel Management",
    "Library Management", "HR & Payroll", "Inventory", "SMS / WhatsApp Alerts",
    "Mobile App Required", "ID Card", "Website"
];

// Simple, clean styles
const inputCls = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all";
const labelCls = "block text-xs font-medium text-gray-500 mb-1.5";

const Field = ({ label, children, className = "", error }) => (
    <div className={`space-y-1 ${className}`}>
        <label className={labelCls}>{label}</label>
        {children}
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
);

export default function AddLead() {
    const { id } = useParams();
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

    const selectedInterests = formData.interested_in 
        ? formData.interested_in.split(',').map(i => i.trim()).filter(Boolean)
        : [];

    useEffect(() => {
        if (isEdit) fetchLeadData();
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
            toast.error("Failed to load lead details");
            navigate("/marketing/leads");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "mobile") value = value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const toggleInterest = (opt) => {
        let current = [...selectedInterests];
        if (current.includes(opt)) current = current.filter(i => i !== opt);
        else current.push(opt);
        setFormData({ ...formData, interested_in: current.join(',') });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const newErrors = {};
        if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
        if (formData.mobile && formData.mobile.length !== 10) newErrors.mobile = "Mobile must be 10 digits";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return toast.error("Please fix the errors in the form.");
        }

        setLoading(true);
        try {
            if (isEdit) {
                await apiUpdateMarketingSchool(id, formData);
                toast.success("Lead updated successfully");
                setTimeout(() => navigate(`/marketing/schools/${id}`), 500);
            } else {
                await apiCreateMarketingSchool(formData);
                toast.success("Lead registered successfully");
                setTimeout(() => navigate('/marketing/leads'), 500);
            }
        } catch (err) {
            toast.error(err.message || `Failed to save lead`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 gap-3">
                <Loader2 size={28} className="animate-spin text-indigo-500" />
                <p className="text-sm">Loading lead data...</p>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
                    <ChevronLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        {isEdit ? "Update Lead" : "New Lead Registration"}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">Fill in the school and contact details below</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Left: Main Details (2 Columns on Desktop) */}
                <div className="lg:col-span-2 space-y-5">
                    
                    {/* School Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Building2 size={14} />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800">School Details</h2>
                        </div>
                        
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="School Name *" className="md:col-span-2">
                                <input required name="school_name" value={formData.school_name} onChange={handleChange} className={inputCls} placeholder="Enter school name" />
                            </Field>
                            <Field label="City">
                                <input name="city" value={formData.city} onChange={handleChange} className={inputCls} placeholder="City" />
                            </Field>
                            <Field label="State">
                                <input name="state" value={formData.state} onChange={handleChange} className={inputCls} placeholder="State" />
                            </Field>
                            <Field label="Education Board">
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
                            <Field label="Total Students (Approx)">
                                <input name="studentscount" value={formData.studentscount} onChange={handleChange} className={inputCls} placeholder="e.g. 500" />
                            </Field>
                            <Field label="Is Demo Required?">
                                <select name="demorequire" value={formData.demorequire} onChange={handleChange} className={inputCls}>
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Already Done">Already Done</option>
                                </select>
                            </Field>
                            <Field label="Full Address" className="md:col-span-2">
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className={`${inputCls} resize-none`} placeholder="Complete school address..." />
                            </Field>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <User size={14} />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800">Contact Person</h2>
                        </div>
                        
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Primary Contact Name *">
                                <input required name="contact_person1" value={formData.contact_person1} onChange={handleChange} className={inputCls} placeholder="Full name of Principal/Admin" />
                            </Field>
                            <Field label="Mobile Number" error={errors.mobile}>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="mobile" value={formData.mobile} onChange={handleChange} className={`${inputCls} pl-9`} placeholder="10-digit number" />
                                </div>
                            </Field>
                            <Field label="Secondary Contact Name">
                                <input name="contact_person2" value={formData.contact_person2} onChange={handleChange} className={inputCls} placeholder="Alternative contact name" />
                            </Field>
                            <Field label="Official Email" error={errors.email}>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={`${inputCls} pl-9`} placeholder="school@example.com" />
                                </div>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Right: Modules & Interests */}
                <div className="space-y-5">
                    
                    {/* Modules Checklist */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[520px]">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Layers size={14} />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-800">Interests</h2>
                            </div>
                            {selectedInterests.length > 0 && (
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {selectedInterests.length} Selected
                                </span>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
                            {INTEREST_OPTIONS.map(opt => {
                                const active = selectedInterests.includes(opt);
                                return (
                                    <button 
                                        key={opt}
                                        type="button"
                                        onClick={() => toggleInterest(opt)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all border ${
                                            active 
                                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                : 'bg-white border-transparent hover:bg-gray-50 text-gray-600 hover:border-gray-100'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                            active ? 'bg-white border-white' : 'bg-gray-100 border-gray-200'
                                        }`}>
                                            {active && <CheckCircle size={10} className="text-indigo-600" strokeWidth={4} />}
                                        </div>
                                        <span className="text-xs font-medium truncate">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <MessageSquare size={14} />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800">Internal Notes</h2>
                        </div>
                        <div className="p-4">
                            <textarea 
                                name="comments" 
                                value={formData.comments} 
                                onChange={handleChange} 
                                rows="4" 
                                className={`${inputCls} resize-none text-xs`} 
                                placeholder="Any specific requirements or follow-up notes..." 
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button 
                            disabled={loading} 
                            type="submit" 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : (
                                <>{isEdit ? <Save size={16} /> : <CheckCircle size={16} />} {isEdit ? "Update Lead" : "Register Lead"}</>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)} 
                            className="w-full text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}