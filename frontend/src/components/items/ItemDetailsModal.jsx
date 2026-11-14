import React, { useState } from 'react';
import Modal from '../common/Modal';
import ExpiryBadge from '../common/ExpiryBadge';
import CategoryIcon from './CategoryIcon';
import { formatDisplayDate } from '../../utils/dateUtils';
import { productService } from '../../services/productService';
import {
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  Trash2,
  Edit,
  Heart,
  History,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ItemDetailsModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onDelete,
  onItemUpdated
}) {
  const [using, setUsing] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  if (!item) return null;

  const handleUseItem = async () => {
    try {
      setUsing(true);
      await productService.useItem(item.id);
      if (onItemUpdated) onItemUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setUsing(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setFavoriting(true);
      await productService.toggleFavorite(item.id);
      if (onItemUpdated) onItemUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setFavoriting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Top Header with Image / Icon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
            />
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <CategoryIcon
                icon={item.category?.icon || 'Tag'}
                color={item.category?.color || '#6366F1'}
                className="w-10 h-10"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {item.category?.name || 'Category'}
              </span>
              {item.brand && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {item.brand}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {item.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <ExpiryBadge
                status={item.status}
                label={item.label}
                daysRemaining={item.daysRemaining}
              />
              <button
                onClick={handleToggleFavorite}
                disabled={favoriting}
                className={`p-1.5 rounded-full border transition ${
                  item.isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900'
                    : 'border-slate-200 text-slate-400 hover:text-slate-600 dark:border-slate-700'
                }`}
                title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Essential Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 text-sm">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Expiry Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {formatDisplayDate(item.expiryDate)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Location</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              {item.storageLocation || 'Kitchen'}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Quantity</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Layers className="w-4 h-4 text-purple-500" />
              {item.quantity} {item.unit || 'pcs'}
            </span>
          </div>

          {item.purchaseDate && (
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block">Purchase Date</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                {formatDisplayDate(item.purchaseDate)}
              </span>
            </div>
          )}

          {item.manufacturingDate && (
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block">Mfg Date</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                {formatDisplayDate(item.manufacturingDate)}
              </span>
            </div>
          )}

          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Used Count</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
              {item.useCount || 0} times
            </span>
          </div>
        </div>

        {/* Personal Notes */}
        {item.notes && (
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 block mb-1">
              Personal Notes
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {item.notes}
            </p>
          </div>
        )}

        {/* Mark Used / Consumed Quick Action */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Personal Consumption Log
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used {item.useCount || 0} times so far.
            </p>
          </div>
          <button
            onClick={handleUseItem}
            disabled={using}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {using ? 'Saving...' : 'Mark as Used (+1)'}
          </button>
        </div>

        {/* Activity History */}
        {item.activityLogs && item.activityLogs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Recent Item History
            </h4>
            <div className="space-y-2 text-xs">
              {item.activityLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                  <span className="text-slate-400 dark:text-slate-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => {
              onClose();
              if (onDelete) onDelete(item);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
            Move to Trash
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onEdit) onEdit(item);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition"
            >
              <Edit className="w-4 h-4" />
              Edit Item
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
