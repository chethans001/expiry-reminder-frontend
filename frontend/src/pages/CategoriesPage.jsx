import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import CategoryIcon from '../components/items/CategoryIcon';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Tag, Trash2, Edit2, FolderTree, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AVAILABLE_ICONS = [
  'Utensils',
  'Milk',
  'Apple',
  'Coffee',
  'Pill',
  'Sparkles',
  'Heart',
  'Smile',
  'Home',
  'Sparkle',
  'Baby',
  'Package',
  'Tag',
  'Folder'
];

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#EF4444', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#64748B'  // Slate
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catColor, setCatColor] = useState('#6366F1');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete dialog
  const [catToDelete, setCatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res.success) setCategories(res.categories || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatIcon('Tag');
    setCatColor('#6366F1');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatIcon(cat.icon || 'Tag');
    setCatColor(cat.color || '#6366F1');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setModalError('Category name is required.');
      return;
    }

    try {
      setModalSaving(true);
      setModalError('');

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: catName.trim(),
          icon: catIcon,
          color: catColor
        });
      } else {
        await categoryService.createCategory({
          name: catName.trim(),
          icon: catIcon,
          color: catColor
        });
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!catToDelete) return;
    try {
      setDeleting(true);
      await categoryService.deleteCategory(catToDelete.id);
      setCatToDelete(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-500" />
            <span>My Product Categories</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize household items by category and custom tags
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200 dark:shadow-none transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card p-5 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <CategoryIcon icon={cat.icon} color={cat.color} className="w-6 h-6" />

                <div className="flex items-center gap-1">
                  {cat.isDefault ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Default
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCatToDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {cat.itemCount || 0} {(cat.itemCount === 1) ? 'item' : 'items'} tracked
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  to={`/items?category=${cat.id}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  View items in this category →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Custom Category'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          {modalError && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Pet Food, Snacks, Spices..."
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-7 gap-2">
              {AVAILABLE_ICONS.map((iconName) => (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => setCatIcon(iconName)}
                  className={`p-2 rounded-xl flex items-center justify-center border transition ${
                    catIcon === iconName
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-400/40'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CategoryIcon icon={iconName} color={catColor} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setCatColor(col)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    catColor === col ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              {modalSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!catToDelete}
        onClose={() => setCatToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Custom Category?"
        message={`Are you sure you want to delete category "${catToDelete?.name}"?`}
        confirmText="Delete Category"
        loading={deleting}
      />
    </div>
  );
}
