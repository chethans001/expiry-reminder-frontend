import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { Shield, Key, Globe, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export default function SupabaseSetupModal({ isOpen, onClose, onSuccess }) {
  const { getSupabaseCredentials, saveSupabaseCredentials } = useAuth();
  const current = getSupabaseCredentials();

  const [url, setUrl] = useState(current.url || '');
  const [anonKey, setAnonKey] = useState(current.anonKey || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setError('Please provide both your Supabase Project URL and Anon Key.');
      return;
    }

    if (!url.trim().startsWith('http')) {
      setError('Project URL must start with https://');
      return;
    }

    try {
      saveSupabaseCredentials(url.trim(), anonKey.trim());
      setSuccess(true);
      setError('');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error(err);
      setError('Failed to save Supabase credentials.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Supabase for Google Login" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>One-Time Supabase Configuration</span>
          </p>
          <p>
            To enable real Google OAuth login, provide your Supabase Project URL and Public Anon Key. You can find these in your Supabase Dashboard under <strong>Project Settings &gt; API</strong>.
          </p>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold underline mt-1.5"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Supabase connected successfully! Connecting to Google...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Supabase Project URL
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Project API Anon Key (public)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            <strong>Google OAuth Note:</strong> Ensure you added your domain/redirect URL (<code>{window.location.origin}/dashboard</code>) under <strong>Authentication &gt; URL Configuration</strong> in Supabase, and enabled the Google provider.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 dark:shadow-none transition"
            >
              Save &amp; Continue with Google
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
