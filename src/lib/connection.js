// Small store that answers two questions for the whole app:
//   1. Is the network reachable?          -> online
//   2. Are we showing saved (cached) data? -> savedData
// React components read it with useConnection(); the service layer writes to it.
import { useSyncExternalStore } from 'react';

const hasNavigator = typeof navigator !== 'undefined';
let state = { online: hasNavigator && typeof navigator.onLine === 'boolean' ? navigator.onLine : true, savedData: false, savedAt: null };
const listeners = new Set();

function update(patch) {
  const next = { ...state, ...patch };
  if (next.online === state.online && next.savedData === state.savedData && next.savedAt === state.savedAt) return;
  state = next;
  listeners.forEach((listener) => listener());
}

export const getConnection = () => state;
export const subscribeConnection = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export function useConnection() { return useSyncExternalStore(subscribeConnection, getConnection, getConnection); }

export const setOnline = (online) => update({ online });
// Called after every catalog request. `fromSaved` is true when the data came from the
// service worker cache (or from this browser) because the network request failed.
export const reportData = ({ fromSaved, savedAt = null }) => update(fromSaved ? { savedData: true, savedAt } : { savedData: false, savedAt: null, online: true });

// A real reachability check. navigator.onLine only says "some network adapter exists".
export async function checkConnection(base = '/') {
  try {
    const response = await fetch(`${base}manifest.webmanifest?__ping=${Date.now()}`, { cache: 'no-store' });
    setOnline(response.ok);
    return response.ok;
  } catch {
    setOnline(false);
    return false;
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('offline', () => setOnline(false));
  window.addEventListener('online', () => checkConnection(import.meta.env?.BASE_URL ?? '/'));
}
