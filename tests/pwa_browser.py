"""End-to-end check of the PWA features (needs Playwright + Chrome).
Run:  npm run build && python3 tests/pwa_browser.py     (set CHROME_PATH to override the browser)

It serves the production build, installs the service worker, goes offline and checks
the offline page, cached data, cache limits, and the update flow.
"""
import json, os, re, subprocess, sys, time, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
CHROME = os.environ.get('CHROME_PATH') or next((p for p in ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'] if Path(p).exists()), None)
PORT = 4199
BASE = f'http://127.0.0.1:{PORT}'
server = subprocess.Popen(['npx', 'vite', 'preview', '--host', '127.0.0.1', '--port', str(PORT), '--strictPort'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(60):
    try: urllib.request.urlopen(BASE); break
    except Exception: time.sleep(0.5)

results = []
def check(name, ok, detail=''):
    results.append(ok); print(('PASS' if ok else 'FAIL'), name, detail if not ok else '')

def sw_version(page):
    return page.evaluate("""async () => { const r = await navigator.serviceWorker.getRegistration(); const w = r.active;
      return new Promise((res) => { navigator.serviceWorker.addEventListener('message', (e) => e.data.type === 'VERSION' && res(e.data.version), { once: true }); w.postMessage({ type: 'GET_VERSION' }); }); }""")

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        ctx = browser.new_context(viewport={'width': 1200, 'height': 900})
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))

        # ---- manifest + installability basics
        page.goto(BASE + '/')
        manifest_href = page.get_attribute('link[rel=manifest]', 'href')
        check('index.html links the manifest', bool(manifest_href), manifest_href)
        m = json.loads(urllib.request.urlopen(BASE + '/' + manifest_href.lstrip('/')).read())
        for key in ['name', 'short_name', 'start_url', 'scope', 'theme_color', 'background_color']:
            check(f'manifest has {key}', bool(m.get(key)))
        check('manifest display is standalone', m.get('display') == 'standalone')
        sizes = {i['sizes'] for i in m['icons']}
        check('manifest has 192x192 and 512x512 icons', {'192x192', '512x512'} <= sizes)
        for icon in m['icons']:
            r = urllib.request.urlopen(BASE + '/' + icon['src']); check('icon loads ' + icon['src'], r.status == 200 and r.headers['content-type'] == 'image/png')

        # ---- service worker installs and takes control
        page.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller || false", timeout=15000) if False else None
        page.evaluate("navigator.serviceWorker.ready")
        page.reload(); page.wait_for_function("!!navigator.serviceWorker.controller")
        check('service worker controls the page', True)
        names = page.evaluate("caches.keys()")
        check('precache cache exists', any(n.startswith('crumbsave-precache-') for n in names), names)
        pre = page.evaluate("""async () => { const n = (await caches.keys()).find(k => k.startsWith('crumbsave-precache-')); const c = await caches.open(n); return (await c.keys()).map(r => new URL(r.url).pathname); }""")
        check('shell pre-cached: index, offline page, icons, JS and CSS', all(any(re.search(pat, u) for u in pre) for pat in [r'/$', r'offline\.html', r'icon-192', r'icon-512', r'\.js$', r'\.css$', r'\.woff2$']), pre)

        # ---- visit pages online so the public API is saved
        page.goto(BASE + '/bags'); expect(page.locator('.bag-card').first).to_be_visible()
        first_href = page.locator('.bag-card a').first.get_attribute('href')
        page.goto(BASE + first_href); expect(page.locator('h1').first).to_be_visible()
        api_keys = page.evaluate("""async () => { const c = await caches.open('crumbsave-api-v1'); return (await c.keys()).map(r => new URL(r.url).pathname); }""")
        check('API list and detail are saved in the api cache', any(k.endswith('/api/bags.json') for k in api_keys) and any('/api/bags/fan-' in k for k in api_keys), api_keys)
        indicator = page.locator('[data-testid=connection-indicator]')
        check('online indicator says Online', indicator.inner_text().strip() == 'Online')
        check('no banner while online', page.locator('[data-testid=connection-banner]').count() == 0)

        # ---- go offline
        ctx.set_offline(True)
        page.goto(BASE + '/bags'); expect(page.locator('.bag-card').first).to_be_visible(timeout=10000)
        check('offline: visited page /bags still renders with bags', page.locator('.bag-card').count() > 0)
        expect(indicator).to_have_text(re.compile('Offline'), timeout=5000); check('offline indicator says Offline', True)
        banner = page.locator('[data-testid=connection-banner]'); expect(banner).to_be_visible()
        check('offline banner says saved data', 'saved data' in banner.inner_text().lower(), banner.inner_text())
        page.goto(BASE + first_href); expect(page.locator('h1').first).to_be_visible(timeout=10000)
        check('offline: bag details open from saved data', 'not found' not in page.inner_text('body').lower())
        # static images: cache-first
        img_cached = page.evaluate("""async () => { const c = await caches.open('crumbsave-static-v1'); return (await c.keys()).length; }""")
        check('images were saved by cache-first strategy', img_cached > 0, img_cached)

        hdr = page.evaluate("fetch('/api/bags.json').then(r => [r.status, r.headers.get('x-crumbsave-source'), r.headers.get('x-crumbsave-cached-at')])")
        check('offline: API list is answered from the cache (marked with a header)', hdr[0] == 200 and hdr[1] == 'cache' and bool(hdr[2]), hdr)
        miss = page.evaluate("fetch('/api/bags/does-not-exist.json').then(r => r.status)")
        check('offline: unsaved API request fails cleanly (503, no crash)', miss == 503, miss)
        page.goto(BASE + '/offline'); expect(page.get_by_role('button', name='Retry Connection')).to_be_visible()
        check('offline: /offline route renders with Retry Connection', True)
        page.goto(BASE + '/some/unknown/path')
        expect(page.get_by_role('button', name='Retry Connection')).to_be_visible(timeout=10000)
        check('offline: unknown navigation shows the offline page', 'offline' in page.title().lower() or 'No connection' in page.inner_text('body'), page.title())
        page.click('#retry') if page.locator('#retry').count() else page.get_by_role('button', name='Retry Connection').click()
        expect(page.locator('#status, .offline-status')).to_contain_text('offline', timeout=5000); check('Retry while offline reports still offline', True)

        # ---- back online
        ctx.set_offline(False)
        page.goto(BASE + '/bags'); expect(page.locator('.bag-card').first).to_be_visible()
        expect(indicator).to_have_text(re.compile('Online'), timeout=8000); check('online again: indicator back to Online', True)
        expect(page.locator('[data-testid=connection-banner]')).to_have_count(0, timeout=8000); check('online again: banner disappears (fresh data)', True)

        # ---- no auth / cross-origin responses in shared caches
        bad = page.evaluate("""async () => { const out = []; for (const n of await caches.keys()) { const c = await caches.open(n); for (const r of await c.keys()) { const u = new URL(r.url); if (u.origin !== location.origin || /token|identitytoolkit|securetoken|googleapis/.test(u.href)) out.push(u.href); } } return out; }""")
        check('caches hold only same-origin public files', not bad, bad)

        # ---- runtime cache limit (trim)
        page.evaluate("Promise.all(Array.from({length: 95}, (_, i) => fetch('/icons/icon-192.png?n=' + i)))")
        page.wait_for_timeout(1500)
        over = page.evaluate("""async () => { const c = await caches.open('crumbsave-static-v1'); return (await c.keys()).length; }""")
        check('static cache is trimmed to its limit (95 files requested, max 80 kept)', 0 < over <= 80, over)

        # ---- update flow: change the build, reload, expect the toast
        v1 = sw_version(page)
        offline_html = ROOT / 'dist' / 'offline.html'; original = offline_html.read_text()
        try:
            offline_html.write_text(original + '\n<!-- new version -->')
            subprocess.run(['node', 'scripts/build-sw.mjs', 'dist'], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
            page.goto(BASE + '/'); page.evaluate("navigator.serviceWorker.getRegistration().then(r => r.update())")
            toast = page.locator('[data-testid=update-toast]'); expect(toast).to_be_visible(timeout=15000)
            check('update toast appears when a new version is installed', True)
            check('old version keeps running until the user accepts', sw_version(page) == v1)
            with page.expect_navigation(timeout=15000):
                toast.get_by_role('button', name='Update now').click()
            page.wait_for_function("!!navigator.serviceWorker.controller")
            v2 = sw_version(page); check('after Update now the new version is active', v2 != v1, (v1, v2))
            names = page.evaluate("caches.keys()")
            pre_caches = [n for n in names if n.startswith('crumbsave-precache-')]
            check('old precache was deleted on activate', pre_caches == ['crumbsave-precache-' + v2], names)
            expect(page.locator('[data-testid=update-toast]')).to_have_count(0); check('toast is gone after update', True)
        finally:
            offline_html.write_text(original)
            subprocess.run(['node', 'scripts/build-sw.mjs', 'dist'], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
        check('no uncaught page errors', not errors, errors)
        browser.close()
finally:
    server.terminate()

print(f"\n{sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
