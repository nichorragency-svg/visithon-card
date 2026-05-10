import { staticUrl } from '../../visithon/utils/staticUrl';
import { sanitizeSocialPaste } from '../../utils/socialPasteSanitize';
import { SOCIAL_DISPLAY_ORDER } from './styles';

export { sanitizeSocialPaste };

export function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '');
}

export function withHttp(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

/**
 * Stable click target for known networks. Plain handles → full profile URLs.
 * Roots like https://facebook.com/ open the viewer’s own session — treated as invalid (empty).
 */
export function canonicalSocialUrl(platformKey, raw) {
  const trimmed = sanitizeSocialPaste(String(raw || '').trim());
  if (!trimmed) return '';

  let s = trimmed.replace(/^@+/u, '').trim();
  if (!s) return '';

  const hasDomain = /\.[a-z]{2,}/i.test(s) || /\//.test(s);
  const plainHandle = /^[A-Za-z0-9_.-]+$/.test(s) && !hasDomain;

  const buildHttps = () => withHttp(/^https?:\/\//i.test(s) ? s : s.startsWith('//') ? `https:${s}` : `https://${s}`);

  let urlStr = '';

  switch (platformKey) {
    case 'facebook': {
      // Numeric profile id → canonical profile.php URL (handles classic FB links cleanly).
      if (/^[0-9]{8,20}$/.test(s)) {
        urlStr = `https://www.facebook.com/profile.php?id=${encodeURIComponent(s)}`;
        break;
      }
      const idOnlyMatch = /\bid=(\d{5,40})\b/i.exec(s);
      if ((!/^https?:\/\//i.test(s) || !/\./.test(s)) && idOnlyMatch) {
        urlStr = `https://www.facebook.com/profile.php?id=${encodeURIComponent(idOnlyMatch[1])}`;
        break;
      }
      const profilePhpNoHost =
        /^\s*facebook\.com\//i.test(s) ||
        /^\s*www\.facebook\.com\//i.test(s) ||
        /^\s*m\.facebook\.com\//i.test(s);
      if (!/^https?:\/\//i.test(s)) {
        const low = s.toLowerCase();
        if (/^profile\.php\b/i.test(low)) {
          urlStr = withHttp(`www.facebook.com/${s.replace(/^\/+/, '')}`);
          break;
        }
        if (profilePhpNoHost) {
          urlStr = withHttp(
            s.replace(/^\s*(?:facebook\.com\/|www\.facebook\.com\/|m\.facebook\.com\/)?\s*/i, 'www.facebook.com/'),
          );
          break;
        }
      }
      const looksLikeFbProfilePath = /(^|\/)profile\.php\b/i.test(s);
      const looksFbHost = /\b(?:www\.|m\.)?facebook\.com\b/i.test(s) || /\bfb\.(?:me|com)\b/i.test(s);
      // Avoid turning bare numeric IDs into bogus path segments (freeze / wrong destinations).
      if (plainHandle && !/^[0-9]+$/.test(s) && !/[=?&#]/.test(s)) urlStr = `https://www.facebook.com/${encodeURIComponent(s)}`;
      else if (looksLikeFbProfilePath && !looksFbHost)
        urlStr = withHttp(s.startsWith('http') ? s : `https://www.facebook.com/${s.replace(/^\/?/, '')}`);
      else urlStr = buildHttps();
      break;
    }
    case 'instagram':
      if (plainHandle) urlStr = `https://www.instagram.com/${encodeURIComponent(s)}/`;
      else urlStr = buildHttps();
      break;
    case 'twitter':
      if (plainHandle) urlStr = `https://x.com/${encodeURIComponent(s)}`;
      else urlStr = buildHttps();
      break;
    case 'linkedin':
      if (plainHandle) urlStr = `https://www.linkedin.com/in/${encodeURIComponent(s)}`;
      else urlStr = buildHttps();
      break;
    case 'youtube': {
      if (plainHandle) {
        urlStr = /^UC[\w-]{10,}$/i.test(s)
          ? `https://www.youtube.com/channel/${encodeURIComponent(s)}`
          : `https://www.youtube.com/@${encodeURIComponent(s.replace(/^@/, ''))}`;
      } else urlStr = buildHttps();
      break;
    }
    default:
      urlStr = buildHttps();
  }

  try {
    const u = new URL(urlStr);
    const hostRaw = u.hostname.toLowerCase();
    const host = hostRaw.startsWith('www.') ? hostRaw.slice(4) : hostRaw;
    const segments = u.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    const noPath = segments.length === 0;

    const isBareHost = () => noPath && !u.search;

    // Facebook / Meta
    if (host === 'facebook.com' || host === 'm.facebook.com' || host === 'fb.com' || host === 'facebook.me')
      return isBareHost() ? '' : urlStr;
    if (host.endsWith('.facebook.com')) return urlStr;

    if (host === 'instagram.com' || host.endsWith('.instagram.com'))
      return isBareHost() ? '' : urlStr;

    // X / Twitter
    if (host === 'twitter.com' || host === 'x.com' || host === 'mobile.twitter.com') return isBareHost() ? '' : urlStr;

    if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) {
      if (isBareHost()) return '';
      return urlStr;
    }

    if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) {
      if (host === 'youtu.be' && segments.length >= 1) return urlStr;
      /** Site root still shows icon (youtube.com/@… home-style); avoids “missing YouTube chip” confusion. */
      return urlStr;
    }

    return urlStr;
  } catch {
    if (
      platformKey === 'facebook' &&
      /\bfacebook\.com\b|\bfb\.(?:com|me)\b|\bm\.facebook\.com\b/i.test(trimmed.toLowerCase())
    ) {
      return withHttp(trimmed);
    }
    return '';
  }
}

/** Hostnames we treat as acceptable Facebook outbound links after URL parse. */
function isLikelyFacebookHostname(hostname) {
  const raw = String(hostname || '').toLowerCase();
  if (!raw) return false;
  const h = raw.startsWith('www.') ? raw.slice(4) : raw;
  return (
    h === 'facebook.com' ||
    h === 'm.facebook.com' ||
    h === 'fb.com' ||
    h === 'fb.me' ||
    h.endsWith('.facebook.com') ||
    h.endsWith('.fb.com')
  );
}

/**
 * Card display uses this instead of canonical alone so Facebook never drops when subtle parse/quirk occurs.
 */
export function effectiveSocialHref(platformKey, raw) {
  const primary = canonicalSocialUrl(platformKey, raw);
  if (primary) return primary;
  if (platformKey !== 'facebook') return '';
  const t = sanitizeSocialPaste(String(raw || '').trim());
  if (!t) return '';
  try {
    const href = withHttp(t);
    const u = new URL(href);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    if (!isLikelyFacebookHostname(u.hostname)) return '';
    return u.href;
  } catch {
    return '';
  }
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
