const rawLegacyApi = (process.env.REACT_APP_API_BASE_URL || '').trim();
const sbUrlRaw = (process.env.REACT_APP_SUPABASE_URL || '').trim();

/**
 * Legacy FastAPI base URL — only used by the optional Admin Panel (`/admin/*`).
 * Leave empty when you use Supabase for the Visithon card app.
 */
export const API_BASE_URL = (() => {
  if (rawLegacyApi.length > 0) return rawLegacyApi.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'development') return 'http://127.0.0.1:8000';
  return '';
})();

export const SUPABASE_URL = sbUrlRaw.replace(/\/$/, '');

/** True when card app Supabase wiring is usable. */
export const SUPABASE_CONFIGURED = !!(sbUrlRaw && (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim());

/**
 * Absolute base for Storage bucket `media` — public CDN URL.
 */
export function getSupabaseMediaPublicBase() {
  if (!SUPABASE_URL) return '';
  return `${SUPABASE_URL}/storage/v1/object/public/media`;
}
