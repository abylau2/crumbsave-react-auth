import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8'));

test('manifest has every field the homework requires', () => {
  for (const key of ['name', 'short_name', 'start_url', 'scope', 'theme_color', 'background_color']) assert.ok(manifest[key], key);
  assert.equal(manifest.display, 'standalone');
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'));
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
  // Relative URLs work under any base path (GitHub Pages serves the app from a sub-folder).
  assert.ok(manifest.start_url.startsWith('./') && manifest.scope === './');
});

test('index.html links the manifest and the app is built with a base-aware href', () => {
  assert.match(readFileSync(join(root, 'index.html'), 'utf8'), /<link rel="manifest" href="%BASE_URL%manifest\.webmanifest"/);
});

function fakeBuild(extra = '') {
  const dir = mkdtempSync(join(tmpdir(), 'sw-'));
  mkdirSync(join(dir, 'assets')); mkdirSync(join(dir, 'images')); mkdirSync(join(dir, 'fonts'));
  writeFileSync(join(dir, 'index.html'), '<html></html>');
  writeFileSync(join(dir, 'offline.html'), '<html>offline' + extra + '</html>');
  writeFileSync(join(dir, 'assets/app-abc.js'), 'console.log(1)');
  writeFileSync(join(dir, 'assets/app-abc.css'), '@font-face{src:url(/fonts/used.woff2)}');
  writeFileSync(join(dir, 'fonts/used.woff2'), 'x'); writeFileSync(join(dir, 'fonts/unused.woff2'), 'x'); writeFileSync(join(dir, 'fonts/LICENSE.txt'), 'x');
  writeFileSync(join(dir, 'images/photo.webp'), 'x');
  writeFileSync(join(dir, '404.html'), '404');
  execFileSync('node', [join(root, 'scripts/build-sw.mjs'), dir], { stdio: 'pipe' });
  return readFileSync(join(dir, 'sw.js'), 'utf8');
}
const field = (sw, re) => sw.match(re)[1];

test('service worker build lists shell files, skips images/404/unused fonts, and versions by content', () => {
  const sw = fakeBuild();
  const files = JSON.parse(field(sw, /PRECACHE_FILES = (\[[\s\S]*?\]);/));
  assert.ok(files.includes('./') && files.includes('offline.html') && files.includes('assets/app-abc.js') && files.includes('assets/app-abc.css'));
  assert.ok(files.includes('fonts/used.woff2'));
  for (const skipped of ['images/photo.webp', '404.html', 'fonts/unused.woff2', 'fonts/LICENSE.txt', 'sw.js']) assert.ok(!files.includes(skipped), skipped);
  assert.equal(fakeBuild(), sw, 'same input gives the same worker');
  assert.notEqual(field(fakeBuild(' changed'), /VERSION = '(.*?)'/), field(sw, /VERSION = '(.*?)'/), 'changed file gives a new version');
});

test('service worker implements the lifecycle, two strategies, cache limits and update message', () => {
  const sw = fakeBuild();
  for (const needle of ["addEventListener('install'", "addEventListener('activate'", "addEventListener('fetch'", 'caches.delete', 'SKIP_WAITING', 'cacheFirst', 'networkFirst', 'MAX_ENTRIES', 'offline.html']) assert.ok(sw.includes(needle), needle);
  assert.ok(!/skipWaiting\(\);\s*\n\}\);/.test(sw.split("addEventListener('install'")[1].split("addEventListener('activate'")[0]), 'install must not skip waiting');
  assert.ok(sw.includes("url.origin !== self.location.origin"), 'cross-origin (Firebase auth) requests are never cached');
});

test('mergePublic takes public fields from the API but keeps local stock', async () => {
  const { mergePublic } = await import('../src/services/publicApi.js');
  const merged = mergePublic({ id: 'fan-001', title: 'Old', price: 1, quantity: 2, image: '/x.webp' }, { id: 'fan-001', title: 'New', price: 5, quantity: 9, image: 'images/a.webp' });
  assert.equal(merged.title, 'New'); assert.equal(merged.price, 5); assert.equal(merged.quantity, 2);
  assert.ok(merged.image.endsWith('images/a.webp') && merged.image.startsWith('/'));
  assert.deepEqual(mergePublic({ id: 'bag-1' }, null), { id: 'bag-1' });
});

test('connection store reports saved data and recovery', async () => {
  const { getConnection, reportData, setOnline } = await import('../src/lib/connection.js');
  setOnline(false); assert.equal(getConnection().online, false);
  reportData({ fromSaved: true, savedAt: '2026-01-01T00:00:00Z' });
  assert.equal(getConnection().savedData, true); assert.equal(getConnection().savedAt, '2026-01-01T00:00:00Z');
  reportData({ fromSaved: false });
  assert.deepEqual([getConnection().online, getConnection().savedData], [true, false]);
});
