import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Bell,
  Scan,
  Menu,
  X,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { storageService } from '../../services/storageService';
import { ActivityNotification } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const loadNotifications = () => {
    setNotifications(storageService.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
    const handleStorageChange = () => loadNotifications();
    window.addEventListener('wtr_data_changed', handleStorageChange);
    return () => window.removeEventListener('wtr_data_changed', handleStorageChange);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    storageService.markNotificationsAsRead();
    loadNotifications();
  };

  const handleNotifClick = (notif: ActivityNotification) => {
    if (notif.link) {
      setShowNotifDropdown(false);
      navigate(notif.link);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-7xl 2xl:max-w-[1440px] mx-auto">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#166534] to-[#22c55e] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg block leading-tight">
                Waste to Resource
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold tracking-wider uppercase block">
                Circular Recovery Tech
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Role Switcher (Visible on desktop & tablet) */}
        <div className="hidden md:flex items-center gap-2">
          <RoleSwitcher />
        </div>

        {/* Right: Actions & Notifications */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/customer/scan"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-xs"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-300" />
            <span>Scan Waste</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">
                        Activity Feed
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#166534] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No activity notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotifClick(item)}
                          className={`p-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            !item.read ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-800">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {item.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Role Switcher Bar */}
      <div className="md:hidden mt-2 pt-2 border-t border-slate-100 flex justify-center">
        <RoleSwitcher />
      </div>
    </header>
  );
};
