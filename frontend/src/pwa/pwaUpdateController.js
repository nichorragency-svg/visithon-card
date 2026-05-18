/** Tracks the SW registration with a waiting worker; bridges registration → React UI. */

let pendingRegistration = null;
const EVENT_NAME = 'visithon-pwa-update-available';

export function notifyPwaUpdateAvailable(registration) {
  if (!registration?.waiting) return;
  pendingRegistration = registration;
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getPendingPwaRegistration() {
  return pendingRegistration;
}

export function clearPendingPwaRegistration() {
  pendingRegistration = null;
}

export function subscribePwaUpdateAvailable(listener) {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

/**
 * Tell the waiting service worker to activate, then reload when it takes control.
 */
export function applyPwaUpdate() {
  const registration = pendingRegistration;
  const waiting = registration?.waiting;
  if (!waiting) {
    window.location.reload();
    return;
  }

  let reloaded = false;
  const onControllerChange = () => {
    if (reloaded) return;
    reloaded = true;
    navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
  waiting.postMessage({ type: 'SKIP_WAITING' });

  window.setTimeout(() => {
    if (!reloaded) {
      reloaded = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      window.location.reload();
    }
  }, 2500);
}
