import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL & Anon Key from Vite env or localStorage override
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null;

  const url = (envUrl && envUrl.trim()) || (localUrl && localUrl.trim()) || '';
  const anonKey = (envKey && envKey.trim()) || (localKey && localKey.trim()) || '';

  return { url, anonKey };
}

let supabaseInstance = null;

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();

  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export function saveSupabaseCredentials(url, anonKey) {
  if (url && anonKey) {
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_anon_key', anonKey.trim());
    supabaseInstance = null; // Re-instantiate with new keys
    return getSupabaseClient();
  }
}

// 1. Sign in with Google OAuth via Supabase
export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const redirectTo = `${window.location.origin}/dashboard`;

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) throw error;
  return data;
}

// 2. Sign out of Supabase
export async function signOutSupabase() {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Supabase signout warning:', err);
    }
  }
}

// 3. Get Current Supabase Session
export async function getSupabaseSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { session } } = await client.auth.getSession();
  return session;
}

// 4. Listen for Auth State Changes
export function onSupabaseAuthStateChange(callback) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription?.unsubscribe();
  };
}

export const supabase = getSupabaseClient();
