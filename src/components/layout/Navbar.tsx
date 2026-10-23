import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Bell,
  Scan,
  Menu,
  X,
  CheckCheck,
  LogOut,
  User,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ActivityNotification, UserSession } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(storageService.getCurrentUser());

  const loadNotifications = () => {
    setNotifications(storageService.getNotifications());
  };

  const loadUser = () => {
    setCurrentUser(storageService.getCurrentUser());
  };

  useEffect(() => {
    loadNotifications();
    loadUser();

    const handleStorageChange = () => {
      loadNotifications();
      loadUser();
    };

    window.addEventListener('wtr_data_changed', handleStorageChange);
    window.addEventListener('wtr_auth_changed', handleStorageChange);
    window.addEventListener('wtr_role_changed', handleStorageChange);

    return () => {
      window.removeEventListener('wtr_data_changed', handleStorageChange);
      window.removeEventListener('wtr_auth_changed', handleStorageChange);
      window.removeEventListener('wtr_role_changed', handleStorageChange);
    };
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

  const handleLogout = () => {
    storageService.logout();
    navigate('/login');
  };

  const roleLabel =
    currentUser?.role === 'customer'
      ? 'Resident'
      : currentUser?.role === 'recycler'
      ? 'Recycler Partner'
      : currentUser?.role === 'admin'
      ? 'System Admin'
      : 'User';

  const roleBadgeColor =
    currentUser?.role === 'customer'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : currentUser?.role === 'recycler'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-purple-50 text-purple-700 border-purple-200';

  const userInitial = (currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
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
                Circular Recovery Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Right: User Profile, Scan Action, Notifications, & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser?.role === 'customer' && (
            <Link
              to="/customer/scan"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-300" />
              <span>Scan Waste</span>
            </Link>
          )}

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

          {/* User Profile Pill & Sign Out */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {userInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleBadgeColor}`}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 sm:px-2.5 sm:py-1 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
                title="Sign out of your account"
              >
                <LogOut className="w-4 h-4 text-slate-500 hover:text-red-600" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold text-[#166534] hover:text-[#14532d] px-3 py-1.5 rounded-xl border border-emerald-600/30 hover:bg-emerald-50"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};


