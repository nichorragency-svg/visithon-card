import React from 'react';

// Palette mapping function (Brand Colors for Quick Actions)
function getQuickActionColor(key) {
  const mapping = {
    call: '#ffffff',     // Call Icon: White
    email: '#ffffff',    // Email Icon: White
    website: '#ffffff',  // Website Icon: White
    location: '#ffffff', // Location Icon: White
    // Agar koi aur action ho to uska color yahan add kar saktay hain.
  };
  return mapping[key] || '#ffffff';
}

export function CardDisplayQuickActions({ quickActions }) {
  const visible = (quickActions || []).filter((a) => a && a.on);
  if (visible.length === 0) return null;

  return (
    <div className="mt-6 flex w-full flex-col items-center">
      
      {/* Container spacing for minimal icons */}
      <div className="flex flex-nowrap justify-center items-center gap-7 sm:gap-9 px-4">
        {visible.map(({ key, label, Icon, href }) => {
          
          {/* Naya Color Logic: Theme ko ignore kar k ham Brand Color fetch kar rahe hain */}
          const iconColor = getQuickActionColor(key);
          
          return (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <a
                href={href}
                target={key === 'call' || key === 'email' ? undefined : '_blank'}
                rel={key === 'call' || key === 'email' ? undefined : 'noreferrer'}
                className="group relative flex h-14 w-14 touch-manipulation items-center justify-center transition hover:scale-[1.15] active:scale-95"
              >
                {/* 1. Size decrease to text-3xl for single row fix */}
                {/* 2. style={{color: iconColor}} ensures no theme overrides */}
                <Icon 
                  className={`text-3xl sm:text-4xl transition-all duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]`} 
                  style={{ color: iconColor }}
                />
              </a>
              
              {/* Minimal Label */}
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