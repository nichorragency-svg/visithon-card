import React from 'react';
import { FaTimes, FaWhatsapp } from 'react-icons/fa';

export function CardDisplayServicesModal({
  open,
  onClose,
  user,
  tileRowWaPhone,
  tokenTheme,
  onWhatsAppAllServices,
}) {
  if (!open || !user.services?.length) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#070d1a]/150 p-4 pb-10 backdrop-blur-sm sm:items-center sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="services-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(78vh,28rem)] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0d1425] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3.5">
          <h2 id="services-modal-title" className="text-lg font-bold tracking-tight text-white">
            Services
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
          {user.services.map((svc, idx) => (
            <li
              key={svc.id || `${svc.name}-${idx}`}
              className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 last:mb-0"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${tokenTheme ? '' : 'bg-cyan-400/90'}`}
                style={tokenTheme?.accent ? { backgroundColor: tokenTheme.accent } : undefined}
                aria-hidden
              />
              <span className="text-sm font-medium leading-snug text-white/90">{svc.name}</span>
            </li>
          ))}
        </ul>
        {tileRowWaPhone.length > 0 ? (
          <div className="shrink-0 border-t border-white/10 px-4 pb-5 pt-4">
            <button
              type="button"
              onClick={onWhatsAppAllServices}
              className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-500/15 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 active:opacity-95"
            >
              <FaWhatsapp className="text-lg" aria-hidden />
              Ask on WhatsApp
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
