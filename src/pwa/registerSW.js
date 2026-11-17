// Registers the service worker and tells the app when an update is waiting.
//
// Update flow:
//   1. The browser checks sw.js (on load, hourly, and when the tab becomes visible).
//   2. If sw.js changed, the new worker installs and then WAITS (it never skips waiting alone).
//   3. We show "A new version is ready". When the user presses Update we send SKIP_WAITING.
//   4. The new worker activates, deletes old caches, takes control -> we reload once.
import { useSyncExternalStore } from 'react';

const BASE = import.meta.env.BASE_URL;
let state = { updateReady: false, offlineReady: false };
let registration = null;
let userAskedForUpdate = false;
const listeners = new Set();

function set(patch) { state = { ...state, ...patch }; listeners.forEach((listener) => listener()); }
export const useServiceWorkerStatus = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => state);

function watch(worker) {
  worker.addEventListener('statechange', () => {
    // "installed" while an old worker still controls the page = this is an UPDATE, not the first install.
    if (worker.state === 'installed' && navigator.serviceWorker.controller) set({ updateReady: true });
    if (worker.state === 'installed' && !navigator.serviceWorker.controller) set({ offlineReady: true });
  });
}

export function applyUpdate() {
  userAskedForUpdate = true;
  registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
}

export function dismissUpdate() { set({ updateReady: false }); }

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  // Reload exactly once, and only when the user asked for the update
  // (the very first install also fires "controllerchange" and must not reload the page).
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (userAskedForUpdate) window.location.reload();
  });
  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE });
      if (registration.waiting && navigator.serviceWorker.controller) set({ updateReady: true });
      if (registration.installing) watch(registration.installing);
      registration.addEventListener('updatefound', () => registration.installing && watch(registration.installing));
      const check = () => registration.update().catch(() => {});
      setInterval(check, 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  });
}
