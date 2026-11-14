import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ItemCard from '../components/items/ItemCard';
import ItemRow from '../components/items/ItemRow';
import ItemDetailsModal from '../components/items/ItemDetailsModal';
import QuickAddModal from '../components/common/QuickAddModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  ArrowUpDown,
  RefreshCw,
  Tag,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

const COMMON_LOCATIONS = [
  'All',
  'Kitchen',
  'Refrigerator',
  'Freezer',
  'Bathroom',
  'Bedroom',
  'Medicine Cabinet',
  'Storage Room',
  'Pantry'
];

export default function MyItemsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(queryParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState(queryParams.get('location') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(queryParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState('expiryAsc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [search, selectedCategory, selectedLocation, selectedStatus, sortBy]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        location: selectedLocation !== 'All' ? selectedLocation : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sort: sortBy
      };
      const res = await productService.getItems(params);
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

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedLocation('All');
    setSelectedStatus('all');
    setSortBy('expiryAsc');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Household Items
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking {items.length} product(s) in your home
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
          <Link
            to="/items/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200 dark:shadow-none transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search items, brands, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Storage Location Filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Storage Locations</option>
              {COMMON_LOCATIONS.filter((l) => l !== 'All').map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Expiry Statuses</option>
              <option value="safe">Safe (More than 30d)</option>
              <option value="soon">Expiring Soon (1-30d)</option>
              <option value="today">Expiring Today</option>
              <option value="expired">Expired</option>
            </select>
            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Sort & View Mode Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="expiryAsc">Nearest Expiry Date</option>
              <option value="expiryDesc">Furthest Expiry Date</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="newest">Recently Added</option>
              <option value="frequent">Frequently Used</option>
            </select>
            {(search || selectedCategory || selectedLocation !== 'All' || selectedStatus !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-2"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No household items found"
          description="Try adjusting your search filters or add a new item to your pantry."
          actionLabel="Add Item Now"
          onAction={() => setIsQuickAddOpen(true)}
        />
      ) : viewMode === 'grid' ? (
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
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemRow
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

      {/* Item Details Modal */}
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

      {/* Confirm Move to Trash Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Move to Trash?"
        message={`"${itemToDelete?.name}" will be moved to Trash. You can easily restore it anytime.`}
        confirmText="Move to Trash"
        loading={deleting}
      />
    </div>
  );
}
