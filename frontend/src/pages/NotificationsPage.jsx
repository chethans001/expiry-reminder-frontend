import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Play,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [triggering, setTriggering] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  const handleTriggerCheck = async () => {
    try {
      setTriggering(true);
      await notificationService.triggerCheck();
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead : true
  );

  const getNotifIcon = (type) => {
    switch (type) {
      case 'EXPIRED':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'EXPIRING_TODAY':
        return <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'EXPIRING_SOON':
      default:
        return <Clock className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" />
            <span>My Expiry Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time reminders and scheduled household expiry alerts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTriggerCheck}
            disabled={triggering}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
            title="Check all items now against your alert schedules"
          >
            <Play className={`w-3.5 h-3.5 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Checking...' : 'Check Expiries Now'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filter === 'all'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filter === 'unread'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description="You are completely up to date. You will be alerted when products near their expiry dates."
        />
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-850 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getNotifIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 text-xs font-semibold"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={async () => {
          await clearAll();
          setIsClearAllOpen(false);
        }}
        title="Clear All Notifications?"
        message="This will delete your notification history."
        confirmText="Clear All"
      />
    </div>
  );
}
