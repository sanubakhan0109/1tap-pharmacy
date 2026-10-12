import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables
const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
  '';

const rawKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Clean and validate format
const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim().replace(/\/+$/, '') : '';
let supabaseAnonKey = typeof rawKey === 'string' ? rawKey.trim() : '';

// SECURITY: Frontend must only ever use the publishable (anon) key.
// A service-role / secret key bypasses Row Level Security and must never
// be bundled into client code. Refuse to configure if one is detected.
const looksLikeServiceRoleKey =
  supabaseAnonKey.startsWith('sb_secret_') ||
  supabaseAnonKey.includes('service_role');
if (looksLikeServiceRoleKey) {
  console.error(
    '[1TAP Supabase] Refusing to initialise: a service-role key was provided where only the publishable key belongs. Admin checks use the signed-in user UUID + public.admin_users with RLS.'
  );
  supabaseAnonKey = '';
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ [1TAP Supabase] Live credentials not yet set or invalid in .env / .env.local. Orders will be simulated locally for testing if database is unreachable.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
