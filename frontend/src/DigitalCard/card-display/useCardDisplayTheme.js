import {
  ACTION_TILE_STYLES,
  ACTION_TILE_STYLES_BY_THEME,
  CARD_THEME_UI,
  QUICK_ACTION_STYLES,
  QUICK_ACTION_STYLES_BY_THEME,
  THEME_CATEGORY_TO_PRESET_ID,
} from './styles';
import { hexToRgb, pickEffectiveUiTokens, shellGradientBackground } from './helpers';

/** Pure resolver: preset + Mongo `ui_tokens` → Tailwind/CSS pieces (safe during render). */
export function getCardDisplayTheme(user) {
  const selectedThemeId = user?.profile?.step1?.theme || 'professional';
  const categoryHint = String(user?.selected_theme?.category || '')
    .toLowerCase()
    .trim();
  const resolvedPresetId =
    selectedThemeId in CARD_THEME_UI
      ? selectedThemeId
      : THEME_CATEGORY_TO_PRESET_ID[categoryHint] || 'professional';
  const selectedTheme = CARD_THEME_UI[resolvedPresetId] || CARD_THEME_UI.professional;
  const tokenTheme = pickEffectiveUiTokens(user?.selected_theme);
  const tokenMode = String(tokenTheme?.text_mode || '').toLowerCase();
  const isLightTheme = tokenMode ? tokenMode === 'light' : resolvedPresetId === 'minimal_light';
  const quickActionPalette =
    QUICK_ACTION_STYLES_BY_THEME[resolvedPresetId] || QUICK_ACTION_STYLES;
  const actionTilePalette =
    ACTION_TILE_STYLES_BY_THEME[resolvedPresetId] || ACTION_TILE_STYLES;
  const stSvTile = actionTilePalette.save;
  const stWaTile = actionTilePalette.whatsapp;
  const stSvcTile = actionTilePalette.services;
  const stShopTile = actionTilePalette.shop;
  const mainTextClass = isLightTheme ? 'text-slate-900' : 'text-white';
  const cardBorderClass = isLightTheme ? 'border-slate-300/70' : 'border-white/12';
  const pageInlineStyle = tokenTheme
    ? { backgroundColor: tokenTheme.page_bg || undefined }
    : undefined;
  const shellInlineStyle = tokenTheme
    ? { backgroundImage: shellGradientBackground(tokenTheme) }
    : undefined;
  const headerInlineStyle = tokenTheme
    ? { backgroundColor: tokenTheme.header_bg || undefined }
    : undefined;
  const accentInlineStyle = tokenTheme
    ? { color: tokenTheme.accent || undefined }
    : undefined;
  const accentRgb = hexToRgb(tokenTheme?.accent || '');
  const pageAmbientClass = tokenTheme
    ? 'bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(255,255,255,0.07),transparent_58%)]'
    : selectedTheme.pageGlow;
  const avatarRingClass = tokenTheme
    ? 'p-[3px] shadow-[0_0_20px_rgba(0,0,0,0.35)]'
    : 'bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-[3px] shadow-[0_0_22px_rgba(99,102,241,0.28)]';
  const avatarRingStyle =
    tokenTheme && accentRgb
      ? {
          background: `linear-gradient(135deg, ${String(tokenTheme.shell_from || '#f59e0b').trim()} 0%, ${String(tokenTheme.accent).trim()} 45%, ${String(tokenTheme.shell_to || '#431407').trim()} 100%)`,
        }
      : undefined;
  const tileInnerStyle =
    accentRgb
      ? isLightTheme
        ? {
            backgroundColor: 'rgba(255,255,255,0.86)',
            border: `1px solid rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.45)`,
          }
        : {
            backgroundColor: `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.26)`,
            border: `1px solid rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.55)`,
          }
      : undefined;
  const showcaseFrameStyle =
    accentRgb && tokenTheme
      ? {
          backgroundColor: '#141210',
          borderColor: `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.5)`,
        }
      : accentRgb
        ? isLightTheme
          ? {
              backgroundColor: 'rgba(255,255,255,0.82)',
              borderColor: 'rgba(15,23,42,0.18)',
            }
          : {
              backgroundColor: '#111827',
              borderColor: `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.35)`,
            }
        : undefined;

  return {
    selectedTheme,
    resolvedPresetId,
    tokenTheme,
    isLightTheme,
    quickActionPalette,
    actionTilePalette,
    stSvTile,
    stWaTile,
    stSvcTile,
    stShopTile,
    mainTextClass,
    cardBorderClass,
    pageInlineStyle,
    shellInlineStyle,
    headerInlineStyle,
    accentInlineStyle,
    accentRgb,
    pageAmbientClass,
    avatarRingClass,
    avatarRingStyle,
    tileInnerStyle,
    showcaseFrameStyle,
  };
}
