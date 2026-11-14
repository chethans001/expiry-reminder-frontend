import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Clock,
  AlertCircle,
  CalendarDays,
  Heart,
  FolderTree,
  BarChart3,
  Bell,
  Trash2,
  Settings,
  X,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: 'Personal Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Items', path: '/items', icon: Package },
    { label: 'Add Item', path: '/items/new', icon: PlusCircle },
    { label: 'Upcoming Expiry', path: '/expiring-soon', icon: Clock },
    { label: 'Expired Items', path: '/expired', icon: AlertCircle },
    { label: 'Expiry Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'My Categories', path: '/categories', icon: FolderTree },
    { label: 'Personal Reports', path: '/reports', icon: BarChart3 },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    },
    { label: 'Trash & Restore', path: '/trash', icon: Trash2 },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="font-bold text-slate-800 dark:text-white text-base">
            Expiry Reminder
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Personal Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Card / Personal Household Status */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Personal & Family</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Household products & medicine expiry monitoring.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
