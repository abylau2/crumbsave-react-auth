/* CrumbSave service worker (written by hand, no Workbox).
 *
 * This is a TEMPLATE. scripts/build-sw.mjs fills in two placeholders (the version
 * string and the file list, both just below) after `vite build` and writes the
 * result to <build folder>/sw.js:
 *   version   a hash of every pre-cached file, so the worker changes when the app changes
 *   file list the built files (JS, CSS, fonts, icons, offline page...)
 *
 * Caches
 *   crumbsave-precache-<hash>  the app shell. Replaced on every new version.
 *   crumbsave-static-v1        images/icons/fonts seen at runtime   (cache-first, max 80 files)
 *   crumbsave-api-v1           public catalog JSON                  (network-first, max 60 files)
 *
 * Privacy: only same-origin GET requests are handled. Firebase / Google sign-in
 * requests go to other domains, so they never pass through these caches.
 */
const VERSION = 'ca873c382f';
const PRECACHE_FILES = [
  "assets/AboutPage-D59xbkKC.js",
  "assets/BagsPage-BKcE_Hp_.js",
  "assets/DashboardPage-CXlwHmk4.js",
  "assets/LoginPage-Dsmy961H.js",
  "assets/OfflinePage-CUFsqZAl.js",
  "assets/ProfilePage-Oh2ElUU3.js",
  "assets/SignupPage-BS7ql6Aj.js",
  "assets/authValidation-CZTB-lM5.js",
  "assets/firebase-C8PNGfDQ.js",
  "assets/index-Cwoa7SSB.css",
  "assets/index-ufHRP1u-.js",
  "favicon.svg",
  "fonts/fraunces-italic-latin.woff2",
  "fonts/fraunces-latin.woff2",
  "fonts/instrument-sans-latin.woff2",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "./",
  "manifest.webmanifest",
  "offline.html"
];

const PRECACHE = `crumbsave-precache-${VERSION}`;
const STATIC = 'crumbsave-static-v1';
const API = 'crumbsave-api-v1';
const CURRENT_CACHES = [PRECACHE, STATIC, API];
const MAX_ENTRIES = { [STATIC]: 80, [API]: 60 };
const API_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // saved API answers older than a week are not used
const NETWORK_TIMEOUT_MS = 4000;

const SCOPE = self.registration.scope; // e.g. https://user.github.io/crumbsave-react-auth/
const SCOPE_PATH = new URL(SCOPE).pathname;
const SHELL_URL = new URL('./', SCOPE).href;
const OFFLINE_URL = new URL('offline.html', SCOPE).href;
const precacheUrls = PRECACHE_FILES.map((file) => new URL(file, SCOPE).href);

// Routes that the React app knows. They are all answered with the cached app shell
// (index.html); React Router then draws the right page.
const APP_ROUTES = /^(|about|bags|bags\/[^/]+|dashboard|login|signup|profile|add|reservations|offline)$/;

// ---------------------------------------------------------------- install
// Download every shell file into a new, versioned cache. We do NOT call skipWaiting():
// the new worker waits until the user presses "Update" in the app.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(precacheUrls.map((url) => new Request(url, { cache: 'reload' }))))
  );
});

// ---------------------------------------------------------------- activate
// Delete every cache of ours that is not in CURRENT_CACHES (old versions), then take control.
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('crumbsave-') && !CURRENT_CACHES.includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

// The page sends this when the user clicks "Update".
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') event.source?.postMessage({ type: 'VERSION', version: VERSION });
});

// ---------------------------------------------------------------- fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.headers.has('authorization')) return; // never touch authenticated requests
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // Firebase, Google, fonts CDNs: leave alone
  if (!url.pathname.startsWith(SCOPE_PATH)) return;
  if (url.searchParams.has('__ping')) return;        // connectivity checks must hit the real network

  const path = url.pathname.slice(SCOPE_PATH.length);
  if (request.mode === 'navigate') return event.respondWith(handleNavigation(request, path));
  if (path.startsWith('api/')) return event.respondWith(networkFirst(request, API, event));
  if (precacheUrls.includes(url.origin + url.pathname)) return event.respondWith(precached(request));
  if (/^(images|icons|fonts)\//.test(path) || ['image', 'font'].includes(request.destination)) {
    return event.respondWith(cacheFirst(request, STATIC, event));
  }
});

// Page navigations
//  - known app routes  -> cached app shell (instant, works offline)
//  - anything else     -> network, and the offline page if the network fails
async function handleNavigation(request, path) {
  const route = path.replace(/\/+$/, '');
  if (route === 'offline.html') return (await fromPrecache(OFFLINE_URL)) || fetch(request);
  if (APP_ROUTES.test(route)) {
    const shell = await fromPrecache(SHELL_URL);
    if (shell) return shell;
  }
  try {
    return await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
  } catch {
    return (await fromPrecache(OFFLINE_URL)) || new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

// Files from the precache: JS, CSS, fonts, icons, offline page.
async function precached(request) {
  const hit = await fromPrecache(request, { ignoreSearch: true });
  return hit || fetch(request);
}

// Look only in OUR version's cache. (caches.match searches every cache, so an old worker
// could pick up files that a newer, still-waiting worker has already stored.)
async function fromPrecache(request, options) {
  // ignoreVary: some servers send "Vary: Origin", which would make a stored file never match.
  return (await caches.open(PRECACHE)).match(request, { ignoreVary: true, ...options });
}

// Strategy 1 - CACHE-FIRST (images, icons, fonts): answer from the cache; only go to
// the network when the file is not saved yet, then save it for next time.
async function cacheFirst(request, cacheName, event) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      await cache.put(request, response.clone());
      event.waitUntil(trim(cacheName));
    }
    return response;
  } catch {
    if (request.destination === 'image') return offlineImage();
    return Response.error();
  }
}

// Strategy 2 - NETWORK-FIRST (public API JSON): try the network so data is fresh; if it
// fails or is too slow, use the saved copy. Saved answers are marked with headers so the
// app can say "you are viewing saved data".
async function networkFirst(request, cacheName, event) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    if (response.ok && response.status === 200) {
      const stamped = await withHeaders(response.clone(), { 'x-crumbsave-cached-at': new Date().toISOString() });
      await cache.put(request, stamped);
      event.waitUntil(trim(cacheName));
    }
    return response;
  } catch {
    const saved = await cache.match(request, { ignoreVary: true });
    if (saved) {
      const savedAt = saved.headers.get('x-crumbsave-cached-at');
      if (!savedAt || Date.now() - new Date(savedAt).getTime() < API_MAX_AGE_MS) {
        return withHeaders(saved, { 'x-crumbsave-source': 'cache' });
      }
      await cache.delete(request);
    }
    return new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

// ---------------------------------------------------------------- helpers
// Keep each runtime cache small: delete the oldest entries above the limit.
async function trim(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const extra = keys.length - MAX_ENTRIES[cacheName];
  for (let i = 0; i < extra; i += 1) await cache.delete(keys[i]);
}

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(request).then((response) => { clearTimeout(timer); resolve(response); }, (error) => { clearTimeout(timer); reject(error); });
  });
}

// Responses are immutable, so to add headers we build a copy.
async function withHeaders(response, extra) {
  const headers = new Headers(response.headers);
  Object.entries(extra).forEach(([key, value]) => headers.set(key, value));
  return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers });
}

function offlineImage() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#E8EDDF"/><text x="200" y="155" text-anchor="middle" font-family="Arial" font-size="18" fill="#5B685E">Image not saved offline</text></svg>';
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
