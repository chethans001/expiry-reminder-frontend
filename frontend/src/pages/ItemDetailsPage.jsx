import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import CategoryIcon from '../components/items/CategoryIcon';
import ExpiryBadge from '../components/common/ExpiryBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDisplayDate } from '../utils/dateUtils';
import { getAssetUrl } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  Check,
  Heart,
  History,
  Layers,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const res = await productService.getItemById(id);
      if (res.success && res.item) {
        setItem(res.item);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!item) return;
    try {
      await productService.toggleFavorite(item.id);
      loadItem();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUseItem = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      await productService.useItem(item.id);
      loadItem();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      await productService.deleteItem(item.id);
      navigate('/items');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-500">Item not found or has been removed.</p>
        <Link to="/items" className="text-xs text-indigo-600 font-bold hover:underline mt-2 inline-block">
          Return to My Items
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/items"
          className="inline-flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-semibold">Back to Items</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition ${
              item.isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
          <Link
            to={`/items/edit/${item.id}`}
            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Item Overview Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {item.imageUrl ? (
            <img
              src={getAssetUrl(item.imageUrl)}
              alt={item.name}
              className="w-28 h-28 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
              <CategoryIcon
                icon={item.category?.icon || 'Tag'}
                color={item.category?.color || '#6366F1'}
                className="w-12 h-12"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {item.category?.name || 'Category'}
              </span>
              {item.brand && (
                <span className="text-xs text-slate-400 font-medium">
                  {item.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              {item.name}
            </h1>

            <div className="mt-3">
              <ExpiryBadge
                status={item.status}
                label={item.label}
                daysRemaining={item.daysRemaining}
              />
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Expiry Date</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {formatDisplayDate(item.expiryDate)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Storage Location</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-emerald-500" />
              {item.storageLocation || 'Kitchen'}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Quantity</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
              <Layers className="w-4 h-4 text-purple-500" />
              {item.quantity} {item.unit || 'pcs'}
            </span>
          </div>

          {item.purchaseDate && (
            <div>
              <span className="text-xs text-slate-400 block">Purchase Date</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 mt-1 block">
                {formatDisplayDate(item.purchaseDate)}
              </span>
            </div>
          )}

          {item.manufacturingDate && (
            <div>
              <span className="text-xs text-slate-400 block">Mfg Date</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 mt-1 block">
                {formatDisplayDate(item.manufacturingDate)}
              </span>
            </div>
          )}

          <div>
            <span className="text-xs text-slate-400 block">Usage Counter</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 mt-1 block">
              Used {item.useCount || 0} times
            </span>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 block mb-1">
              Personal Household Notes
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {item.notes}
            </p>
          </div>
        )}

        {/* Quick Log Action */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Personal Consumption Action
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track how often you consume this product
            </p>
          </div>
          <button
            onClick={handleUseItem}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Mark as Used (+1)</span>
          </button>
        </div>

        {/* Activity Logs */}
        {item.activityLogs && item.activityLogs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Item Event Log
            </h4>
            <div className="space-y-2 text-xs">
              {item.activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                  <span className="text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Move to Trash?"
        message={`"${item.name}" will be moved to Trash.`}
        confirmText="Move to Trash"
        loading={actionLoading}
      />
    </div>
  );
}
