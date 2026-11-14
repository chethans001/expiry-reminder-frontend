import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ExpiryBadge({ status = 'Safe', label, daysRemaining, size = 'md' }) {
  let config = {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    icon: ShieldCheck,
    text: 'Safe'
  };

  if (status === 'Expired' || daysRemaining < 0) {
    config = {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
      icon: AlertCircle,
      text: 'Expired'
    };
  } else if (status === 'Expiring Today' || daysRemaining === 0) {
    config = {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      text: 'Expires Today'
    };
  } else if (status === 'Expiring Soon' || (daysRemaining > 0 && daysRemaining <= 30)) {
    const isCritical = daysRemaining <= 3;
    config = {
      bg: isCritical
        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
      dot: isCritical ? 'bg-orange-500' : 'bg-indigo-500',
      icon: Clock,
      text: isCritical ? 'Critical (<= 3d)' : 'Expiring Soon'
    };
  }

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${config.bg} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{label || config.text}</span>
    </span>
  );
}
