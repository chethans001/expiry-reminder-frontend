import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Plus, Calendar, Tag, MapPin, Sparkles } from 'lucide-react';

const COMMON_LOCATIONS = [
  'Kitchen',
  'Refrigerator',
  'Freezer',
  'Bathroom',
  'Bedroom',
  'Medicine Cabinet',
  'Storage Room',
  'Pantry'
];

export default function QuickAddModal({ isOpen, onClose, onItemAdded }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    expiryDate: '',
    storageLocation: 'Kitchen',
    quantity: 1,
    unit: 'pcs',
    brand: '',
    notes: '',
    isFavorite: false
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Set default expiry date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      const yyyy = defaultDate.getFullYear();
      const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const dd = String(defaultDate.getDate()).padStart(2, '0');

      setFormData({
        name: '',
        categoryId: '',
        expiryDate: `${yyyy}-${mm}-${dd}`,
        storageLocation: 'Kitchen',
        quantity: 1,
        unit: 'pcs',
        brand: '',
        notes: '',
        isFavorite: false
      });
      setError('');
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res.success && res.categories.length > 0) {
        setCategories(res.categories);
        setFormData((prev) => ({
          ...prev,
          categoryId: prev.categoryId || String(res.categories[0].id)
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId || !formData.expiryDate) {
      setError('Please provide item name, category, and expiry date.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('categoryId', formData.categoryId);
      data.append('expiryDate', formData.expiryDate);
      data.append('storageLocation', formData.storageLocation);
      data.append('quantity', formData.quantity);
      data.append('unit', formData.unit);
      if (formData.brand) data.append('brand', formData.brand);
      if (formData.notes) data.append('notes', formData.notes);
      data.append('isFavorite', formData.isFavorite);

      await productService.createItem(data);
      if (onItemAdded) onItemAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Item" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
            {error}
          </div>
        )}

        {/* Item Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Item Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Milk, Face Cream, Rice..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Category & Expiry Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <div className="relative">
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Expiry Date *
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Storage Location & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Storage Location
            </label>
            <select
              value={formData.storageLocation}
              onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {COMMON_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Qty
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <input
                type="text"
                placeholder="pcs"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Brand (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Brand (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Nestlé, Nivea, Tylenol..."
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-200 dark:shadow-none transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
