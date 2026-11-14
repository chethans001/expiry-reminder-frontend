import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ItemCard from '../components/items/ItemCard';
import ItemDetailsModal from '../components/items/ItemDetailsModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldCheck, RefreshCw, Trash2, Search } from 'lucide-react';

export default function ExpiredItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await productService.getItems({ status: 'expired', sort: 'expiryDesc' });
      if (res.success) setItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await productService.toggleFavorite(id);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUseItem = async (id) => {
    try {
      await productService.useItem(id);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await productService.deleteItem(itemToDelete.id);
      setItemToDelete(null);
      loadItems();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter((i) =>
    search ? i.name.toLowerCase().includes(search.toLowerCase()) || (i.brand && i.brand.toLowerCase().includes(search.toLowerCase())) : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-rose-500" />
            <span>Expired Items</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Products whose expiry date has passed ({items.length} items)
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="Search expired items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Safety Notice Banner */}
      {items.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Safety Advisory:</strong> For medicines, dairy products, and infant care, do not consume or use items past their expiry date. Check packaging instructions or safely discard them.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No expired products!"
          description="Great job! None of your tracked household groceries or medicines are expired."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onView={(item) => setSelectedItem(item)}
              onEdit={(item) => navigate(`/items/edit/${item.id}`)}
              onDelete={(item) => setItemToDelete(item)}
              onToggleFavorite={handleToggleFavorite}
              onUseItem={handleUseItem}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <ItemDetailsModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={(item) => navigate(`/items/edit/${item.id}`)}
        onDelete={(item) => setItemToDelete(item)}
        onItemUpdated={loadItems}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Move Expired Item to Trash?"
        message={`"${itemToDelete?.name}" will be moved to Trash.`}
        confirmText="Move to Trash"
        loading={deleting}
      />
    </div>
  );
}
