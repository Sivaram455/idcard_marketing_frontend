import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, CreditCard } from "lucide-react";

export default function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Welcome Back, Admin</h1>
        <p className="text-lg text-slate-500">Select a workspace to continue</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        <button 
          onClick={() => navigate("/admin/marketing")}
          className="group p-8 bg-white border-2 border-transparent hover:border-indigo-500 rounded-3xl shadow-xl shadow-slate-200/50 transition-all text-left"
        >
          <div className="bg-pink-50 text-pink-500 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
            <Megaphone size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Marketing Portal</h2>
          <p className="text-slate-500 leading-relaxed">
            Manage your website content, marketing leads, and growth analytics.
          </p>
        </button>

        <button 
          onClick={() => navigate("/admin/id-card")}
          className="group p-8 bg-white border-2 border-transparent hover:border-indigo-500 rounded-3xl shadow-xl shadow-slate-200/50 transition-all text-left"
        >
          <div className="bg-blue-50 text-blue-500 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
            <CreditCard size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">ID Card Suite</h2>
          <p className="text-slate-500 leading-relaxed">
            Manage schools, process student orders, and track card production.
          </p>
        </button>
      </div>
    </div>
  );
}