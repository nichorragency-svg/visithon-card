import { ensureSupabase } from './client';
import { sanitizeSocialPaste } from '../utils/socialPasteSanitize';
import { THEME_STYLE_BY_ID } from '../visithon/wizard/themeVisuals';

/** @typedef {import('@supabase/supabase-js').SupabaseClient} SupabaseClient */

function throwReadable(e, fb) {
  const msg =
    e?.message ||
    e?.error_description ||
    (typeof e === 'string' ? e : null) ||
    fb ||
    'Request failed.';
  throw new Error(msg);
}

/** Avoid UI stuck on “Saving…” when the network or Supabase never responds. */
async function withTimeout(run, ms, message) {
  let timer;
  const timeout = new Promise((_, rej) => {
    timer = setTimeout(() => rej(new Error(message)), ms);
  });
  try {
    return await Promise.race([run(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function getSessionUserId() {
  const supabase = ensureSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Not signed in.');
  return session.user.id;
}

async function fetchProfile(uid) {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, has_card, wizard_completed, is_published, profile, products, payment_methods, reminders',
    )
    .eq('id', uid)
    .maybeSingle();
  if (error) throwReadable(error, 'Could not load profile.');
  return data;
}

function mergeProfileBlob(prev, mutatorFn) {
  /** Shallow clone top-level keys only — deep JSON clone of huge `profile` (gallery, etc.) freezes the UI on save. */
  const draft =
    prev && typeof prev === 'object' && !Array.isArray(prev) ? { ...prev } : {};
  if (typeof mutatorFn === 'function') {
    mutatorFn(draft);
    return draft;
  }
  return draft;
}

/**
 * Mutate nested `profiles.profile` JSON.
 */
export async function mutateProfile(mutator) {
  await withTimeout(
    async () => {
      const uid = await getSessionUserId();
      const row = await fetchProfile(uid);
      const prevProfile =
        row?.profile != null && typeof row.profile === 'object' && !Array.isArray(row.profile)
          ? row.profile
          : {};
      const next = mergeProfileBlob(prevProfile, mutator);
      const { error } = await ensureSupabase()
        .from('profiles')
        .upsert(
          {
            id: uid,
            full_name: row?.full_name != null ? row.full_name : '',
            profile: next,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        );
      if (error) throwReadable(error, 'Could not save.');
    },
    28000,
    'Save timed out. Check your internet connection or Supabase status, then try again.',
  );
}

/** --- Themes --- */
export async function fetchWizardThemes() {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('themes')
    .select('layout_key, name, category, preview_url')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !data?.length) {
    const themes = Object.keys(THEME_STYLE_BY_ID).map((layout_key) => ({
      id: layout_key,
      name: layout_key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      subtitle: 'Built-in layout',
      category:
        layout_key.includes('minimal') || layout_key.includes('dark')
          ? 'modern'
          : layout_key.includes('nature') || layout_key.includes('green')
          ? 'healthcare'
          : layout_key.includes('creative')
          ? 'creative'
          : 'professional',
    }));
    return { themes };
  }

  const themes = data.map((r) => ({
    id: r.layout_key,
    name: r.name || r.layout_key,
    subtitle: (r.category || '').toString(),
    category: r.category || 'professional',
    preview_url: r.preview_url,
  }));

  return { themes };
}

/** --- Wizard state --- */
export async function getWizardState() {
  const uid = await getSessionUserId();
  const row = await fetchProfile(uid);
  if (!row) return { ok: false, profile: {}, wizard_completed: false, is_published: false };
  return {
    ok: true,
    profile: row.profile || {},
    wizard_completed: !!row.wizard_completed,
    is_published: !!row.is_published,
  };
}

export async function patchStep1Profession({ profession }) {
  const prof = String(profession || '').trim();
  if (!prof) throw new Error('profession is required');
  await mutateProfile((p) => {
    const s1 = p.step1 || {};
    s1.profession = prof;
    p.step1 = s1;
  });
}

export async function patchStep1ShopFlag({ shop_portfolio_enabled }) {
  if (shop_portfolio_enabled !== true && shop_portfolio_enabled !== false) {
    throw new Error('shop_portfolio_enabled must be boolean');
  }
  await mutateProfile((p) => {
    const s1 = p.step1 || {};
    s1.shop_portfolio_enabled = !!shop_portfolio_enabled;
    if (!shop_portfolio_enabled) s1.pricing_plan = '';
    p.step1 = s1;
  });
}

export async function patchStep1PricingPlan({ pricing_plan }) {
  const plan = String(pricing_plan || '').toLowerCase();
  const allowed = new Set(['free', 'basic', 'pro']);
  if (!allowed.has(plan)) throw new Error('Invalid pricing plan');
  await mutateProfile((p) => {
    const s1 = p.step1 || {};
    if (s1.shop_portfolio_enabled !== true) throw new Error('Enable shop/portfolio before choosing plan.');
    s1.pricing_plan = plan;
    p.step1 = s1;
  });
}

export async function patchStep3({ theme }) {
  const tid = String(theme || '').trim();
  if (!tid) throw new Error('theme required');
  await mutateProfile((p) => {
    const s1 = p.step1 || {};
    s1.theme = tid;
    p.step1 = s1;
  });
}

export async function patchStep2(body) {
  await mutateProfile((p) => {
    const prev = p.step2 && typeof p.step2 === 'object' ? { ...p.step2 } : {};
    for (const [k, v] of Object.entries(body || {})) {
      if (v !== undefined && v !== null) prev[k] = v;
    }
    p.step2 = prev;
  });
}

/** Sanitize services list so React keys + DB always get stable `{ id, name }` objects. */
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
          : `svc_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 9)}`;
    }
    out.push({ id, name });
  }
  return out;
}

export async function patchStep4({ items }) {
  const clean = normalizeStep4Items(items);
  await mutateProfile((p) => {
    p.step4 = { ...(p.step4 || {}), items: clean };
  });
}

const STEP5_KEYS = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'custom'];
const STEP5_EMPTY = { enabled: false, url: '' };

/** Stable social blocks for cardPayload / display (matches WizardStep5). */
export function normalizeStep5Social(blob) {
  const out = {};
  for (const k of STEP5_KEYS) {
    out[k] = { ...STEP5_EMPTY };
    const b = blob && typeof blob === 'object' ? blob[k] : null;
    if (b && typeof b === 'object') {
      out[k] = {
        enabled: !!b.enabled,
        url:
          typeof b.url === 'string'
            ? sanitizeSocialPaste(b.url).slice(0, 500)
            : '',
      };
    }
  }
  return out;
}

export async function patchStep5(socialBlob) {
  const clean = normalizeStep5Social(socialBlob || {});
  await mutateProfile((p) => {
    p.step5 = clean;
  });
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
  const clean = normalizeStep6Body(body);
  await mutateProfile((p) => {
    p.step6 = clean;
  });
}

const STEP7_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/** One row per day; tolerates missing keys / bad types. */
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
        open:
          typeof row.open === 'string' && row.open.trim() ? row.open.trim().slice(0, 8) : defOpen,
        close:
          typeof row.close === 'string' && row.close.trim()
            ? row.close.trim().slice(0, 8)
            : defClose,
      };
    } else {
      out[key] = { enabled: defaultEnabled, open: defOpen, close: defClose };
    }
  }
  return out;
}

export async function patchStep7({ schedule }) {
  const clean = normalizeStep7Schedule(schedule || {});
  await mutateProfile((p) => {
    p.step7 = { ...(p.step7 || {}), ...clean };
  });
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
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `g_${Date.now()}_${i}`);
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
  const cleanImages = normalizeStep8Images(images);
  const vid = Array.isArray(videos) ? videos : [];
  await mutateProfile((p) => {
    p.step8 = {
      ...(p.step8 || {}),
      images: cleanImages,
      videos: vid,
    };
  });
}

const MEDIA_BUCKET = 'media';

async function uploadBytes(path, file, mime) {
  const supabase = ensureSupabase();
  const buf = await file.arrayBuffer();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, buf, {
    upsert: true,
    contentType: mime || file.type || undefined,
  });
  if (error) throwReadable(error, 'Upload failed.');
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** @returns {Promise<{ url: string, id?: string }>} */
export async function uploadGalleryFile(file, kindHint) {
  const uid = await getSessionUserId();
  const ext = (file.name && file.name.split('.').pop()) || 'jpg';
  const nid = crypto.randomUUID ? crypto.randomUUID() : `gal_${Date.now()}`;
  const path = `${uid}/gallery/${nid}.${ext}`;
  const url = await uploadBytes(path, file, kindHint === 'video' ? file.type : 'image/jpeg');
  return { id: nid, url };
}

/** @returns {Promise<string>} public URL */
export async function uploadAvatarFile(file) {
  const uid = await getSessionUserId();
  const ext = (file.name && file.name.split('.').pop()) || 'jpg';
  const path = `${uid}/avatar.${ext}`;
  const url = await uploadBytes(path, file, file.type);
  await mutateProfile((p) => {
    const s2 = p.step2 || {};
    s2.avatar_url = url;
    p.step2 = s2;
  });
  return url;
}

/** Persist payment_methods + finalize wizard flags (step 9). */
export async function finalizeBankAccountsFromWizard(accountsDrafts) {
  const uid = await getSessionUserId();
  const supabase = ensureSupabase();

  const clean = [];
  for (let i = 0; i < accountsDrafts.length; i++) {
    const acc = accountsDrafts[i] || {};
    const file = acc.file instanceof File ? acc.file : undefined;
    let pay_img = String(acc.pay_qr_img || '').trim();
    if (file instanceof File) {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${uid}/bank_qr_${i}_${Date.now()}.${ext}`;
      pay_img = await uploadBytes(path, file);
    }

    clean.push({
      bank_name: String(acc.bank_name || '').trim(),
      account_title: String(acc.account_title || '').trim(),
      iban: String(acc.iban || '').trim(),
      pay_qr_img: pay_img,
    });
  }

  await mutateProfile((p) => {
    const s9 = {};
    s9.accounts = accountsDrafts.map((a, i) => ({
      bank_name: String(a.bank_name || '').trim(),
      account_title: String(a.account_title || '').trim(),
      iban: String(a.iban || '').trim(),
      qr_image_url: clean[i]?.pay_qr_img || '',
    }));
    p.step9 = s9;
  });

  const { error } = await supabase
    .from('profiles')
    .update({
      payment_methods: clean,
      has_card: true,
      wizard_completed: true,
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', uid);
  if (error) throwReadable(error, 'Finalize failed.');
}

export async function updatePaymentAccountsViaForm(draftsThatMayHaveFiles, userId) {
  const self = await getSessionUserId();
  if (String(self) !== String(userId)) throw new Error('Not allowed.');

  const clean = [];
  for (let i = 0; i < draftsThatMayHaveFiles.length; i++) {
    const d = draftsThatMayHaveFiles[i];
    const file = d.file;
    let pay_img = String(d.pay_qr_img || '').trim();
    if (file instanceof File) {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${self}/bank_qr_${i}_${Date.now()}.${ext}`;
      pay_img = await uploadBytes(path, file);
    }
    clean.push({
      bank_name: String(d.bank_name || '').trim(),
      account_title: String(d.account_title || '').trim(),
      iban: String(d.iban || '').trim(),
      pay_qr_img: pay_img,
    });
  }

  const { error } = await ensureSupabase()
    .from('profiles')
    .update({
      payment_methods: clean,
      updated_at: new Date().toISOString(),
    })
    .eq('id', self);
  if (error) throwReadable(error, 'Save failed.');
}

function normalizeReminder(raw) {
  const title = String(raw.title || '').trim();
  if (!title) return null;
  const rtypeRaw = String(raw.type || 'Follow Up').trim();
  const types = new Set(['Follow Up', 'Meeting', 'Personal', 'Other']);
  const type = types.has(rtypeRaw) ? rtypeRaw : 'Other';
  return {
    id: String(raw.id || '').trim() || `r_${Date.now()}`,
    title: title.slice(0, 200),
    date: String(raw.date || '').slice(0, 32),
    time: String(raw.time || '').slice(0, 16),
    type,
    note: String(raw.note || '').slice(0, 2000),
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export async function listRemindersPayload() {
  const uid = await getSessionUserId();
  const row = await fetchProfile(uid);
  const raw = Array.isArray(row.reminders) ? row.reminders : [];
  const out = [];
  for (const it of raw) {
    const n = normalizeReminder(it);
    if (n) out.push(n);
  }
  out.sort((a, b) => `${b.date}|${b.time}`.localeCompare(`${a.date}|${a.time}`));
  return { reminders: out };
}

export async function createReminder(data) {
  const uid = await getSessionUserId();
  const row = await fetchProfile(uid);
  const cur = Array.isArray(row.reminders) ? [...row.reminders] : [];
  if (cur.length >= 120) throw new Error('Too many reminders');
  const nw = normalizeReminder({
    ...data,
    id: data.id || (crypto.randomUUID ? crypto.randomUUID() : undefined),
    created_at: new Date().toISOString(),
  });
  if (!nw) throw new Error('Invalid reminder');

  cur.push(nw);

  const { error } = await ensureSupabase()
    .from('profiles')
    .update({ reminders: cur, updated_at: new Date().toISOString() })
    .eq('id', uid);
  if (error) throwReadable(error, 'Save failed.');
  return { ok: true, reminder: nw };
}

export async function deleteReminderById(reminderId) {
  const uid = await getSessionUserId();
  const row = await fetchProfile(uid);
  const cur = Array.isArray(row.reminders) ? row.reminders : [];
  const next = cur.filter((it) => it && typeof it === 'object' && String(it.id) !== String(reminderId));

  const { error } = await ensureSupabase()
    .from('profiles')
    .update({ reminders: next, updated_at: new Date().toISOString() })
    .eq('id', uid);
  if (error) throwReadable(error, 'Delete failed.');
}

/**
 * Persist user_info + token shadow for routing. Call after login.
 * Pass `sessionFromAuth` right after signInWithPassword/signUp so we don’t rely on a second getSession()
 * racing storage (some browsers stall on Authenticating…).
 *
 * @param {string | undefined} accessTokenFallback
 * @param {import('@supabase/supabase-js').Session | null | undefined} sessionFromAuth
 */
export async function refreshLocalUserInfoForSession(accessTokenFallback, sessionFromAuth) {
  const supabase = ensureSupabase();
  let session = sessionFromAuth && sessionFromAuth.user ? sessionFromAuth : null;
  if (!session) {
    const {
      data: { session: fromStorage },
    } = await supabase.auth.getSession();
    session = fromStorage ?? null;
  }

  const token = session?.access_token || accessTokenFallback || '';

  if (!session?.user) {
    localStorage.removeItem('visithon_card_token');
    localStorage.removeItem('visithon_user_info');
    return;
  }

  localStorage.setItem('visithon_card_token', token);

  let profile = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('has_card, id, full_name')
      .eq('id', session.user.id)
      .maybeSingle();
    if (!error && data) profile = data;
  } catch {
    profile = null;
  }

  localStorage.setItem(
    'visithon_user_info',
    JSON.stringify({
      id: session.user.id,
      email: session.user.email ?? '',
      has_card: !!profile?.has_card,
      full_name:
        profile?.full_name ||
        session.user.user_metadata?.full_name ||
        '',
    }),
  );
}
