import React, { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

const DISMISS_KEY = 'visithon_pwa_install_dismissed';

/**
 * Captures `beforeinstallprompt` (Chrome/Edge/Android) and offers one-tap install.
 * iOS: no event — users add via Share → Add to Home Screen (hint shown once).
 */
export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (localStorage.getItem(DISMISS_KEY) === '1') return undefined;
    if (window.matchMedia('(display-mode: standalone)').matches) return undefined;

    const onBip = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBip);

    const ua = navigator.userAgent || '';
    const isIos = /iphone|ipad|ipod/i.test(ua);
    if (isIos && !window.navigator.standalone) {
      setIosHint(true);
      setVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setDeferredPrompt(null);
  };

  const onInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      /* user dismissed */
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur-md"
      role="region"
      aria-label="Install app"
    >
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Install Visithon Card</p>
          <p className="mt-0.5 text-xs text-white/55">
            {iosHint
              ? 'Tap Share, then “Add to Home Screen” for quick access.'
              : 'Add to your home screen for a faster, app-like experience.'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!iosHint && deferredPrompt ? (
            <button
              type="button"
              onClick={() => void onInstall()}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <FaDownload />
              Install
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg border border-white/15 p-2 text-white/70"
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
}
