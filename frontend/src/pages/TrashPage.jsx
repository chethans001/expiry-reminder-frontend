import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  ArchiveRestore
} from 'lucide-react';

export default function TrashPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTrashItems();
  }, []);

  const loadTrashItems = async () => {
    try {
      setLoading(true);
      const res = await productService.getItems({ trash: 'true' });
      if (res.success) setItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setActionLoading(true);
      await productService.restoreItem(id);
      loadTrashItems();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      await productService.permanentDeleteItem(itemToDelete.id);
      setItemToDelete(null);
      loadTrashItems();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-slate-500" />
          <span>Trash & Restore</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Items moved to Trash can be restored or permanently removed ({items.length} items)
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ArchiveRestore}
          title="Trash is empty"
          description="Deleted household items will appear here if you ever need to restore them."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Category: {item.category?.name || 'General'}</span>
                  <span>•</span>
                  <span>Location: {item.storageLocation || 'Kitchen'}</span>
                  <span>•</span>
                  <span>Expiry: {formatDisplayDate(item.expiryDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRestore(item.id)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => setItemToDelete(item)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Forever</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Permanent Delete Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Item?"
        message={`Are you sure you want to permanently delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Permanently Delete"
        danger={true}
        loading={actionLoading}
      />
    </div>
  );
}
