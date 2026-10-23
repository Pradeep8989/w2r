import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Truck, ShieldCheck } from 'lucide-react';
import { Role } from '../../types';
import { storageService } from '../../services/storageService';

export const RoleSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveRoleFromPath = (): Role => {
    if (location.pathname.startsWith('/recycler')) return 'recycler';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'customer';
  };

  const activeRole = getActiveRoleFromPath();

  const handleRoleChange = (role: Role) => {
    storageService.setCurrentRole(role);
    if (role === 'customer') {
      navigate('/customer');
    } else if (role === 'recycler') {
      navigate('/recycler');
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
      <button
        onClick={() => handleRoleChange('customer')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          activeRole === 'customer'
            ? 'bg-white text-[#166534] shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to Resident / Customer view"
      >
        <User className="w-3.5 h-3.5" />
        <span>Customer</span>
      </button>

      <button
        onClick={() => handleRoleChange('recycler')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          activeRole === 'recycler'
            ? 'bg-white text-blue-700 shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to Recycler / Collection Partner view"
      >
        <Truck className="w-3.5 h-3.5" />
        <span>Recycler</span>
      </button>

      <button
        onClick={() => handleRoleChange('admin')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          activeRole === 'admin'
            ? 'bg-white text-purple-700 shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to Admin & Evaluation view"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin</span>
      </button>
    </div>
  );
};
