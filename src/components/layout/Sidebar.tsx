import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Scan,
  Package,
  MapPin,
  Award,
  Leaf,
  Inbox,
  Truck,
  Scale,
  Settings,
  DollarSign,
  Users,
  TestTube2,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface SidebarNavItem {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
  badge?: number;
  badgeText?: string;
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pointsTotal, setPointsTotal] = useState(0);

  const refreshCounts = () => {
    const user = storageService.getCurrentUser();
    const listings = storageService.getListings();
    const userListings =
      user?.role === 'customer' && user.id
        ? listings.filter((l) => l.customerId === user.id)
        : listings;

    setActiveListingsCount(
      userListings.filter((l) =>
        ['awaiting_recycler', 'recycler_accepted', 'pickup_scheduled', 'collected'].includes(l.status)
      ).length
    );
    setPendingRequestsCount(listings.filter((l) => l.status === 'awaiting_recycler').length);
    setPointsTotal(storageService.getTotalPoints());
  };

  useEffect(() => {
    refreshCounts();
    const handleStorageChange = () => refreshCounts();
    window.addEventListener('wtr_data_changed', handleStorageChange);
    window.addEventListener('wtr_auth_changed', handleStorageChange);
    return () => {
      window.removeEventListener('wtr_data_changed', handleStorageChange);
      window.removeEventListener('wtr_auth_changed', handleStorageChange);
    };
  }, []);

  const getRole = () => {
    if (location.pathname.startsWith('/recycler')) return 'recycler';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'customer';
  };

  const role = getRole();

  const customerLinks: SidebarNavItem[] = [
    { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/customer/scan', label: 'AI Waste Scan', icon: Scan },
    {
      to: '/customer/listings',
      label: 'My Listings',
      icon: Package,
      badge: activeListingsCount > 0 ? activeListingsCount : undefined,
    },
    { to: '/customer/collection-points', label: 'Drop-off Points', icon: MapPin },
    {
      to: '/customer/rewards',
      label: 'Rewards & Leaderboard',
      icon: Award,
      badgeText: `${pointsTotal} pts`,
    },
    { to: '/customer/impact', label: 'Environmental Impact', icon: Leaf },
  ];

  const recyclerLinks: SidebarNavItem[] = [
    { to: '/recycler', label: 'Overview', icon: LayoutDashboard, end: true },
    {
      to: '/recycler/requests',
      label: 'Incoming Requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    { to: '/recycler/pickups', label: 'Pickup Management', icon: Truck },
  ];

  const adminLinks: SidebarNavItem[] = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/materials', label: 'Materials & Pricing', icon: DollarSign },
    { to: '/admin/recyclers', label: 'Recycler Partners', icon: Users },
    { to: '/admin/evaluation', label: 'AI Model Evaluation', icon: TestTube2 },
    { to: '/admin/impact', label: 'Before / After Impact', icon: TrendingUp },
    { to: '/admin/methodology', label: 'Methodology & Factors', icon: BookOpen },
  ];

  const links = role === 'customer' ? customerLinks : role === 'recycler' ? recyclerLinks : adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">
      {/* Current Role Subheader */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Current Portal
          </span>
          <span className="text-sm font-bold text-slate-800 capitalize">
            {role === 'customer' ? 'Resident / Customer' : role === 'recycler' ? 'Recycler Partner' : 'System Admin'}
          </span>
        </div>
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            role === 'customer' ? 'bg-emerald-500' : role === 'recycler' ? 'bg-blue-500' : 'bg-purple-500'
          }`}
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-[#166534] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-900" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-600 text-white font-bold">
                  {item.badge}
                </span>
              )}
              {item.badgeText && (
                <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-100 text-[#166534] font-bold">
                  {item.badgeText}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Quick Info */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 rounded-b-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-slate-700">Waste to Resource</span>
          <span className="text-emerald-600 font-semibold">v1.0</span>
        </div>
        <p className="text-slate-400 leading-tight">
          Effortless waste-to-resource classification & circular routing.
        </p>
      </div>
    </aside>
  );
};

