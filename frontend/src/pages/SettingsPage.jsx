import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  Bell,
  Mail,
  Moon,
  Sun,
  CheckCircle2,
  Save,
  Shield,
  Clock,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [pref, setPref] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    notify30Days: true,
    notify15Days: true,
    notify7Days: true,
    notify3Days: true,
    notify1Day: true,
    notifyOnExpiry: true,
    notifyAfterExpiry: true
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getPreferences();
      if (res.success && res.preferences) {
        setPref(res.preferences);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPref((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await notificationService.updatePreferences(pref);
      setMessage('Reminder preferences saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-500" />
          <span>Settings & Reminder Preferences</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure how and when you receive expiry notifications
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Theme Preference Card */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Application Theme</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Currently using {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          Switch to {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Reminder Intervals Form */}
      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Reminder Intervals</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select the countdown intervals at which you want notifications generated
          </p>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {/* 30 Days */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                30 Days Before Expiry
              </span>
              <span className="text-[11px] text-slate-400">
                Early notification for longer shelf-life items
              </span>
            </div>
            <input
              type="checkbox"
              checked={pref.notify30Days}
              onChange={() => handleToggle('notify30Days')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* 15 Days */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                15 Days Before Expiry
              </span>
              <span className="text-[11px] text-slate-400">
                Two-week advance warning
              </span>
            </div>
            <input
              type="checkbox"
              checked={pref.notify15Days}
              onChange={() => handleToggle('notify15Days')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* 7 Days */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                7 Days Before Expiry (1 Week)
              </span>
              <span className="text-[11px] text-slate-400">
                Standard grocery reminder
              </span>
            </div>
            <input
              type="checkbox"
              checked={pref.notify7Days}
              onChange={() => handleToggle('notify7Days')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* 3 Days */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                3 Days Before Expiry
              </span>
              <span className="text-[11px] text-slate-400">
                Urgent reminder for fresh food & dairy
              </span>
            </div>
            <input
              type="checkbox"
              checked={pref.notify3Days}
              onChange={() => handleToggle('notify3Days')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* 1 Day */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                1 Day Before Expiry (Tomorrow)
              </span>
              <span className="text-[11px] text-slate-400">
                Final reminder to use or consume item
              </span>
            </div>
            <input
              type="checkbox"
              checked={pref.notify1Day}
              onChange={() => handleToggle('notify1Day')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* On Expiry Date */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                On Expiry Date
              </span>
              <span className="text-[11px] text-slate-400">
                Expires today alert
              </span>
            </div>
            <input
              type="checkbox"
              checked={pref.notifyOnExpiry}
              onChange={() => handleToggle('notifyOnExpiry')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* After Expiry */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                After Expiry Alert
              </span>
              <span className="text-[11px] text-slate-400">
                Alerts when item has passed expiry date
              </span>
            </div>
            <input
              type="checkbox"
              checked={pref.notifyAfterExpiry}
              onChange={() => handleToggle('notifyAfterExpiry')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Delivery Channels */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Notification Channels
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  In-App Notification Bell
                </span>
                <span className="text-[11px] text-slate-400">
                  Show badges and updates in your top bar
                </span>
              </div>
              <input
                type="checkbox"
                checked={pref.inAppNotifications}
                onChange={() => handleToggle('inAppNotifications')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Email Reminders (Nodemailer)
                </span>
                <span className="text-[11px] text-slate-400">
                  Receive batched digest email alerts
                </span>
              </div>
              <input
                type="checkbox"
                checked={pref.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Preferences...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
