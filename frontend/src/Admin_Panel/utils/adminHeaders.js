import { ADMIN_TOKEN_KEY } from '../constants';

export function adminAuthHeaders() {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  return token?.trim() ? { Authorization: `Bearer ${token.trim()}` } : {};
}
