import { staticUrl } from '../../visithon/utils/staticUrl';
import { SOCIAL_DISPLAY_ORDER } from './styles';

export function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '');
}

export function withHttp(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

export function hexToRgb(hex) {
  const h = String(hex || '').trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

/** DB themes: snake_case + camelCase; skip empty ui_tokens. */
export function pickEffectiveUiTokens(selectedThemeBlock) {
  if (!selectedThemeBlock?.ui_tokens || typeof selectedThemeBlock.ui_tokens !== 'object') return null;
  const t = selectedThemeBlock.ui_tokens;
  const page_bg = t.page_bg ?? t.pageBg;
  const shell_from = t.shell_from ?? t.shellFrom;
  const shell_mid = t.shell_mid ?? t.shellMid;
  const shell_to = t.shell_to ?? t.shellTo;
  const header_bg = t.header_bg ?? t.headerBg;
  const accent = t.accent;
  const text_mode = t.text_mode ?? t.textMode;
  const hasColor = [page_bg, shell_from, shell_to, header_bg, accent].some(
    (v) => v != null && String(v).trim() !== ''
  );
  if (!hasColor) return null;
  return { page_bg, shell_from, shell_mid, shell_to, header_bg, accent, text_mode };
}

export function shellGradientBackground(t) {
  if (!t) return undefined;
  const a = String(t.shell_from || '#0f172a').trim();
  const b = String(t.shell_to || '#020617').trim();
  const midRaw = t.shell_mid ?? t.shellMid;
  const mid = midRaw != null && String(midRaw).trim() !== '' ? String(midRaw).trim() : '';
  if (mid) {
    return `linear-gradient(180deg, ${a} 0%, ${mid} 48%, ${b} 100%)`;
  }
  return `linear-gradient(180deg, ${a} 0%, ${b} 100%)`;
}

export function actionTileOuterClass(ringGradient) {
  return `group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${ringGradient} p-[1px] shadow-lg transition hover:scale-105`;
}

export function resolveAvatar(u) {
  if (u.avatar_static_path) return staticUrl(u.avatar_static_path);
  if (u.legacy_profile_img) return staticUrl(u.legacy_profile_img);
  return 'https://placehold.co/200x200/0f172a/64748b?text=V';
}

export function locationHref(u) {
  const loc = (u.location_text || u.locationUrl || '').trim();
  if (!loc) return '';
  if (/^https?:\/\//i.test(loc)) return loc;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
}

export function rankSocialKey(key) {
  const i = SOCIAL_DISPLAY_ORDER.indexOf(key);
  return i === -1 ? SOCIAL_DISPLAY_ORDER.length + 10 : i;
}

export function sortSocialEntries(entries) {
  return [...entries].sort(([a], [b]) => rankSocialKey(a) - rankSocialKey(b));
}
