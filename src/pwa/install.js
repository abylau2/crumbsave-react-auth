// Chrome/Edge/Android fire "beforeinstallprompt" when the app is installable.
// We keep the event so our own "Install app" button can open the browser's install dialog.
import { useSyncExternalStore } from 'react';

let deferred = null;
let snapshot = { canInstall: false };
const listeners = new Set();
const emit = (canInstall) => { snapshot = { canInstall }; listeners.forEach((listener) => listener()); };

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferred = event; emit(true); });
  window.addEventListener('appinstalled', () => { deferred = null; emit(false); });
}

export const useInstallPrompt = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => snapshot, () => snapshot);

export async function promptInstall() {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice.catch(() => {});
  deferred = null;
  emit(false);
}
