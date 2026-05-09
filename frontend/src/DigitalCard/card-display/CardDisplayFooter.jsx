import React from 'react';

export function CardDisplayFooter({ tokenTheme }) {
  const accentColor = tokenTheme?.accent || '#22d3ee';

  return (
    /* mt-8 se space kam ho jaye gi aur mb-4 bottom edge ke qareeb le aaye ga */
    <div className="mt-8 mb-4 flex flex-col items-center gap-2.5 px-4 text-center">
      
      {/* Sleek separator line */}
      <div 
        className="h-[1.5px] w-12 opacity-40"
        style={{ backgroundColor: accentColor }}
      />
      
      {/* Compact Capsule Tab */}
      <div className="max-w-fit px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-sm">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase">
          <span className="text-white/50">Visithon</span>{' '}
          <span className="text-white/25 font-normal lowercase italic mx-0.5">by</span>{' '}
          <a
            href="https://eventthon.com"
            target="_blank"
            rel="noreferrer"
            className="transition-all duration-300 hover:brightness-125"
            style={{ color: accentColor }}
          >
            EventThon
          </a>
        </p>
      </div>
    </div>
  );
}