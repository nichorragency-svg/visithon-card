import React from 'react';

/** Accessible glass-style switch for wizard rows. */
export default function GlassToggle({ checked, onChange, activeClass = 'bg-emerald-500 shadow-lg shadow-emerald-500/35' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
        checked ? `justify-end ${activeClass}` : 'justify-start bg-white/15'
      }`}
    >
      <span className="pointer-events-none h-6 w-6 rounded-full bg-white shadow-md" />
    </button>
  );
}
