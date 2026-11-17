"""Mobile layout check (needs Playwright + Chrome): no horizontal scroll and touch-sized controls.
Run:  npm run build && python3 tests/mobile_browser.py     (set CHROME_PATH to override the browser)
Checks every page in portrait and landscape, from 320 px wide up to a tablet.
"""
import os, subprocess, sys, time, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CHROME = os.environ.get('CHROME_PATH') or next((p for p in ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'] if Path(p).exists()), None)
PORT = 4197
BASE = f'http://127.0.0.1:{PORT}'
ROUTES = ['/', '/bags', '/bags/fan-001', '/about', '/dashboard', '/login', '/signup', '/add', '/reservations', '/offline', '/nope']
VIEWS = [(320, 568, 'portrait'), (360, 640, 'portrait'), (390, 844, 'portrait'), (568, 320, 'landscape'), (667, 375, 'landscape'), (812, 375, 'landscape'), (768, 1024, 'tablet')]
JS = '''() => {
  const W = document.documentElement.clientWidth, over = [], small = [];
  const visible = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  document.querySelectorAll('body *').forEach((e) => {
    if (!visible(e)) return;
    const r = e.getBoundingClientRect(); let p = e.parentElement, clipped = false;
    while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') { clipped = true; break; } p = p.parentElement; }
    if (!clipped && (r.right > W + 1 || r.left < -1)) over.push(e.tagName + '.' + (e.className.baseVal ?? e.className));
  });
  document.querySelectorAll('a[href], button, select, textarea, summary').forEach((e) => {
    if (!visible(e) || e.closest('.sr-only')) return;
    const r = e.getBoundingClientRect();
    if (r.height < 40) small.push(e.tagName + '.' + e.className + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  return { scroll: document.documentElement.scrollWidth, W, over: over.slice(0, 5), small: small.slice(0, 5) };
}'''

server = subprocess.Popen(['npx', 'vite', 'preview', '--host', '127.0.0.1', '--port', str(PORT), '--strictPort'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(60):
    try: urllib.request.urlopen(BASE); break
    except Exception: time.sleep(0.5)
failures = 0; total = 0
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        for w, h, kind in VIEWS:
            ctx = browser.new_context(viewport={'width': w, 'height': h}, has_touch=True, is_mobile=w < 700)
            page = ctx.new_page()
            for route in ROUTES:
                page.goto(BASE + route); page.wait_for_timeout(700)
                r = page.evaluate(JS); total += 1
                ok = r['scroll'] <= r['W'] and not r['over'] and not r['small']
                if not ok:
                    failures += 1; print('FAIL', f'{w}x{h} {kind}', route, r)
            if w == 320:   # the mobile menu must work, not just look right
                page.goto(BASE + '/'); page.click('.menu-toggle'); page.click('text=Explore Bags'); page.wait_for_selector('.bag-card')
                total += 1; ok = page.url.endswith('/bags') and page.locator('.primary-nav.is-open').count() == 0
                if not ok: failures += 1; print('FAIL mobile menu navigation')
            ctx.close()
        browser.close()
finally:
    server.terminate()
print(f'{total - failures}/{total} mobile checks passed')
sys.exit(1 if failures else 0)
