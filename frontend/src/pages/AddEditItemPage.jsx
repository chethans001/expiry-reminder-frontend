import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { calculateExpiry } from '../utils/dateUtils';
import ExpiryBadge from '../components/common/ExpiryBadge';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Upload,
  Calendar,
  Tag,
  MapPin,
  Save,
  Trash2,
  Heart,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

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

const COMMON_UNITS = [
  'pcs',
  'bottles',
  'packs',
  'grams',
  'kg',
  'ml',
  'liters',
  'boxes',
  'cans',
  'tablets',
  'tubes'
];

export default function AddEditItemPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('Kitchen');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadItemData();
    } else {
      // Set default expiry date 14 days from now
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setExpiryDate(d.toISOString().split('T')[0]);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.categories.length > 0) {
        setCategories(res.categories);
        if (!isEditing) {
          setCategoryId(String(res.categories[0].id));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadItemData = async () => {
    try {
      setLoading(true);
      const res = await productService.getItemById(id);
      if (res.success && res.item) {
        const item = res.item;
        setName(item.name || '');
        setBrand(item.brand || '');
        setCategoryId(String(item.categoryId));
        setQuantity(item.quantity || 1);
        setUnit(item.unit || 'pcs');
        setStorageLocation(item.storageLocation || 'Kitchen');
        setNotes(item.notes || '');
        setIsFavorite(Boolean(item.isFavorite));

        if (item.expiryDate) {
          setExpiryDate(new Date(item.expiryDate).toISOString().split('T')[0]);
        }
        if (item.purchaseDate) {
          setPurchaseDate(new Date(item.purchaseDate).toISOString().split('T')[0]);
        }
        if (item.manufacturingDate) {
          setManufacturingDate(new Date(item.manufacturingDate).toISOString().split('T')[0]);
        }
        if (item.imageUrl) {
          setImagePreview(item.imageUrl);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !expiryDate) {
      setError('Item name, category, and expiry date are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('categoryId', categoryId);
      formData.append('expiryDate', expiryDate);
      formData.append('storageLocation', storageLocation);
      formData.append('quantity', quantity);
      formData.append('unit', unit);
      if (brand) formData.append('brand', brand.trim());
      if (purchaseDate) formData.append('purchaseDate', purchaseDate);
      if (manufacturingDate) formData.append('manufacturingDate', manufacturingDate);
      if (notes) formData.append('notes', notes.trim());
      formData.append('isFavorite', isFavorite);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditing) {
        await productService.updateItem(id, formData);
      } else {
        await productService.createItem(formData);
        // Trigger celebratory confetti for adding a new item
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (e) {
          // ignore
        }
      }

      navigate('/items');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  // Live Smart Expiry Preview Calculation
  const liveExpiry = expiryDate ? calculateExpiry(expiryDate) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/items"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isEditing ? 'Edit Household Item' : 'Add New Item'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? 'Update expiry date, location, or notes'
                : 'Track food, medicines, or personal care products'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
            isFavorite
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
        {/* Section 1: Item Basic Details & Image Upload */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Image Picker */}
          <div className="w-full sm:w-44 shrink-0">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Product Image
            </label>
            <div className="relative group cursor-pointer w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 overflow-hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 transition">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Item Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                    Change Image
                  </div>
                </>
              ) : (
                <div className="text-center p-3">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1 group-hover:text-indigo-500 transition" />
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Upload photo
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">PNG, JPG, WEBP</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Name & Brand */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Whole Milk, Paracetamol, Face Wash, Greek Yogurt..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nestlé, Pfizer, Dettol, Horizon..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Expiry Date & Smart Live Preview */}
        <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
              />
            </div>

            {liveExpiry && (
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  Smart Expiry Status Preview
                </span>
                <ExpiryBadge
                  status={liveExpiry.status}
                  label={liveExpiry.label}
                  daysRemaining={liveExpiry.daysRemaining}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Quantity, Unit, Storage Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Storage Location
            </label>
            <select
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {COMMON_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Unit
            </label>
            <input
              type="text"
              list="units-list"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pcs, bottles..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <datalist id="units-list">
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Section 4: Optional Dates (Purchase & Mfg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Purchase Date (Optional)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Manufacturing Date (Optional)
            </label>
            <input
              type="date"
              value={manufacturingDate}
              onChange={(e) => setManufacturingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Section 5: Personal Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Personal Notes & Instructions (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Keep in sealed container; Take after dinner with water; Use within 3 days after opening..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            to="/items"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Item...' : isEditing ? 'Save Changes' : 'Add Item'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
