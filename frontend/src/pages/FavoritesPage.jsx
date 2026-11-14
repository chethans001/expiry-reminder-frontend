import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ItemCard from '../components/items/ItemCard';
import ItemDetailsModal from '../components/items/ItemDetailsModal';
import QuickAddModal from '../components/common/QuickAddModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { Heart, RefreshCw, Plus } from 'lucide-react';

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await productService.getItems({ favorite: 'true', sort: 'expiryAsc' });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>Favorite Household Items</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Everyday essentials you use most frequently ({items.length} items)
          </p>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200 dark:shadow-none transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites added yet"
          description="Click the heart icon on any household item or medicine to pin it here for quick access."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
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

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onItemAdded={loadItems}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Move to Trash?"
        message={`"${itemToDelete?.name}" will be moved to Trash.`}
        confirmText="Move to Trash"
        loading={deleting}
      />
    </div>
  );
}
