/**
 * Tailwind class bundles per theme id — must match backend `_THEME_CATALOG` ids.
 * Keeps JIT-friendly full strings in source; admin API later returns ids + copy only.
 */
export const THEME_STYLE_BY_ID = {
  professional: {
    preview: 'from-sky-500 via-blue-800 to-slate-950',
    ring: 'ring-sky-400/60',
    glow: 'shadow-sky-500/30',
  },
  elegant: {
    preview: 'from-amber-400 via-yellow-700 to-stone-950',
    ring: 'ring-amber-400/60',
    glow: 'shadow-amber-400/25',
  },
  dark_modern: {
    preview: 'from-slate-700 via-slate-900 to-black',
    ring: 'ring-slate-400/50',
    glow: 'shadow-slate-400/20',
  },
  minimal_light: {
    preview: 'from-zinc-100 via-slate-200 to-slate-400',
    ring: 'ring-white/50',
    glow: 'shadow-white/15',
  },
  creative_vibrant: {
    preview: 'from-fuchsia-600 via-purple-600 to-indigo-900',
    ring: 'ring-fuchsia-400/60',
    glow: 'shadow-fuchsia-500/35',
  },
  nature_green: {
    preview: 'from-emerald-500 via-green-700 to-slate-950',
    ring: 'ring-emerald-400/55',
    glow: 'shadow-emerald-500/30',
  },
};
