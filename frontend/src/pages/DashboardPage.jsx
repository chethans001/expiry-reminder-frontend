import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { productService } from '../services/productService';
import StatCard from '../components/common/StatCard';
import TodayOverview from '../components/dashboard/TodayOverview';
import DistributionChart from '../components/dashboard/DistributionChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import UrgentReminders from '../components/dashboard/UrgentReminders';
import ItemDetailsModal from '../components/items/ItemDetailsModal';
import QuickAddModal from '../components/common/QuickAddModal';
import ItemCard from '../components/items/ItemCard';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShieldCheck,
  Clock,
  AlertTriangle,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboardOverview();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleFavorite = async (id) => {
    try {
      await productService.toggleFavorite(id);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUseItem = async (id) => {
    try {
      await productService.useItem(id);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      await productService.deleteItem(item.id);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your personal overview...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Message & Today's Overview */}
      <TodayOverview
        user={user}
        stats={stats}
        onQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* 2. Key Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Items"
          value={stats.totalItems || 0}
          subtitle="Household products"
          icon={Package}
          color="indigo"
          onClick={() => navigate('/items')}
        />
        <StatCard
          title="Safe Items"
          value={stats.safeItems || 0}
          subtitle="More than 30 days"
          icon={ShieldCheck}
          color="emerald"
          onClick={() => navigate('/items?status=safe')}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon || 0}
          subtitle="1 to 30 days left"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/expiring-soon')}
        />
        <StatCard
          title="Expiring Today"
          value={stats.expiringToday || 0}
          subtitle="Reaches expiry today"
          icon={AlertTriangle}
          color="orange"
          onClick={() => navigate('/items?status=today')}
        />
        <StatCard
          title="Expired Items"
          value={stats.expiredItems || 0}
          subtitle="Expiry has passed"
          icon={AlertCircle}
          color="rose"
          onClick={() => navigate('/expired')}
        />
      </div>

      {/* 3. Distribution Chart & Upcoming Reminders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UrgentReminders
          items={data?.upcomingReminders || []}
          onViewItem={(item) => setSelectedItem(item)}
        />
        <DistributionChart distribution={data?.distribution || []} />
      </div>

      {/* 4. Category Overview */}
      <CategoryBreakdown categories={data?.categoryBreakdown || []} />

      {/* 5. Recently Added Items Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Recently Added Items</span>
            </h3>
            <p className="text-xs text-slate-400">Your most recently tracked household products</p>
          </div>
          <button
            onClick={() => navigate('/items')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>View All Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!data?.recentlyAdded || data.recentlyAdded.length === 0) ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No items added yet. Click Quick Add Item to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentlyAdded.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onView={(item) => setSelectedItem(item)}
                onEdit={(item) => navigate(`/items/edit/${item.id}`)}
                onDelete={handleDeleteItem}
                onToggleFavorite={handleToggleFavorite}
                onUseItem={handleUseItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      <ItemDetailsModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={(item) => navigate(`/items/edit/${item.id}`)}
        onDelete={handleDeleteItem}
        onItemUpdated={fetchDashboardData}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onItemAdded={fetchDashboardData}
      />
    </div>
  );
}
