import { getPublicCardAppOrigin } from '../../config';

/** 24-char MongoDB ObjectId hex. */
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

/**
 * Public card page URL — always `/card/view/:cardId` on the frontend host (never API :8000).
 */
export function buildPublicCardViewUrl(cardId) {
  const id = String(cardId || '').trim();
  if (!id || !OBJECT_ID_RE.test(id)) return '';
  const origin = getPublicCardAppOrigin().replace(/\/$/, '');
  if (!origin) return '';
  return `${origin}/card/view/${encodeURIComponent(id)}`;
}

/**
 * QR image via QR Server API (encodes `buildPublicCardViewUrl` output).
 * Generated immediately from card id — no Supabase / storage dependency.
 */
export function buildCardQrImageUrl(cardId, size = 420) {
  const target = buildPublicCardViewUrl(cardId);
  if (!target) return '';
  const dim = Math.min(512, Math.max(200, Number(size) || 420));
  const params = new URLSearchParams({
    size: `${dim}x${dim}`,
    data: target,
    ecc: 'M',
    margin: '8',
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

/**
 * Parse card id from scanned text or legacy URLs (incl. old API `/card-view/` paths).
 */
export function parseCardIdFromScanText(href) {
  if (!href || typeof href !== 'string') return '';
  const s = href.trim();
  if (!s) return '';

  const patterns = [
    /\/card\/view\/([^/?#\s]+)/i,
    /\/card-view\/([^/?#\s]+)/i,
    /\/cards\/public\/([^/?#\s]+)/i,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const m = s.match(patterns[i]);
    if (m?.[1]) {
      const id = decodeURIComponent(m[1]).trim();
      if (OBJECT_ID_RE.test(id)) return id;
    }
  }

  try {
    const u = s.startsWith('http') ? new URL(s) : new URL(s, getPublicCardAppOrigin() || window.location.origin);
    for (let i = 0; i < patterns.length; i++) {
      const m = u.pathname.match(patterns[i]);
      if (m?.[1]) {
        const id = decodeURIComponent(m[1]).trim();
        if (OBJECT_ID_RE.test(id)) return id;
      }
    }
  } catch {
    /* ignore */
  }

  return '';
}

/** In-app route for React Router (relative). */
export function cardViewRoutePath(cardId) {
  const id = String(cardId || '').trim();
  if (!id || !OBJECT_ID_RE.test(id)) return '';
  return `/card/view/${encodeURIComponent(id)}`;
}
