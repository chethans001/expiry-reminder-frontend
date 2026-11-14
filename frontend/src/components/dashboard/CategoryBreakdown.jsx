import React from 'react';
import CategoryIcon from '../items/CategoryIcon';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function CategoryBreakdown({ categories = [] }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Category Overview
          </h3>
          <p className="text-xs text-slate-400">Items tracked by product type</p>
        </div>
        <Link
          to="/categories"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">No category data yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.name}
              to={`/items?category=${encodeURIComponent(cat.name)}`}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800 transition flex items-center gap-3 group"
            >
              <CategoryIcon icon={cat.icon} color={cat.color} className="w-4 h-4" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition">
                  {cat.name}
                </h4>
                <span className="text-[11px] text-slate-400">
                  {cat.count} {cat.count === 1 ? 'item' : 'items'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
