import React from 'react';

function getQuickActionColor(key) {
  const mapping = {
    call: '#ffffff',
    email: '#ffffff',
    web: '#ffffff',
    loc: '#ffffff',
  };
  return mapping[key] || '#ffffff';
}

export function CardDisplayQuickActions({ quickActions }) {
  const visible = (quickActions || []).filter((a) => a && a.on);
  if (visible.length === 0) return null;

  return (
    <div className="mt-6 flex w-full flex-col items-center">
      <div className="flex flex-nowrap items-center justify-center gap-7 px-4 sm:gap-9">
        {visible.map(({ key, label, Icon, href }) => {
          const iconColor = getQuickActionColor(key);
          return (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <a
                href={href}
                target={key === 'call' || key === 'email' ? undefined : '_blank'}
                rel={key === 'call' || key === 'email' ? undefined : 'noreferrer'}
                className="group relative flex h-14 w-14 touch-manipulation items-center justify-center transition hover:scale-[1.15] active:scale-95"
              >
                <Icon
                  className="text-3xl sm:text-4xl transition-all duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                  style={{ color: iconColor }}
                />
              </a>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40 transition-colors group-hover:text-white/70">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
