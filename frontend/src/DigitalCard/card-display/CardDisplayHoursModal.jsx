import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { formatTimeRange12 } from '../../visithon/wizard/wizardTimeFormat';
import { BUSINESS_DAYS } from './styles';

export function CardDisplayHoursModal({
  open,
  onClose,
  user,
  isLightTheme,
  tokenTheme,
  accentInlineStyle,
}) {
  if (!open || !user?.business_hours) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center ${
        isLightTheme ? 'bg-slate-900/50' : 'bg-[#070d1a]/125'
      } p-4 pb-10 backdrop-blur-sm sm:items-center sm:pb-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hours-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(78vh,28rem)] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0d1425] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3.5">
          <h2 id="hours-modal-title" className="text-lg font-bold tracking-tight text-white">
            Business hours
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/80 transition hover:bg-white/[0.1]"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {BUSINESS_DAYS.map(({ key, label }) => {
            const row = user.business_hours[key];
            if (!row || typeof row !== 'object') return null;
            const on = !!row.enabled;
            const range = formatTimeRange12(row.open, row.close);
            return (
              <li
                key={key}
                className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 last:mb-0"
              >
                <span className={`text-sm font-medium ${on ? 'text-white/90' : 'text-white/40'}`}>
                  {label}
                </span>
                <span
                  className={`shrink-0 text-xs font-semibold sm:text-sm ${
                    on ? (tokenTheme ? '' : 'text-sky-200/95') : 'text-white/38'
                  }`}
                  style={on && tokenTheme ? accentInlineStyle : undefined}
                >
                  {on ? range : 'Closed'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
