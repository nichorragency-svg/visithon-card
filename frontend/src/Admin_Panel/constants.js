/** Session flag: set only after Alt+A double-press (hidden entry). */
export const ADMIN_UNLOCK_SESSION_KEY = 'visithon_admin_unlock';
export const ADMIN_TOKEN_KEY = 'visithon_admin_token';
/** Max ms between two Alt+A presses to count as unlock. */
export const ADMIN_ALT_A_DOUBLE_MS = 650;

/**
 * FastAPI root (scheme + host + port) without a trailing `/admin`.
 * If REACT_APP_API_BASE_URL mistakenly ends with `/admin`, strip it so paths stay `/admin/...` not `/admin/admin/...`.
 */
export function getFastApiRoot(apiBaseUrl) {
  let b = String(apiBaseUrl || '').trim().replace(/\/+$/, '');
  if (/\/admin$/i.test(b)) {
    b = b.replace(/\/admin$/i, '').replace(/\/+$/, '');
  }
  return b;
}
