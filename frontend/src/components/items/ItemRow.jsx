import React from 'react';
import ExpiryBadge from '../common/ExpiryBadge';
import CategoryIcon from './CategoryIcon';
import { formatDisplayDate } from '../../utils/dateUtils';
import { Heart, MapPin, Edit2, Trash2, Eye, Check } from 'lucide-react';

export default function ItemRow({
  item,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUseItem
}) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 transition gap-4">
      {/* Category Icon & Name */}
      <div className="flex items-center gap-3 min-w-[200px] flex-1 cursor-pointer" onClick={() => onView(item)}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={`p-1 rounded-full ${
            item.isFavorite ? 'text-rose-500' : 'text-slate-300 hover:text-slate-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
        </button>

        <CategoryIcon
          icon={item.category?.icon || 'Tag'}
          color={item.category?.color || '#6366F1'}
          className="w-4 h-4"
        />

        <div className="truncate">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {item.name}
          </h4>
          {item.brand && (
            <span className="text-xs text-slate-400 truncate block">{item.brand}</span>
          )}
        </div>
      </div>

      {/* Storage Location */}
      <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 w-28 truncate">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{item.storageLocation || 'Kitchen'}</span>
      </div>

      {/* Quantity */}
      <div className="hidden sm:block text-xs text-slate-600 dark:text-slate-300 w-20 text-center font-medium">
        {item.quantity} {item.unit || 'pcs'}
      </div>

      {/* Expiry Date */}
      <div className="text-xs text-slate-600 dark:text-slate-300 w-28 text-center font-medium">
        {formatDisplayDate(item.expiryDate)}
      </div>

      {/* Expiry Badge */}
      <div className="w-36 text-right">
        <ExpiryBadge
          status={item.status}
          label={item.label}
          daysRemaining={item.daysRemaining}
          size="sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onUseItem(item.id)}
          title="Mark as used (+1)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => onView(item)}
          title="View Details"
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(item)}
          title="Edit"
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          title="Move to Trash"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
