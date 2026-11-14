import React from 'react';
import { motion } from 'framer-motion';
import ExpiryBadge from '../common/ExpiryBadge';
import CategoryIcon from './CategoryIcon';
import { formatDisplayDate } from '../../utils/dateUtils';
import { getAssetUrl } from '../../services/api';
import {
  Heart,
  Calendar,
  MapPin,
  MoreVertical,
  Check,
  Edit2,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';

export default function ItemCard({
  item,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUseItem
}) {
  const isExpiringToday = item.daysRemaining === 0;
  const isExpired = item.daysRemaining < 0;
  const isUrgent = item.daysRemaining > 0 && item.daysRemaining <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className={`glass-card p-4 flex flex-col justify-between relative overflow-hidden group border ${
        isExpiringToday
          ? 'ring-2 ring-amber-400/80 border-amber-300 dark:border-amber-700'
          : isExpired
          ? 'border-rose-200 dark:border-rose-900/60'
          : isUrgent
          ? 'border-orange-200 dark:border-orange-900/60'
          : 'border-slate-200/80 dark:border-slate-700/60'
      }`}
    >
      {/* Top Bar: Category Pill & Favorite Heart */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <CategoryIcon
            icon={item.category?.icon || 'Tag'}
            color={item.category?.color || '#6366F1'}
            className="w-4 h-4"
          />
          <div className="truncate">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">
              {item.category?.name || 'General'}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={`p-1.5 rounded-full transition ${
            item.isFavorite
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
              : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
          }`}
          title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main Item Visual & Name */}
      <div className="cursor-pointer" onClick={() => onView(item)}>
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={getAssetUrl(item.imageUrl)}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-700 shrink-0"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${item.category?.color || '#6366F1'}15`,
                color: item.category?.color || '#6366F1'
              }}
            >
              <CategoryIcon
                icon={item.category?.icon || 'Tag'}
                color={item.category?.color || '#6366F1'}
                className="w-6 h-6"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {item.brand && (
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate block">
                {item.brand}
              </span>
            )}
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate hover:text-indigo-600 transition">
              {item.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{item.storageLocation || 'Kitchen'}</span>
            </div>
          </div>
        </div>

        {/* Expiry Status & Countdown */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Expires On
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatDisplayDate(item.expiryDate)}
            </span>
          </div>

          <ExpiryBadge
            status={item.status}
            label={item.label}
            daysRemaining={item.daysRemaining}
            size="sm"
          />
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="mt-3 pt-2.5 flex items-center justify-between gap-1 border-t border-slate-50 dark:border-slate-800/80">
        <span className="text-xs text-slate-400 font-medium">
          Qty: {item.quantity} {item.unit || 'pcs'}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUseItem(item.id)}
            title="Mark as used (+1)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onView(item)}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(item)}
            title="Edit Item"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            title="Move to Trash"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
