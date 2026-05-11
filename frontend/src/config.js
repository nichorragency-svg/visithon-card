/** Admin FastAPI — Vercel pe kabhi `REACT_APP_API_URL` naam se bhi save hota hai. */
const rawLegacyApi = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  ''
).trim();
const sbUrlRaw = (process.env.REACT_APP_SUPABASE_URL || '').trim();

/**
 * Legacy FastAPI base URL — only used by the optional Admin Panel (`/admin/*`).
 * Set `REACT_APP_API_BASE_URL` or `REACT_APP_API_URL` (same value). Not the Vercel frontend URL.
 */
export const API_BASE_URL = (() => {
  // Agar legacy API di gayi hy toh wo use kare
  if (typeof rawLegacyApi !== 'undefined' && rawLegacyApi.length > 0) {
    return rawLegacyApi.replace(/\/$/, '');
  }

  // Agar hum local laptop par kaam kar rahe hain
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000';
  }

  // Live Server (Production) ke liye aapka DigitalOcean IP
  // Agar aap domain lagayenge toh bas yahan IP ki jagah domain likh dena
  return 'http://159.65.138.9:8000';
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
