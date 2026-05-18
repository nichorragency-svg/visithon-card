// Registers `public/service-worker.js` (copied to build root on `npm run build`).

import { notifyPwaUpdateAvailable } from './pwa/pwaUpdateController';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
);

function handleWaitingWorker(registration, config) {
  if (!registration?.waiting) return;
  if (config?.onUpdate) {
    config.onUpdate(registration);
  }
  notifyPwaUpdateAvailable(registration);
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      handleWaitingWorker(registration, config);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        installingWorker.onstatechange = () => {
          if (installingWorker.state !== 'installed') return;
          if (navigator.serviceWorker.controller) {
            handleWaitingWorker(registration, config);
          } else if (config?.onSuccess) {
            config.onSuccess(registration);
          }
        };
      };

      const checkForUpdates = () => {
        registration.update().catch(() => {});
      };

      window.addEventListener('focus', checkForUpdates);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdates();
      });

      window.setInterval(checkForUpdates, 60 * 60 * 1000);
    })
    .catch((error) => {
      console.error('Service worker registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection. App is running in offline mode.');
    });
}

export function register(config) {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
    return;
  }

  const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

  if (isLocalhost) {
    checkValidServiceWorker(swUrl, config);
  } else {
    registerValidSW(swUrl, config);
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch(() => {});
  }
}
