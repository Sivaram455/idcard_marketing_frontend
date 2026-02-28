import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPortalSelector() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 gap-8">
      <div 
        onClick={() => navigate('/admin/marketing')}
        className="cursor-pointer p-10 bg-white shadow-xl rounded-2xl hover:scale-105 transition-all text-center"
      >
        <h2 className="text-2xl font-bold text-purple-600">Marketing Portal</h2>
        <p className="text-gray-500">Manage website, leads, and SEO</p>
      </div>

      <div 
        onClick={() => navigate('/admin/id-card')}
        className="cursor-pointer p-10 bg-white shadow-xl rounded-2xl hover:scale-105 transition-all text-center"
      >
        <h2 className="text-2xl font-bold text-blue-600">ID Card Portal</h2>
        <p className="text-gray-500">Manage schools, orders, and printing</p>
      </div>
    </div>
  );
}