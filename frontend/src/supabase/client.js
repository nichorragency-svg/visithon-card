import { createClient } from '@supabase/supabase-js';

const url = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const anon = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

/**
 * Singleton Supabase client. Auth/session + DB + Storage for Visithon card app.
 */
export const supabase =
  url && anon
    ? createClient(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function ensureSupabase() {
  if (!supabase) {
    throw new Error(
      'Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. Add them in Vercel env and rebuild.',
    );
  }
  return supabase;
}
