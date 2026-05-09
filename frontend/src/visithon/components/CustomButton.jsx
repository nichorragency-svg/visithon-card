import React from 'react';

export default function CustomButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'gradient',
  className = '',
}) {
  const base =
    'w-full rounded-2xl py-3.5 px-4 font-semibold transition active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none flex items-center justify-center gap-2';
  const variants = {
    gradient:
      'border border-white/20 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-fuchsia-500/25 hover:brightness-110 hover:shadow-fuchsia-400/30',
    glass:
      'border border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15',
    primary: 'border border-white/15 bg-violet-600 text-white shadow-lg shadow-violet-900/40',
    indigo: 'border border-white/15 bg-indigo-600 text-white shadow-lg shadow-indigo-900/35',
    ghost: 'border border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:bg-white/10',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.gradient} ${className}`}
    >
      {children}
    </button>
  );
}
