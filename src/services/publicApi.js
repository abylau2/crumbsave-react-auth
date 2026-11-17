// Reads the public catalog over HTTP (see scripts/generate-api.mjs).
// The service worker caches these requests (network-first) so they work offline.
// Any failure returns null, so the caller can fall back to data saved in this browser.
import { reportData } from '../lib/connection.js';

const BASE = (typeof import.meta.env === 'object' && import.meta.env.BASE_URL) || '/';
const url = (path) => `${BASE}api/${path}`;
export const withBase = (path) => (/^(https?:)?\/\//.test(path) || path.startsWith('/') ? path : `${BASE}${path}`);

async function getJson(path, signal) {
  if (typeof fetch !== 'function') return null;
  try {
    const response = await fetch(url(path), { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    // The service worker marks answers that came from its cache with these headers.
    const fromSaved = response.headers.get('x-crumbsave-source') === 'cache';
    const data = await response.json();
    reportData({ fromSaved, savedAt: response.headers.get('x-crumbsave-cached-at') });
    return data;
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    reportData({ fromSaved: true });
    return null;
  }
}

export const fetchPublicCatalog = (signal) => getJson('bags.json', signal).then((data) => (Array.isArray(data?.bags) ? data.bags : null));
export const fetchPublicBag = (id, signal) => getJson(`bags/${encodeURIComponent(id)}.json`, signal).then((data) => data?.bag ?? null);

// Public fields (title, price, picture...) come from the API. Stock is per browser,
// so quantity always comes from the saved copy. Bags the user created exist only locally.
export function mergePublic(local, remote) {
  if (!remote) return local;
  return { ...local, ...remote, quantity: local.quantity, image: withBase(remote.image) };
}
