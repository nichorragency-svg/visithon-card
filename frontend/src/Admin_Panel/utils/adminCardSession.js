import { persistCardUserSession } from '../../api/visithonApi';
import { ADMIN_TOKEN_KEY } from '../constants';

/** Card wizard step 1 — `?edit=1` keeps published users on the wizard (DigitalCardRoutes). */
export const CARD_WIZARD_EDIT_PATH = '/card/wizard/step-1?edit=1';

export function snapshotAdminToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function restoreAdminToken(adminToken) {
  if (adminToken?.trim() && typeof localStorage !== 'undefined') {
    localStorage.setItem(ADMIN_TOKEN_KEY, adminToken.trim());
  }
}

/**
 * Write card-user session keys only (`visithon_card_token`, `visithon_user_info`).
 * @returns {boolean} true when a JWT was stored
 */
export function applyCardUserSessionPayload(data, { fullName = '', email = '' } = {}) {
  const token =
    (typeof data?.token === 'string' && data.token.trim()) ||
    (typeof data?.access_token === 'string' && data.access_token.trim()) ||
    '';
  const cardId = String(data?.card_id || data?.user?.id || '').trim();
  const userId = String(data?.user_id || data?.user?.user_id || '').trim();
  const u = data?.user && typeof data.user === 'object' ? data.user : {};

  if (!token) return false;

  persistCardUserSession({
    token,
    cardId,
    email: String(u.email || email || '').trim(),
    fullName: String(u.fullName || u.full_name || fullName || '').trim(),
    hasCard: !!u.has_card,
    mongoUserId: userId || undefined,
  });

  return !!localStorage.getItem('visithon_card_token');
}

/** Resolve ids from an admin users-table row. */
export function rowCardAndUserIds(row) {
  const cardId = String(row?.card_id || row?._id || '').trim();
  const userId = String(row?.user_id || row?.mongo_user_id || '').trim();
  return { cardId, userId };
}

/**
 * Inject card session, restore admin token, navigate into the card app wizard.
 */
export function navigateToCardWizardEdit(navigate, { cardId, userId, fullName, email, from = 'admin-users' }) {
  navigate(CARD_WIZARD_EDIT_PATH, {
    replace: true,
    state: {
      editMode: true,
      fromAdminEdit: true,
      from,
      cardId,
      userId,
      fullName,
      email,
    },
  });
}
