import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import {
  signInWithGoogle,
  signOutSupabase,
  onSupabaseAuthStateChange,
  isSupabaseConfigured,
  saveSupabaseCredentials,
  getSupabaseCredentials
} from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('expiry_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('expiry_token'));

  // Detect whether an OAuth return is present in URL hash or query params
  const hasOAuthCallback = typeof window !== 'undefined' && (
    window.location.hash.includes('access_token=') ||
    window.location.hash.includes('error=') ||
    window.location.search.includes('code=')
  );

  const [loading, setLoading] = useState(true);

  // Load existing session on mount (only when not processing an incoming OAuth callback)
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (hasOAuthCallback) {
        // Let the Supabase auth listener handle OAuth token exchange and backend sync
        return;
      }

      if (token) {
        try {
          const res = await authService.getProfile();
          if (isMounted && res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('expiry_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Failed to authenticate session:', err);
          if (isMounted) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('expiry_token');
            localStorage.removeItem('expiry_user');
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token, hasOAuthCallback]);

  // Listen for Supabase OAuth redirects (Google Login)
  useEffect(() => {
    let timeoutId = null;
    if (hasOAuthCallback) {
      // Safety timeout in case OAuth is cancelled or network fails
      timeoutId = setTimeout(() => {
        setLoading(false);
      }, 7000);
    }

    const unsubscribe = onSupabaseAuthStateChange(async (event, session) => {
      if (session?.user && session?.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        const supaUser = session.user;
        const email = supaUser.email;
        const name =
          supaUser.user_metadata?.full_name ||
          supaUser.user_metadata?.name ||
          supaUser.user_metadata?.user_name ||
          email?.split('@')[0];
        const avatar =
          supaUser.user_metadata?.avatar_url ||
          supaUser.user_metadata?.picture ||
          null;

        if (email) {
          try {
            setLoading(true);
            const syncRes = await authService.syncSupabaseUser({
              supabaseToken: session.access_token,
              email,
              name,
              avatar,
              supabaseId: supaUser.id
            });

            if (syncRes.success && syncRes.token) {
              setToken(syncRes.token);
              setUser(syncRes.user);
              localStorage.setItem('expiry_token', syncRes.token);
              localStorage.setItem('expiry_user', JSON.stringify(syncRes.user));

              // Clean URL hash after successful OAuth redirect
              if (window.location.hash.includes('access_token')) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }
          } catch (syncErr) {
            console.error('Failed to sync Supabase user with backend:', syncErr);
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
            setLoading(false);
          }
        }
      } else if (hasOAuthCallback && event !== 'INITIAL_SESSION') {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [hasOAuthCallback]);

  const loginWithGoogle = async () => {
    return await signInWithGoogle();
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('expiry_token', res.token);
      localStorage.setItem('expiry_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('expiry_token', res.token);
      localStorage.setItem('expiry_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('expiry_token');
    localStorage.removeItem('expiry_user');
    await signOutSupabase();
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('expiry_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        loginWithGoogle,
        isSupabaseConfigured,
        saveSupabaseCredentials,
        getSupabaseCredentials,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
