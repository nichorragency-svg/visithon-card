import { getSupabaseMediaPublicBase } from '../../config';

/**
 * Turns a backend-relative `/static/foo` reference or a bare storage path into a usable URL.
 * Full http(s) strings pass through unchanged.
 */
export function staticUrl(relativePath) {
  if (!relativePath) return '';
  const s = String(relativePath).trim();
  if (/^https?:\/\//i.test(s)) return s;

  const bucketBase = getSupabaseMediaPublicBase();
  let key = s;

  const staticPrefix = /^static\//;
  const legacyQr = /^card_bank_qrs\//;
  const legacyDigi = /^digital_cards\//;
  const legacyProd = /^product_assets\//;

  if (staticPrefix.test(key)) {
    key = key.replace(/^static\//, '');
  }

  const mediaBase = bucketBase.replace(/\/$/, '');
  if (!mediaBase) {
    return s;
  }

  if (legacyQr.test(key)) {
    key = key.replace(/^card_bank_qrs\//, '').replace(/^\/+/, '');
    return `${mediaBase}/${key}`.replace(/([^:])\/{2,}/g, '$1/');
  }
  if (legacyDigi.test(key) || legacyProd.test(key)) {
    return `${mediaBase}/${key.replace(/^\/+/, '')}`.replace(/([^:])\/{2,}/g, '$1/');
  }

  const cleaned = key.replace(/^\/+/, '');
  return `${mediaBase}/${cleaned}`.replace(/([^:])\/{2,}/g, '$1/');
}
