/**
 * API configuration — DigitalOcean VPS + MongoDB Atlas backend.
 */

const rawApiUrl = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  ''
).trim();

function defaultProdApiBase() {
  if (typeof window === 'undefined') return '';
  const { protocol, hostname } = window.location;
  if (hostname === '159.65.138.9') {
    return 'http://159.65.138.9:8000';
  }
  return `${protocol}//${hostname}:8000`;
}

export const API_BASE_URL = (() => {
  if (rawApiUrl.length > 0) {
    return rawApiUrl.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000';
  }
  return defaultProdApiBase() || 'http://159.65.138.9:8000';
})();

/** Media / avatars — served from FastAPI `/static` (uploads folder). */
export function getMediaPublicBase() {
  return `${API_BASE_URL}/static`;
}

/** @deprecated Use getMediaPublicBase — kept for imports during migration */
export function getSupabaseMediaPublicBase() {
  return getMediaPublicBase();
}

export const SUPABASE_CONFIGURED = false;
export const SUPABASE_URL = '';

const rawPublicAppUrl = (
  process.env.REACT_APP_PUBLIC_APP_URL ||
  process.env.REACT_APP_CARD_APP_URL ||
  ''
).trim();

/**
 * Origin where the React app is served (QR codes must point here, NOT the API :8000 port).
 */
export function getPublicCardAppOrigin() {
  if (rawPublicAppUrl.length > 0) {
    return rawPublicAppUrl.replace(/\/$/, '');
  }
  if (typeof window === 'undefined') {
    return '';
  }
  const { protocol, hostname, port } = window.location;
  if (hostname === '159.65.138.9') {
    return port === '8000' ? 'http://159.65.138.9' : `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  if (port && port !== '80' && port !== '443') {
    return `${protocol}//${hostname}:${port}`;
  }
  return `${protocol}//${hostname}`;
}
