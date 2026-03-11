import { useState } from "react";
import { apiCreateMarketingSchool } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function AddLead() {
    const toast = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        school_name: "",
        contact_person1: "",
        contact_person2: "",
        mobile: "",
        email: "",
        address: "",
        city: "",
        state: "",
        comments: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiCreateMarketingSchool(formData);
            toast.success("Lead registered successfully!");
            setTimeout(() => navigate('/marketing/leads'), 1000);
        } catch (err) {
            toast.error(err.message || "Failed to register lead");
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, name, type = "text", placeholder, required }) => (
        <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input 
                required={required}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                type={type} 
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm"
                placeholder={placeholder} 
            />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Register New Lead</h1>
                    <p className="text-sm text-gray-500 mt-1">Add a prospective school to your marketing pipeline.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputField label="School Name" name="school_name" placeholder="Name of school" required />
                    </div>
                    <InputField label="Primary Contact" name="contact_person1" placeholder="Lead name" required />
                    <InputField label="Secondary Contact" name="contact_person2" placeholder="Alternate name" />
                    <InputField label="Mobile Number" name="mobile" placeholder="Phone number" />
                    <InputField label="Email Address" name="email" type="email" placeholder="Email contact" />
                    <InputField label="City" name="city" placeholder="City" />
                    <InputField label="State" name="state" placeholder="State" />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Address</label>
                        <textarea 
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2" 
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 transition-all outline-none resize-none shadow-sm"
                            placeholder="Full address of the school"
                        ></textarea>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Comments</label>
                        <textarea 
                            name="comments"
                            value={formData.comments}
                            onChange={handleChange}
                            rows="2" 
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 transition-all outline-none resize-none shadow-sm"
                            placeholder="Notes or context..."
                        ></textarea>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        disabled={loading}
                        type="submit"
                        className="bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Submit Lead"}
                    </button>
                </div>
            </form>
        </div>
    );
}