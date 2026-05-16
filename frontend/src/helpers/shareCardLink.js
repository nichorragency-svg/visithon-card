const TOAST_ID = 'visithon-share-toast';
const TOAST_DURATION_MS = 2800;

export function showToast(message) {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById(TOAST_ID);
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = TOAST_ID;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = message;
  Object.assign(el.style, {
    position: 'fixed',
    left: '50%',
    bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
    transform: 'translateX(-50%)',
    zIndex: '10000',
    maxWidth: 'min(22rem, calc(100vw - 2rem))',
    padding: '0.75rem 1.125rem',
    borderRadius: '0.875rem',
    border: '1px solid rgba(52, 211, 153, 0.35)',
    background: 'rgba(2, 6, 23, 0.94)',
    color: '#ecfdf5',
    fontSize: '0.875rem',
    fontWeight: '600',
    lineHeight: '1.35',
    textAlign: 'center',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(12px)',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  });

  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(-4px)';
  });

  window.setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(0)';
    window.setTimeout(() => el.remove(), 220);
  }, TOAST_DURATION_MS);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* secure context / permission — try legacy */
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Native share on capable mobile browsers; otherwise copy link + toast.
 * @param {{ title?: string, url?: string, text?: string }} options
 */
export async function shareCardLink(options = {}) {
  const url =
    (options.url && String(options.url).trim()) ||
    (typeof window !== 'undefined' ? window.location.href : '');
  if (!url) return;

  const title = options.title || 'Visithon Card';
  const canShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  if (canShare) {
    try {
      await navigator.share({
        title,
        text: options.text,
        url,
      });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }

  const copied = await copyTextToClipboard(url);
  if (copied) {
    showToast('Link copied to clipboard!');
  } else {
    showToast('Could not copy link. Please copy the URL from the address bar.');
  }
}
