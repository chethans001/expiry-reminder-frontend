import React from 'react';
import { getGreeting } from '../../utils/dateUtils';
import { Plus, Bell, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';

export default function TodayOverview({ user, stats, onQuickAdd }) {
  const greeting = getGreeting();
  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 sm:p-8 shadow-xl shadow-indigo-200 dark:shadow-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-indigo-100 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}, {userName}!
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            {stats?.expiringToday > 0 ? (
              <span className="font-semibold text-amber-300">
                ⚠️ You have {stats.expiringToday} item(s) expiring today!
              </span>
            ) : stats?.expiringSoon > 0 ? (
              <span>You have {stats.expiringSoon} upcoming item(s) expiring soon. Here is your personal overview.</span>
            ) : (
              <span>All your household items and medicines are safe! Nothing expiring urgently.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-xs shadow-lg shadow-black/10 hover:bg-indigo-50 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Quick Add Item</span>
          </button>
        </div>
      </div>

      {/* Decorative gradient glow circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />
    </div>
  );
}
