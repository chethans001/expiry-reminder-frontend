import React from 'react';
import { Link } from 'react-router-dom';
import ExpiryBadge from '../common/ExpiryBadge';
import CategoryIcon from '../items/CategoryIcon';
import { formatDisplayDate } from '../../utils/dateUtils';
import { Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function UrgentReminders({ items = [], onViewItem }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Upcoming Expiry Reminders</span>
          </h3>
          <p className="text-xs text-slate-400">Items reaching expiry nearest to today</p>
        </div>
        <Link
          to="/expiring-soon"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-xs text-slate-500 font-medium">No urgent items expiring soon!</p>
          <p className="text-[11px] text-slate-400">Everything in your pantry is in a safe date range.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => onViewItem(item)}
              className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800 transition flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon
                  icon={item.category?.icon || 'Tag'}
                  color={item.category?.color || '#6366F1'}
                  className="w-4 h-4"
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{item.storageLocation || 'Kitchen'}</span>
                    <span>•</span>
                    <span>{formatDisplayDate(item.expiryDate)}</span>
                  </div>
                </div>
              </div>

              <ExpiryBadge
                status={item.status}
                label={item.label}
                daysRemaining={item.daysRemaining}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
