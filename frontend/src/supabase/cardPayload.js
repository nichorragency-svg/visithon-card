import { sanitizeSocialPaste } from '../utils/socialPasteSanitize';

/** Build public-card view model from profiles row (+ optional theme row). Mirrors backend/card_view loosely. */

const SOCIAL_KEYS = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'custom'];

export function normalizeServiceItems(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const it of list.slice(0, 35)) {
    if (!it || typeof it !== 'object') continue;
    const name = String(it.name || '').trim();
    if (!name) continue;
    out.push({
      id: String(it.id || '').trim().slice(0, 80) || `srv_${out.length}`,
      name: name.slice(0, 200),
    });
  }
  return out;
}

function normalizeStep1(step1) {
  const s1 = step1 && typeof step1 === 'object' ? step1 : {};
  return {
    profession: (s1.profession || '').trim(),
    shop_portfolio_enabled: s1.shop_portfolio_enabled === true ? true : s1.shop_portfolio_enabled === false ? false : undefined,
    pricing_plan: (s1.pricing_plan || '').trim(),
    theme: (s1.theme || '').trim(),
  };
}

/** Build `{ status, data }` shape consumed by CardDisplay/useCardDisplayData. */
export function buildCardPayload(profileRow, themeRow) {
  if (!profileRow || !profileRow.id) return null;

  const uid = String(profileRow.id);
  const profile = profileRow.profile && typeof profileRow.profile === 'object' ? profileRow.profile : {};
  const s1m = normalizeStep1(profile.step1 || {});
  const s2 = profile.step2 || {};
  const s4 = profile.step4 || {};
  const rawItems = Array.isArray(s4.items) ? s4.items : [];
  const services = normalizeServiceItems(rawItems);

  const s6 = typeof profile.step6 === 'object' && profile.step6 ? profile.step6 : {};

  const s5Raw = typeof profile.step5 === 'object' && profile.step5 ? profile.step5 : {};
  const social = {};
  for (const k of SOCIAL_KEYS) {
    const block = s5Raw[k];
    if (block && typeof block === 'object' && block.enabled && String(block.url || '').trim()) {
      social[k] = sanitizeSocialPaste(String(block.url || '')).trim();
    }
  }

  const s8 = typeof profile.step8 === 'object' && profile.step8 ? profile.step8 : {};
  const rawImages = Array.isArray(s8.images) ? s8.images : Array.isArray(s8.gallery) ? s8.gallery : [];
  const galleryImages = [];
  for (let i = 0; i < rawImages.length; i++) {
    const raw = rawImages[i];
    if (typeof raw === 'string' && raw.trim()) {
      galleryImages.push({ url: raw.trim(), caption: '', order: i });
    } else if (raw && typeof raw === 'object' && typeof raw.url === 'string') {
      galleryImages.push({
        url: raw.url.trim(),
        caption: (raw.name || '').toString(),
        order: i,
      });
    }
  }

  const s7flat = typeof profile.step7 === 'object' && profile.step7 ? profile.step7 : {};
  const business_hours = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const d of days) {
    const row = s7flat[d];
    if (row && typeof row === 'object') {
      business_hours[d] = {
        enabled: !!row.enabled,
        open: (row.open || '09:00').toString().trim(),
        close: (row.close || '17:00').toString().trim(),
      };
    } else if (typeof s7flat.business_hours === 'object' && s7flat.business_hours[d]) {
      const bw = s7flat.business_hours[d];
      business_hours[d] = {
        enabled: !bw.is_closed,
        open: String(bw.open || '09:00'),
        close: String(bw.close || '18:00'),
      };
    }
  }

  const fullName =
    String(s2.full_name || '').trim() || profileRow.full_name?.trim() || 'Visithon member';
  const position = String(s2.position || '').trim();
  const company = String(s2.company || '').trim();
  const bio = String(s2.bio || '').trim();
  const avatarPath =
    typeof s2.avatar_url === 'string' ? s2.avatar_url.trim() : String(s2.avatar_url || '').trim();

  const phone = String(s6.phone || '').trim();
  const whatsapp = String(s6.whatsapp || '').trim();
  const email = String(s6.email || '').trim();
  const website = String(s6.website || '').trim();
  const location = String(s6.location || '').trim();

  const tagParts = [position, company].filter(Boolean);

  let products = Array.isArray(profileRow.products) ? profileRow.products : [];
  let payment_methods = Array.isArray(profileRow.payment_methods) ? profileRow.payment_methods : [];

  const data = {
    id: uid,
    name: fullName,
    role: position,
    company,
    bio,
    tagline: tagParts.join(' • '),
    avatar_static_path: avatarPath.startsWith('http') ? avatarPath : avatarPath || '',
    legacy_profile_img: '',
    coverImg: '',
    productBtnImage: '',
    phone1: phone,
    phone2: '',
    whatsapp,
    email,
    website,
    locationUrl: location,
    location_text: location,
    show_all_contacts: s6.show_all_contacts !== false,
    whatsapp_visible: s6.whatsapp_visible !== false,
    social,
    services,
    business_hours: Object.keys(business_hours).length ? business_hours : profile.step7 || {},
    gallery: { images: galleryImages, videos: [] },
    products,
    payment_methods,
    profile,
    shop_portfolio_enabled: s1m.shop_portfolio_enabled,
    pricing_plan: s1m.pricing_plan || '',
  };

  const themeKey =
    typeof ((profile.step1 || {}).theme) === 'string'
      ? (profile.step1 || {}).theme
      : s1m.theme || '';

  if (themeRow && themeRow.layout_key) {
    data.selected_theme = {
      id: String(themeRow.layout_key || ''),
      name: String(themeRow.name || ''),
      category: String(themeRow.category || ''),
      is_active: themeRow.is_active !== false,
      ui_tokens:
        themeRow.ui_tokens && typeof themeRow.ui_tokens === 'object' ? themeRow.ui_tokens : {},
    };
  } else if (themeKey) {
    data.selected_theme = {
      id: themeKey,
      name: '',
      category: '',
      is_active: true,
      ui_tokens: {},
    };
  }

  return { status: 'success', data };
}
