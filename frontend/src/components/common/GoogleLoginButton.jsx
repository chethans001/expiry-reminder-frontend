import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SupabaseSetupModal from './SupabaseSetupModal';

export default function GoogleLoginButton({ label = 'Continue with Google', className = '' }) {
  const { loginWithGoogle, isSupabaseConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    try {
      setError('');
      if (!isSupabaseConfigured()) {
        setShowSetupModal(true);
        return;
      }

      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
      if (err.message === 'SUPABASE_NOT_CONFIGURED') {
        setShowSetupModal(true);
      } else {
        setError(err.message || 'Failed to initialize Google login. Check your Supabase Google provider setup.');
      }
      setLoading(false);
    }
  };

  const handleSetupSuccess = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to start Google sign in.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition flex items-center justify-center gap-2.5 hover:border-slate-300 dark:hover:border-slate-600 ${className}`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{loading ? 'Connecting to Google...' : label}</span>
        </button>

        {error && (
          <p className="text-[11px] text-rose-500 mt-1.5 text-center leading-tight">
            {error}
          </p>
        )}
      </div>

      <SupabaseSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSuccess={handleSetupSuccess}
      />
    </>
  );
}
