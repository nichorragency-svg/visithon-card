/**
 * Visithon card API — MongoDB backend via apiClient (replaces Supabase).
 */
import { apiClient, apiErrorMessage } from '../apiClient';
import { sanitizeSocialPaste } from '../utils/socialPasteSanitize';
import { staticUrl } from '../visithon/utils/staticUrl';
import { THEME_STYLE_BY_ID } from '../visithon/wizard/themeVisuals';

export { apiErrorMessage };

const WIZARD = '/visithon/wizard';
const AUTH = '/card-auth';
const REMINDERS = '/visithon/reminders';

function cardIdFromStorage() {
  try {
    const u = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
    return String(u.id || u._id || '').trim();
  } catch {
    return '';
  }
}

/**
 * Card-user session only — writes `visithon_card_token` + `visithon_user_info`.
 * Does not read or modify admin keys (`visithon_admin_token`, etc.).
 */
export function persistCardUserSession({ token, cardId, email, fullName, hasCard = false, mongoUserId }) {
  const t = typeof token === 'string' ? token.trim() : '';
  if (t) localStorage.setItem('visithon_card_token', t);

  const id = String(cardId || '').trim();
  const info = {
    id,
    email: String(email || '').trim(),
    has_card: !!hasCard,
    full_name: String(fullName || '').trim(),
  };
  if (mongoUserId) info.mongo_user_id = String(mongoUserId);

  localStorage.setItem('visithon_user_info', JSON.stringify(info));
}

/** After login/signup — persist JWT + profile for routing. */
export async function refreshLocalUserInfoForSession(token, loginUser) {
  const t = typeof token === 'string' ? token.trim() : '';
  const cardId = loginUser?.id ? String(loginUser.id) : cardIdFromStorage();
  let hasCard = !!loginUser?.has_card;

  if (cardId && t) {
    try {
      const { data } = await apiClient.get(`${WIZARD}/wizard/state`);
      if (data?.ok) {
        hasCard = !!data.wizard_completed || !!(data.profile?.step1?.profession);
      }
    } catch {
      /* keep login payload */
    }
  }

  persistCardUserSession({
    token: t,
    cardId: cardId || loginUser?.id || '',
    email: loginUser?.email ?? '',
    fullName: loginUser?.fullName || loginUser?.full_name || '',
    hasCard,
    mongoUserId: loginUser?.user_id,
  });
}

export async function getWizardState() {
  const { data } = await apiClient.get(`${WIZARD}/wizard/state`);
  return data;
}

export async function fetchWizardThemes() {
  try {
    const { data } = await apiClient.get(`${WIZARD}/themes`);
    if (data?.themes?.length) return data;
  } catch {
    /* fallback */
  }
  const themes = Object.keys(THEME_STYLE_BY_ID).map((layout_key) => ({
    id: layout_key,
    name: layout_key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: 'Built-in layout',
    category: 'professional',
  }));
  return { themes };
}

export async function patchStep1Profession({ profession }) {
  await apiClient.patch(`${WIZARD}/wizard/step1`, { profession });
}

export async function patchStep1ShopFlag({ shop_portfolio_enabled }) {
  await apiClient.patch(`${WIZARD}/wizard/step1/shop-flag`, { shop_portfolio_enabled });
}

export async function patchStep1PricingPlan({ pricing_plan }) {
  await apiClient.patch(`${WIZARD}/wizard/step1/pricing-plan`, { pricing_plan });
}

export async function patchStep3({ theme }) {
  await apiClient.patch(`${WIZARD}/wizard/step3`, { theme });
}

export async function patchStep2(body) {
  await apiClient.patch(`${WIZARD}/wizard/step2`, body);
}

export function normalizeStep4Items(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const it = raw[i];
    if (!it || typeof it !== 'object') continue;
    const name = String(it.name != null ? it.name : '').trim();
    let id = String(it.id != null ? it.id : '').trim();
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `svc_${Date.now()}_${i}`;
    }
    out.push({ id, name });
  }
  return out;
}

export async function patchStep4({ items }) {
  await apiClient.patch(`${WIZARD}/wizard/step4`, { items: normalizeStep4Items(items) });
}

const STEP5_KEYS = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'custom'];
const STEP5_EMPTY = { enabled: false, url: '' };

export function normalizeStep5Social(blob) {
  const out = {};
  for (const k of STEP5_KEYS) {
    out[k] = { ...STEP5_EMPTY };
    const b = blob && typeof blob === 'object' ? blob[k] : null;
    if (b && typeof b === 'object') {
      out[k] = {
        enabled: !!b.enabled,
        url: typeof b.url === 'string' ? sanitizeSocialPaste(b.url).slice(0, 500) : '',
      };
    }
  }
  return out;
}

export async function patchStep5(socialBlob) {
  await apiClient.patch(`${WIZARD}/wizard/step5`, normalizeStep5Social(socialBlob || {}));
}

export function normalizeStep6Body(body) {
  const b = body && typeof body === 'object' ? body : {};
  return {
    phone: String(b.phone ?? '').trim().slice(0, 240),
    whatsapp: String(b.whatsapp ?? '').trim().slice(0, 240),
    whatsapp_visible: b.whatsapp_visible !== false,
    email: String(b.email ?? '').trim().slice(0, 240),
    website: String(b.website ?? '').trim().slice(0, 240),
    location: String(b.location ?? '').trim().slice(0, 240),
    show_all_contacts: b.show_all_contacts !== false,
  };
}

export async function patchStep6(body) {
  await apiClient.patch(`${WIZARD}/wizard/step6`, normalizeStep6Body(body));
}

const STEP7_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function normalizeStep7Schedule(schedule) {
  const s = schedule && typeof schedule === 'object' ? schedule : {};
  const out = {};
  for (let i = 0; i < STEP7_DAYS.length; i++) {
    const key = STEP7_DAYS[i];
    const defOpen = '09:00';
    const defClose = '17:00';
    const defaultEnabled = i < 5;
    const row = s[key];
    if (row && typeof row === 'object') {
      out[key] = {
        enabled: !!row.enabled,
        open: typeof row.open === 'string' && row.open.trim() ? row.open.trim().slice(0, 8) : defOpen,
        close:
          typeof row.close === 'string' && row.close.trim() ? row.close.trim().slice(0, 8) : defClose,
      };
    } else {
      out[key] = { enabled: defaultEnabled, open: defOpen, close: defClose };
    }
  }
  return out;
}

export async function patchStep7({ schedule }) {
  await apiClient.patch(`${WIZARD}/wizard/step7`, { schedule: normalizeStep7Schedule(schedule || {}) });
}

const MAX_GALLERY_IMAGES = 24;

export function normalizeStep8Images(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const it = raw[i];
    if (!it || typeof it !== 'object') continue;
    const url = String(it.url != null ? it.url : it.src != null ? it.src : '').trim();
    if (!url) continue;
    const id =
      String(it.id || '').trim() ||
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `g_${Date.now()}_${i}`);
    out.push({
      id,
      url,
      name: String(it.name ?? '').trim().slice(0, 200),
      price: String(it.price ?? '').trim().slice(0, 80),
    });
    if (out.length >= MAX_GALLERY_IMAGES) break;
  }
  return out;
}

export async function patchStep8({ images, videos }) {
  await apiClient.patch(`${WIZARD}/wizard/step8`, {
    images: normalizeStep8Images(images),
    videos: Array.isArray(videos) ? videos : [],
  });
}

/** Normalize API upload path → key under `/static/` (e.g. `digital_cards/avatar_….jpg`). */
export function normalizeUploadRelativePath(url) {
  let s = String(url || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      s = u.pathname.replace(/^\/static\//, '').replace(/^\/+/, '');
    } catch {
      s = s.replace(/^\/+/, '');
    }
  }
  s = s.replace(/^\/+/, '').replace(/^static\//, '').replace(/^uploads\//, '');
  return s;
}

async function uploadFile(file, kind) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('kind', kind);
  const { data } = await apiClient.post(`${WIZARD}/upload`, fd);
  return data;
}

export async function uploadGalleryFile(file, kindHint) {
  const data = await uploadFile(file, kindHint === 'video' ? 'video' : 'image');
  const rel = normalizeUploadRelativePath(data?.url);
  return { id: data?.id, url: rel, displayUrl: staticUrl(rel) };
}

/**
 * Avatar upload — POST /visithon/wizard/upload (kind=avatar).
 * Backend persists `profile.step2.avatar_url`; no separate patch required.
 */
export async function uploadAvatarFile(file) {
  const data = await uploadFile(file, 'avatar');
  const relativePath = normalizeUploadRelativePath(data?.url);
  if (!relativePath) {
    throw new Error('Upload succeeded but no file path was returned.');
  }
  return { relativePath, displayUrl: staticUrl(relativePath) };
}

export async function finalizeBankAccountsFromWizard(accountsDrafts) {
  const userId = cardIdFromStorage();
  if (!userId) throw new Error('Not signed in.');

  const accountsJson = accountsDrafts.map((a) => ({
    bank_name: String(a.bank_name || '').trim(),
    account_title: String(a.account_title || '').trim(),
    iban: String(a.iban || '').trim(),
    pay_qr_img: String(a.pay_qr_img || '').trim(),
  }));

  const fd = new FormData();
  fd.append('accounts_json', JSON.stringify(accountsJson));
  accountsDrafts.forEach((a, index) => {
    if (a.file instanceof File) fd.append(`qr_file_${index}`, a.file);
  });

  await apiClient.post(`${AUTH}/update-multi-bank/${userId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const step9Accounts = accountsJson.map((a, i) => ({
    bank_name: a.bank_name,
    account_title: a.account_title,
    iban: a.iban,
    qr_image_url: a.pay_qr_img,
  }));

  const fd2 = new FormData();
  fd2.append('accounts_json', JSON.stringify(step9Accounts));
  await apiClient.post(`${WIZARD}/card-auth/update-multi-bank/${userId}`, fd2, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  await refreshLocalUserInfoForSession(localStorage.getItem('visithon_card_token'), {
    id: userId,
    has_card: true,
  });
}

export async function updatePaymentAccountsViaForm(draftsThatMayHaveFiles, userId) {
  return finalizeBankAccountsFromWizard(draftsThatMayHaveFiles);
}

export async function listRemindersPayload() {
  const { data } = await apiClient.get(REMINDERS);
  return data;
}

export async function createReminder(payload) {
  const { data } = await apiClient.post(REMINDERS, payload);
  return data;
}

export async function deleteReminderById(reminderId) {
  await apiClient.delete(`${REMINDERS}/${encodeURIComponent(reminderId)}`);
}

/** Public card view payload */
export async function fetchPublishedCardPayload(userId) {
  const { data } = await apiClient.get(`/card-view/${encodeURIComponent(userId)}`);
  return { payload: data };
}

/** Auth helpers */
export async function loginWithPassword(email, password) {
  const { data } = await apiClient.post(`${AUTH}/login`, { email, password });
  if (data?.token) {
    localStorage.setItem('visithon_card_token', data.token);
    await refreshLocalUserInfoForSession(data.token, data.user);
  }
  return data;
}

export async function signupWithPassword(fullName, email, password) {
  const { data } = await apiClient.post(`${AUTH}/users/signup`, {
    fullName,
    email,
    password,
  });
  if (data?.token) {
    localStorage.setItem('visithon_card_token', data.token);
    await refreshLocalUserInfoForSession(data.token, data.user);
  }
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await apiClient.post(`${AUTH}/forgot-password`, { email });
  return data;
}

export async function resetPasswordWithOtp(email, otp, password) {
  const { data } = await apiClient.post(`${AUTH}/reset-password`, { email, otp, password });
  return data;
}

export function clearCardSession() {
  localStorage.removeItem('visithon_card_token');
  localStorage.removeItem('visithon_user_info');
}

/** Save a scanned/viewed card into the Visithon contacts directory (requires card-user JWT). */
export async function saveContactToDirectory(cardId) {
  const id = String(cardId || '').trim();
  if (!id) throw new Error('card_id required');
  const { data } = await apiClient.post('/contacts/save', { card_id: id });
  return data;
}

/** List saved directory contacts for the logged-in card user. */
export async function listSavedContacts() {
  const { data } = await apiClient.get('/contacts/list');
  return Array.isArray(data?.items) ? data.items : [];
}
