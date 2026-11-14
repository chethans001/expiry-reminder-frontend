import { createClient } from '@supabase/supabase-js';

function cleanVal(v) {
  if (!v || typeof v !== 'string') return '';
  return v.trim().replace(/^["']|["']$/g, '').trim();
}

// Retrieve Supabase URL & Anon Key from Vite build env or localStorage override
// Public/anon keys are safe in browser code. Never place secret/service-role keys here.
export function getSupabaseCredentials() {
  const envUrl = cleanVal(import.meta.env.VITE_SUPABASE_URL);
  const envKey = cleanVal(
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  const localUrl = typeof window !== 'undefined' ? cleanVal(localStorage.getItem('supabase_url')) : '';
  const localKey = typeof window !== 'undefined' ? cleanVal(localStorage.getItem('supabase_anon_key')) : '';

  const url = envUrl || localUrl || '';
  const anonKey = envKey || localKey || '';

  return { url, anonKey };
}

let supabaseInstance = null;
let lastUsedCreds = { url: '', anonKey: '' };

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || !isSupabaseConfigured()) {
    return null;
  }

  if (supabaseInstance && lastUsedCreds.url === url && lastUsedCreds.anonKey === anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    });
    lastUsedCreds = { url, anonKey };
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }

  return supabaseInstance;
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    url.length > 10 &&
    anonKey.length > 10 &&
    (url.startsWith('https://') || url.startsWith('http://'))
  );
}

export function saveSupabaseCredentials(url, anonKey) {
  if (url && anonKey) {
    localStorage.setItem('supabase_url', cleanVal(url));
    localStorage.setItem('supabase_anon_key', cleanVal(anonKey));
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

  // Derive the target frontend app origin (Vercel production URL or localhost)
  const appOrigin = cleanVal(import.meta.env.VITE_APP_URL) || (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanOrigin = appOrigin.replace(/\/+$/, '');
  const redirectTo = `${cleanOrigin}/dashboard`;

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
