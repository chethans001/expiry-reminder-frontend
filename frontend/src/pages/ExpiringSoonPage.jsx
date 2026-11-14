import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ItemCard from '../components/items/ItemCard';
import ItemDetailsModal from '../components/items/ItemDetailsModal';
import QuickAddModal from '../components/common/QuickAddModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ShieldCheck, RefreshCw, Search } from 'lucide-react';

export default function ExpiringSoonPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const res = await productService.getItems({ status: 'soon', sort: 'expiryAsc' });
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

  const urgentItems = filteredItems.filter((i) => i.daysRemaining <= 3);
  const regularSoonItems = filteredItems.filter((i) => i.daysRemaining > 3);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <span>Upcoming Expiry Items</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Products expiring within the next 30 days ({items.length} items)
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="Search upcoming items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No upcoming expiry items!"
          description="None of your household items or medicines are expiring within the next 30 days."
          actionLabel="Add An Item"
          onAction={() => setIsQuickAddOpen(true)}
        />
      ) : (
        <div className="space-y-8">
          {/* Critical (1-3 days) */}
          {urgentItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                <h2 className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  Critical Attention Needed (Next 3 Days) - {urgentItems.length}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {urgentItems.map((item) => (
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
            </div>
          )}

          {/* Regular Expiring Soon (4-30 days) */}
          {regularSoonItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Expiring in 4 to 30 Days - {regularSoonItems.length}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {regularSoonItems.map((item) => (
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
            </div>
          )}
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
