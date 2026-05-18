import { API_BASE_URL, getMediaPublicBase } from '../../config';

const LEGACY_HOST_RE = /159\.65\.138\.9(?::\d+)?/i;

function extractStaticKey(path) {
  let key = String(path || '').trim().replace(/^\/+/, '');
  if (key.startsWith('static/')) key = key.slice('static/'.length);
  if (key.startsWith('uploads/')) key = key.slice('uploads/'.length);
  return key;
}

/**
 * Rewrites legacy VPS http://IP:8000/static/... to the current secure API `/static` base.
 */
function rewriteAbsoluteMediaUrl(url) {
  const s = String(url || '').trim();
  if (!/^https?:\/\//i.test(s)) return null;

  try {
    const parsed = new URL(s);
    const pathMatch = parsed.pathname.match(/\/(?:static|uploads)\/(.+)$/i);
    const mediaBase = getMediaPublicBase().replace(/\/$/, '');

    if (pathMatch && mediaBase) {
      return `${mediaBase}/${pathMatch[1].replace(/^\/+/, '')}`.replace(/([^:])\/{2,}/g, '$1/');
    }

    const isLegacyHost = LEGACY_HOST_RE.test(parsed.host);
    const isInsecureOnHttpsPage =
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      parsed.protocol === 'http:';

    if ((isLegacyHost || isInsecureOnHttpsPage) && mediaBase && pathMatch) {
      return `${mediaBase}/${pathMatch[1].replace(/^\/+/, '')}`;
    }

    if (isInsecureOnHttpsPage && !isLegacyHost) {
      return s.replace(/^http:/i, 'https:');
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Resolve backend-relative paths (or legacy absolute URLs) to HTTPS-safe media URLs.
 */
export function staticUrl(relativePath) {
  if (!relativePath) return '';
  const s = String(relativePath).trim();
  if (!s) return '';

  if (/^https?:\/\//i.test(s)) {
    return rewriteAbsoluteMediaUrl(s) || s;
  }

  const mediaBase = getMediaPublicBase().replace(/\/$/, '');
  const key = extractStaticKey(s);

  if (!mediaBase) {
    return s;
  }

  return `${mediaBase}/${key}`.replace(/([^:])\/{2,}/g, '$1/');
}

export function uploadsUrl(relativePath) {
  return staticUrl(relativePath);
}
