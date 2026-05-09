/** Preset palettes + layout tokens — used by theme resolution (mobile-safe, no viewport hacks). */

export const QUICK_ACTION_STYLES = [
  { ring: 'from-sky-400/50 to-blue-600/40', icon: 'text-sky-300' },
  { ring: 'from-fuchsia-400/50 to-pink-600/40', icon: 'text-fuchsia-300' },
  { ring: 'from-emerald-400/50 to-teal-600/40', icon: 'text-emerald-300' },
  { ring: 'from-amber-400/50 to-orange-600/40', icon: 'text-amber-300' },
];

export const QUICK_ACTION_STYLES_BY_THEME = {
  professional: QUICK_ACTION_STYLES,
  elegant: [
    { ring: 'from-amber-300/70 to-orange-500/55', icon: 'text-amber-100' },
    { ring: 'from-yellow-300/65 to-amber-500/55', icon: 'text-yellow-100' },
    { ring: 'from-orange-300/65 to-amber-600/55', icon: 'text-orange-100' },
    { ring: 'from-amber-200/70 to-yellow-500/60', icon: 'text-amber-50' },
  ],
  dark_modern: [
    { ring: 'from-slate-400/45 to-slate-700/55', icon: 'text-slate-200' },
    { ring: 'from-zinc-400/45 to-zinc-700/55', icon: 'text-zinc-200' },
    { ring: 'from-gray-400/45 to-gray-700/55', icon: 'text-gray-200' },
    { ring: 'from-slate-300/45 to-slate-800/55', icon: 'text-slate-100' },
  ],
  minimal_light: [
    { ring: 'from-sky-300/70 to-blue-500/55', icon: 'text-sky-700' },
    { ring: 'from-indigo-300/70 to-violet-500/55', icon: 'text-indigo-700' },
    { ring: 'from-emerald-300/70 to-teal-500/55', icon: 'text-emerald-700' },
    { ring: 'from-amber-300/70 to-orange-500/55', icon: 'text-amber-700' },
  ],
  creative_vibrant: [
    { ring: 'from-fuchsia-400/70 to-pink-600/55', icon: 'text-fuchsia-100' },
    { ring: 'from-violet-400/70 to-purple-700/55', icon: 'text-violet-100' },
    { ring: 'from-cyan-400/70 to-blue-700/55', icon: 'text-cyan-100' },
    { ring: 'from-rose-400/70 to-fuchsia-700/55', icon: 'text-rose-100' },
  ],
  nature_green: [
    { ring: 'from-emerald-400/70 to-green-700/55', icon: 'text-emerald-100' },
    { ring: 'from-lime-400/70 to-emerald-700/55', icon: 'text-lime-100' },
    { ring: 'from-teal-400/70 to-cyan-700/55', icon: 'text-teal-100' },
    { ring: 'from-green-300/70 to-emerald-600/55', icon: 'text-green-100' },
  ],
};

export const SOCIAL_STYLES = {
  facebook: { ring: 'from-blue-500/60 to-blue-800/45', icon: 'text-sky-300' },
  instagram: { ring: 'from-pink-500/55 via-purple-500/45 to-amber-400/40', icon: 'text-pink-300' },
  youtube: { ring: 'from-red-500/55 to-red-900/45', icon: 'text-red-300' },
  linkedin: { ring: 'from-sky-500/55 to-blue-900/45', icon: 'text-sky-300' },
  twitter: { ring: 'from-slate-500/45 to-slate-900/50', icon: 'text-slate-200' },
  custom: { ring: 'from-violet-500/55 to-fuchsia-700/45', icon: 'text-violet-300' },
};

export const ACTION_TILE_STYLES = {
  save: { ring: 'from-indigo-500/60 to-blue-900/45', icon: 'text-sky-200' },
  whatsapp: { ring: 'from-emerald-500/60 to-teal-900/45', icon: 'text-emerald-200' },
  services: { ring: 'from-amber-500/60 to-orange-900/45', icon: 'text-amber-200' },
  shop: { ring: 'from-fuchsia-500/60 to-violet-900/45', icon: 'text-fuchsia-200' },
};

export const ACTION_TILE_STYLES_BY_THEME = {
  professional: ACTION_TILE_STYLES,
  elegant: {
    save: { ring: 'from-amber-400/60 to-orange-700/45', icon: 'text-amber-100' },
    whatsapp: { ring: 'from-yellow-400/60 to-amber-700/45', icon: 'text-yellow-100' },
    services: { ring: 'from-orange-400/60 to-amber-800/45', icon: 'text-orange-100' },
    shop: { ring: 'from-amber-300/60 to-yellow-700/45', icon: 'text-amber-100' },
  },
  dark_modern: {
    save: { ring: 'from-slate-500/60 to-slate-900/45', icon: 'text-slate-100' },
    whatsapp: { ring: 'from-zinc-500/60 to-zinc-900/45', icon: 'text-zinc-100' },
    services: { ring: 'from-gray-500/60 to-gray-900/45', icon: 'text-gray-100' },
    shop: { ring: 'from-slate-400/60 to-black/55', icon: 'text-slate-100' },
  },
  minimal_light: {
    save: { ring: 'from-sky-300/70 to-blue-500/50', icon: 'text-sky-700' },
    whatsapp: { ring: 'from-emerald-300/70 to-teal-500/50', icon: 'text-emerald-700' },
    services: { ring: 'from-amber-300/70 to-orange-500/50', icon: 'text-amber-700' },
    shop: { ring: 'from-indigo-300/70 to-violet-500/50', icon: 'text-indigo-700' },
  },
  creative_vibrant: {
    save: { ring: 'from-fuchsia-500/60 to-violet-900/45', icon: 'text-fuchsia-100' },
    whatsapp: { ring: 'from-cyan-500/60 to-blue-900/45', icon: 'text-cyan-100' },
    services: { ring: 'from-rose-500/60 to-fuchsia-900/45', icon: 'text-rose-100' },
    shop: { ring: 'from-violet-500/60 to-indigo-900/45', icon: 'text-violet-100' },
  },
  nature_green: {
    save: { ring: 'from-emerald-500/60 to-green-900/45', icon: 'text-emerald-100' },
    whatsapp: { ring: 'from-lime-500/60 to-emerald-900/45', icon: 'text-lime-100' },
    services: { ring: 'from-teal-500/60 to-cyan-900/45', icon: 'text-teal-100' },
    shop: { ring: 'from-green-500/60 to-emerald-900/45', icon: 'text-green-100' },
  },
};

export const CARD_THEME_UI = {
  professional: {
    pageBg: 'bg-[#030712]',
    pageGlow: 'bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(59,130,246,0.1),transparent_55%)]',
    shell: 'from-slate-900/90 via-[#0a0f1f]/95 to-slate-950',
    header: 'bg-[#070d1a]/75',
    title: 'from-cyan-200 via-sky-200 to-indigo-200',
  },
  elegant: {
    pageBg: 'bg-[#1b1408]',
    pageGlow: 'bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(251,191,36,0.16),transparent_58%)]',
    shell: 'from-[#2a1d0b]/95 via-[#3b2a12]/95 to-[#1b1408]/95',
    header: 'bg-[#2a1d0b]/75',
    title: 'from-amber-100 via-yellow-200 to-orange-200',
  },
  dark_modern: {
    pageBg: 'bg-[#020617]',
    pageGlow: 'bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(148,163,184,0.09),transparent_58%)]',
    shell: 'from-slate-900/95 via-[#0b1020]/95 to-black',
    header: 'bg-[#060a14]/78',
    title: 'from-slate-100 via-zinc-200 to-slate-300',
  },
  minimal_light: {
    pageBg: 'bg-[#f1f5f9]',
    pageGlow: 'bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(148,163,184,0.22),transparent_58%)]',
    shell: 'from-slate-100/95 via-white/95 to-slate-200/95',
    header: 'bg-white/80',
    title: 'from-slate-700 via-slate-800 to-zinc-700',
  },
  creative_vibrant: {
    pageBg: 'bg-[#180428]',
    pageGlow: 'bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(236,72,153,0.22),transparent_58%)]',
    shell: 'from-fuchsia-950/90 via-violet-950/95 to-indigo-950/95',
    header: 'bg-[#2a0d45]/70',
    title: 'from-fuchsia-200 via-violet-200 to-cyan-200',
  },
  nature_green: {
    pageBg: 'bg-[#052017]',
    pageGlow: 'bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(16,185,129,0.22),transparent_58%)]',
    shell: 'from-emerald-950/90 via-teal-950/95 to-slate-950',
    header: 'bg-[#073225]/72',
    title: 'from-emerald-100 via-lime-100 to-teal-100',
  },
};

export const THEME_CATEGORY_TO_PRESET_ID = {
  professional: 'professional',
  modern: 'dark_modern',
  creative: 'creative_vibrant',
  healthcare: 'nature_green',
};

/** Matches backend `digital_card.wizard._DAYS_ORDER`. */
export const BUSINESS_DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const SOCIAL_DISPLAY_ORDER = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'custom'];
