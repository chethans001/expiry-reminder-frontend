import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  onClick,
  active = false
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      ring: 'ring-indigo-500'
    },
    emerald: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      ring: 'ring-emerald-500'
    },
    amber: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-700',
      ring: 'ring-amber-500'
    },
    orange: {
      bg: 'bg-orange-50/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
      border: 'hover:border-orange-300 dark:hover:border-orange-700',
      ring: 'ring-orange-500'
    },
    rose: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
      ring: 'ring-rose-500'
    },
    purple: {
      bg: 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-700',
      ring: 'ring-purple-500'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`glass-card p-5 relative overflow-hidden cursor-pointer select-none border transition-all ${scheme.border} ${
        active ? `ring-2 ${scheme.ring}` : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${scheme.bg}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700/20 -z-0 opacity-40 pointer-events-none" />
    </motion.div>
  );
}
