import React, { useState } from "react";
import { 
  User, Mail, Phone, MapPin, 
  ShieldCheck, Edit3, Save, Camera, 
  Award, Target, Briefcase, CheckCircle
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [profile, setProfile] = useState({
    name: "Ram",
    role: "Marketing Representative",
    team: "GMMC Marketing Team",
    email: "ram.marketing@gmmc.com",
    phone: "+91 98765 43210",
    location: "Madanapalle, Andhra Pradesh",
    joinedDate: "January 2026"
  });

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleEdit = () => {
    if (isEditing) {
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
      console.log("Profile Updated:", profile);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {showSavedMessage && (
        <div className="fixed top-10 right-10 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300">
          <CheckCircle size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Changes Saved Successfully!</span>
        </div>
      )}

      <div className={`bg-white rounded-[50px] border transition-all duration-500 overflow-hidden ${isEditing ? 'border-[#00D1C1] shadow-2xl shadow-[#00D1C1]/10' : 'border-slate-100 shadow-sm'}`}>
        <div className={`h-32 transition-colors duration-500 ${isEditing ? 'bg-gradient-to-r from-[#00D1C1] to-emerald-400' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`}></div>
        <div className="px-12 pb-12">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16">
            <div className="relative group cursor-pointer">
              <div className="w-40 h-40 bg-white rounded-[40px] p-2 shadow-xl transition-transform group-hover:scale-[1.02]">
                <div className="w-full h-full bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-400 overflow-hidden">
                  <User size={64} />
                </div>
              </div>
              <div className="absolute inset-2 bg-black/40 rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera size={24} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1 mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
                  {isEditing ? "Editing Profile..." : profile.name}
                </h1>
                {!isEditing && (
                  <span className="px-4 py-1.5 bg-[#00D1C1]/10 text-[#00D1C1] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00D1C1]/20">
                    {profile.team}
                  </span>
                )}
              </div>
              <p className="text-slate-400 font-bold text-sm mt-1">{profile.role}</p>
            </div>

            <button 
              onClick={toggleEdit}
              className={`mb-4 flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                isEditing ? "bg-[#00D1C1] text-white hover:bg-[#00b8a9]" : "bg-black text-white hover:bg-slate-800"
              }`}
            >
              {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Edit Profile</>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h3>
              {isEditing && <span className="text-[10px] font-bold text-[#00D1C1] animate-pulse uppercase tracking-widest">You have unsaved changes</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProfileField icon={<User size={18}/>} label="Full Name" value={profile.name} isEditing={isEditing} onChange={(val) => handleChange('name', val)} />
              <ProfileField icon={<Mail size={18}/>} label="Email Address" value={profile.email} isEditing={isEditing} onChange={(val) => handleChange('email', val)} />
              <ProfileField icon={<Phone size={18}/>} label="Mobile Number" value={profile.phone} isEditing={isEditing} onChange={(val) => handleChange('phone', val)} />
              <ProfileField icon={<MapPin size={18}/>} label="Base Location" value={profile.location} isEditing={isEditing} onChange={(val) => handleChange('location', val)} />
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 text-emerald-500">
                <ShieldCheck size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Verified Associate</span>
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase">Last updated: Today</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black p-8 rounded-[50px] text-white shadow-xl">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">Current Standing</h4>
             <div className="flex items-center gap-4">
                <div className="p-4 bg-white/10 rounded-3xl border border-white/10">
                   <Award size={32} className="text-[#00D1C1]" />
                </div>
                <div>
                   <p className="text-3xl font-black italic tracking-tighter">Gold Tier</p>
                   <p className="text-[10px] font-bold text-[#00D1C1] uppercase">Top 5% Performer</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[50px] border border-slate-100 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Career Snapshot</h4>
             <div className="space-y-6">
                <StatRow label="Field Visits" value="124" icon={<Briefcase size={16} />} color="text-slate-800" />
                <StatRow label="Success Rate" value="68%" icon={<Target size={16} />} color="text-[#00D1C1]" />
                <div className="pt-4 border-t border-slate-50 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                    Active on GMMC since {profile.joinedDate}
                  </p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ProfileField({ icon, label, value, isEditing, onChange }) {
  return (
    <div className={`space-y-2 transition-all duration-300 ${isEditing ? 'scale-[1.02]' : ''}`}>
      <label className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${isEditing ? 'text-[#00D1C1]' : 'text-slate-300'}`}>
        {icon} {label}
      </label>
      {isEditing ? (
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-[#00D1C1] focus:ring-4 focus:ring-[#00D1C1]/10 outline-none transition-all"
          autoFocus={label === "Full Name"}
        />
      ) : (
        <p className="text-sm font-black text-slate-800 tracking-tight pl-1 border-2 border-transparent">{value}</p>
      )}
    </div>
  );
}

function StatRow({ label, value, icon, color }) {
  return (
    <div className="flex items-center justify-between group cursor-default">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-slate-50 transition-colors group-hover:bg-slate-100 ${color}`}>{icon}</div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{label}</span>
      </div>
      <span className={`text-xl font-black tracking-tighter transition-transform group-hover:scale-110 ${color}`}>{value}</span>
    </div>
  );
}