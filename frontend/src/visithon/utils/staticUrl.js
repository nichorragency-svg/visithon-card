import { API_BASE_URL } from '../../config';

export function staticUrl(relativePath) {
  if (!relativePath) return '';
  const base = (API_BASE_URL || '').replace(/\/$/, '');
  return `${base}/static/${relativePath}`.replace(/([^:]\/)\/+/g, '$1');
}
