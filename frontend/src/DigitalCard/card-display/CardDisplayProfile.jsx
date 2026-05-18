import React from 'react';
import { resolveAvatar } from './helpers';

const Dot = ({ light }) => (
  <span
    className={`mx-1 shrink-0 select-none whitespace-nowrap sm:mx-1.5 ${light ? 'text-slate-300' : 'text-white/25'}`}
  >
    ·
  </span>
);

export function CardDisplayProfile({
  user,
  isLightTheme,
  accentInlineStyle,
  avatarRingClass,
  avatarRingStyle,
  hasBusinessHours,
  onHoursClick,
  hasServices,
  onServicesClick,
  hasAccount,
  onAccountClick,
}) {
  const bioTrimmed = user.bio?.trim() || '';

  const linkRowBase =
    'touch-manipulation whitespace-nowrap text-[11px] font-semibold underline underline-offset-[3px] transition hover:opacity-90 active:opacity-80 sm:text-xs';
  
  const clockCls = `${linkRowBase} ${isLightTheme ? 'text-sky-600 decoration-sky-500/55' : 'text-sky-300 decoration-sky-400/45'}`;
  const servicesCls = `${linkRowBase} ${isLightTheme ? 'text-emerald-600 decoration-emerald-500/55' : 'text-emerald-300 decoration-emerald-400/45'}`;
  const accountCls = `${linkRowBase} ${isLightTheme ? 'text-violet-600 decoration-violet-500/55' : 'text-violet-300 decoration-violet-400/45'}`;

  const roleTxt = (user.role || '').trim();

  return (
    <section
      className={`overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md ${
        isLightTheme ? 'border-slate-300/55 bg-white/80' : 'border-white/12 bg-white/[0.06]'
      }`}
    >
      <div className="p-4 pb-3">
        <div className="flex gap-4 sm:gap-5">
          {/* Avatar Section */}
          <div className="flex w-[5.85rem] shrink-0 flex-col sm:w-[6.35rem]">
            <div className={`rounded-full shadow-lg ${avatarRingClass}`} style={avatarRingStyle}>
              <div className="rounded-full bg-slate-900 p-[2.5px]">
                <img
                  src={resolveAvatar(user)}
                  alt=""
                  className="aspect-square w-full rounded-full object-cover ring-1 ring-white/20"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://placehold.co/200x200/0f172a/64748b?text=V';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="min-w-0 flex-1 pt-1">
            {/* 1. Name: Standard Silver/White Gradient (Clean & Professional) */}
            <h2
              className={`text-xl font-bold leading-tight tracking-tight sm:text-2xl ${
                isLightTheme 
                  ? 'text-slate-900' 
                  : 'bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent'
              }`}
            >
              {user.name}
            </h2>

            {/* Links Row */}
            <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-0.5 gap-y-1">
              {hasBusinessHours && (
                <button type="button" className={clockCls} onClick={onHoursClick}>Timing</button>
              )}
              {hasBusinessHours && hasServices && <Dot light={isLightTheme} />}
              {hasServices && (
                <button type="button" className={servicesCls} onClick={onServicesClick}>Services</button>
              )}
              {(hasBusinessHours || hasServices) && hasAccount && <Dot light={isLightTheme} />}
              {hasAccount && (
                <button type="button" className={accountCls} onClick={onAccountClick}>Account</button>
              )}
            </div>

            {/* 2. Company Name: Accent Color */}
            {(user.company || '').trim() ? (
              <p
                className="mt-3 text-[13px] font-bold uppercase tracking-[0.1em]"
                style={accentInlineStyle}
              >
                {(user.company || '').trim()}
              </p>
            ) : null}

            {/* 3. Title/Role: Increased Font Size & Better Visibility */}
            {roleTxt ? (
              <p
                className={`mt-1 text-sm font-medium ${isLightTheme ? 'text-slate-600' : 'text-slate-300'}`}
              >
                {roleTxt}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {bioTrimmed ? (
        <div className={`px-4 py-3 ${isLightTheme ? 'bg-slate-50/50' : 'bg-black/20'}`}>
          <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-slate-700' : 'text-white/80'}`}>
            {bioTrimmed}
          </p>
        </div>
      ) : null}
    </section>
  );
}