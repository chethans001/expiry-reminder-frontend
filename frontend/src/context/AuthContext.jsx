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
    const saved = localStorage.getItem('expiry_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('expiry_token'));
  const [loading, setLoading] = useState(true);

  // Load existing session on mount
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('expiry_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Failed to authenticate session:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  // Listen for Supabase OAuth redirects (Google Login)
  useEffect(() => {
    const unsubscribe = onSupabaseAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
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
            const syncRes = await authService.syncSupabaseUser({
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

              // Clean URL hash after OAuth redirect
              if (window.location.hash.includes('access_token')) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }
          } catch (syncErr) {
            console.error('Failed to sync Supabase user with backend:', syncErr);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
