import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ExpiryCalendarView from '../components/calendar/ExpiryCalendarView';
import ItemDetailsModal from '../components/items/ItemDetailsModal';
import QuickAddModal from '../components/common/QuickAddModal';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, RefreshCw, Plus } from 'lucide-react';

export default function CalendarPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await productService.getItems();
      if (res.success) setItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            <span>Expiry Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual monthly roadmap of upcoming household expiry dates
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
      ) : (
        <ExpiryCalendarView
          items={items}
          onViewItem={(item) => setSelectedItem(item)}
        />
      )}

      {/* Item Details Modal */}
      <ItemDetailsModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={(item) => navigate(`/items/edit/${item.id}`)}
        onItemUpdated={loadItems}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onItemAdded={loadItems}
      />
    </div>
  );
}
