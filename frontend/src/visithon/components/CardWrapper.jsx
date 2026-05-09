import React from 'react';

export default function CardWrapper({
  title,
  subtitle,
  children,
  footer,
  bgClassName = '',
  titleClassName = 'bg-gradient-to-r from-white via-fuchsia-100 to-cyan-100 bg-clip-text text-2xl font-bold tracking-tight text-transparent',
  alignTitle = 'center',
}) {
  const titleAlign = alignTitle === 'left' ? 'text-left' : 'text-center';
  const base = bgClassName || 'bg-transparent';
  return (
    <div className={`flex min-h-screen w-full flex-col ${base}`}>
      <header className={`w-full shrink-0 px-5 pt-10 pb-2 ${titleAlign}`}>
        {title && <h1 className={titleClassName}>{title}</h1>}
        {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
      </header>
      <main className="mx-auto w-full max-w-md flex-1 min-h-0 overflow-y-auto px-5 pb-4">{children}</main>
      {footer && (
        <footer className="mt-auto w-full shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
          {footer}
        </footer>
      )}
    </div>
  );
}
