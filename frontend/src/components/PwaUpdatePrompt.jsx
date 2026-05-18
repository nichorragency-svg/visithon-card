import React, { useEffect, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import {
  applyPwaUpdate,
  clearPendingPwaRegistration,
  subscribePwaUpdateAvailable,
} from '../pwa/pwaUpdateController';

/**
 * Bottom sheet when a new service worker is installed and waiting (production PWA only).
 */
export default function PwaUpdatePrompt() {
  const [visible, setVisible] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return undefined;
    return subscribePwaUpdateAvailable(() => setVisible(true));
  }, []);

  const onUpdateNow = () => {
    if (applying) return;
    setApplying(true);
    applyPwaUpdate();
  };

  const onDismiss = () => {
    setVisible(false);
    clearPendingPwaRegistration();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[10001] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none"
      role="dialog"
      aria-live="assertive"
      aria-label="App update available"
    >
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-indigo-400/30 bg-slate-950/97 shadow-[0_-12px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-pwa-slide-up">
        <div className="border-b border-white/8 bg-gradient-to-r from-indigo-600/20 to-violet-600/15 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-300/90">
            Visithon Update
          </p>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm font-medium leading-relaxed text-white/92">
            Naya update maujood hai! Behtar performance ke liye abhi update karein.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onUpdateNow}
              disabled={applying}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition active:scale-[0.98] hover:bg-indigo-500 disabled:opacity-70"
            >
              <FaSyncAlt className={applying ? 'animate-spin' : ''} aria-hidden />
              {applying ? 'Updating…' : 'Update Now'}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              disabled={applying}
              className="rounded-xl border border-white/12 px-4 py-3 text-sm font-medium text-white/55 transition active:scale-95 hover:bg-white/5 disabled:opacity-50"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
