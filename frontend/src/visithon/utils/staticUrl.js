import { API_BASE_URL, getMediaPublicBase } from '../../config';

/**
 * Resolve backend-relative paths to full URLs (`/static/...` on API host).
 */
export function staticUrl(relativePath) {
  if (!relativePath) return '';
  const s = String(relativePath).trim();
  if (/^https?:\/\//i.test(s)) return s;

  const mediaBase = getMediaPublicBase().replace(/\/$/, '');
  let key = s.replace(/^\/+/, '');

  if (key.startsWith('static/')) {
    key = key.slice('static/'.length);
  }

  if (!mediaBase) {
    return s;
  }

  return `${mediaBase}/${key}`.replace(/([^:])\/{2,}/g, '$1/');
}

export function uploadsUrl(relativePath) {
  if (!relativePath) return '';
  const s = String(relativePath).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = String(API_BASE_URL || '').replace(/\/$/, '');
  const key = s.replace(/^\/+/, '').replace(/^uploads\//, '');
  return `${base}/static/${key}`;
}
