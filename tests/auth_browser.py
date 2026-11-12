"""End-to-end check of auth, protected routes and caching.

Firebase network calls are mocked in the browser, so no real Firebase project is
needed. Run:  python3 tests/auth_browser.py   (needs Playwright + Google Chrome)
Set CHROME_PATH to override the browser executable.
"""
import base64, json, os, subprocess, sys, time, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'; ART.mkdir(exist_ok=True)
CHROME = os.environ.get('CHROME_PATH') or ('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' if Path('/Applications/Google Chrome.app').exists() else '/usr/bin/google-chrome')
PORT = 5199
BASE = f'http://127.0.0.1:{PORT}'
env = {**os.environ, 'VITE_FIREBASE_API_KEY': 'test-key', 'VITE_FIREBASE_AUTH_DOMAIN': 'test.firebaseapp.com',
       'VITE_FIREBASE_PROJECT_ID': 'test', 'VITE_FIREBASE_APP_ID': '1:1:web:1'}
server = subprocess.Popen(['npx', 'vite', '--host', '127.0.0.1', '--port', str(PORT), '--strictPort'], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(60):
    try:
        import urllib.request; urllib.request.urlopen(BASE); break
    except Exception: time.sleep(0.5)

def b64(d): return base64.urlsafe_b64encode(json.dumps(d).encode()).rstrip(b'=').decode()
def fake_token(uid, email): return f"{b64({'alg':'none','typ':'JWT'})}.{b64({'sub':uid,'user_id':uid,'email':email,'exp':int(time.time())+3600,'iat':int(time.time()),'iss':'https://securetoken.google.com/test','aud':'test'})}.sig"
USERS = {}
def mock_identity(route):
    url = route.request.url; body = json.loads(route.request.post_data or '{}')
    def reply(payload, status=200): route.fulfill(status=status, content_type='application/json', headers={'access-control-allow-origin': '*'}, body=json.dumps(payload))
    if route.request.method == 'OPTIONS':
        return route.fulfill(status=204, headers={'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
    if 'accounts:signUp' in url:
        if body['email'] in USERS: return reply({'error': {'code': 400, 'message': 'EMAIL_EXISTS'}}, 400)
        USERS[body['email']] = ('uid-' + str(len(USERS) + 1), body['password'])
    if 'accounts:signUp' in url or 'accounts:signInWithPassword' in url:
        email = body['email']; rec = USERS.get(email)
        if not rec or rec[1] != body['password']: return reply({'error': {'code': 400, 'message': 'INVALID_LOGIN_CREDENTIALS'}}, 400)
        return reply({'idToken': fake_token(rec[0], email), 'refreshToken': 'r', 'expiresIn': '3600', 'localId': rec[0], 'email': email})
    if 'accounts:lookup' in url:
        tok = body.get('idToken', ''); claims = json.loads(base64.urlsafe_b64decode(tok.split('.')[1] + '=='))
        return reply({'users': [{'localId': claims['sub'], 'email': claims['email'], 'emailVerified': False, 'providerUserInfo': [{'providerId': 'password', 'federatedId': claims['email'], 'email': claims['email'], 'rawId': claims['email']}], 'lastLoginAt': str(int(time.time()*1000)), 'createdAt': str(int(time.time()*1000))}]})
    return reply({'error': {'code': 400, 'message': 'UNSUPPORTED'}}, 400)

results = []
def check(name, condition):
    results.append((name, bool(condition))); print(('PASS ' if condition else 'FAIL ') + name)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=CHROME)
        ctx = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        ctx.route(re.compile(r'https://(identitytoolkit|securetoken)\.googleapis\.com/.*'), mock_identity)
        page = ctx.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)

        # --- unauthenticated state
        page.goto(BASE + '/profile')
        expect(page.get_by_role('heading', name=re.compile('Welcome'))).to_be_visible()
        check('unauthenticated /profile redirects to /login', page.url.endswith('/login'))
        nav = page.get_by_label('Primary navigation')
        check('nav shows Login and Signup when logged out', nav.get_by_role('link', name='Login').is_visible() and nav.get_by_role('link', name='Signup').is_visible())
        check('nav hides Profile and Logout when logged out', nav.get_by_role('link', name='Profile').count() == 0 and nav.get_by_role('button', name='Logout').count() == 0)

        # --- signup validation
        page.goto(BASE + '/signup')
        page.get_by_role('button', name='Create account').click()
        check('signup shows required-field errors', page.get_by_text('Enter your email address.').is_visible() and page.get_by_text('Choose a password.').is_visible())
        page.get_by_label('Email').fill('abylay@example.com'); page.get_by_label('Password', exact=True).fill('secret12'); page.get_by_label('Confirm password').fill('different')
        page.get_by_role('button', name='Create account').click()
        check('signup rejects mismatched passwords', page.get_by_text('Passwords do not match.').is_visible())
        page.get_by_label('Password', exact=True).fill('123'); page.get_by_label('Confirm password').fill('123')
        page.get_by_role('button', name='Create account').click()
        check('signup rejects short passwords', page.get_by_text('Use at least 6 characters.').is_visible())

        # --- signup success -> profile, persistence, logout
        page.get_by_label('Password', exact=True).fill('secret12'); page.get_by_label('Confirm password').fill('secret12')
        page.get_by_role('button', name='Create account').click()
        expect(page.get_by_role('heading', name=re.compile('Your profile'))).to_be_visible()
        check('signup redirects to /profile', page.url.endswith('/profile'))
        check('profile shows email and UID', page.get_by_test_id('profile-email').inner_text() == 'abylay@example.com' and page.get_by_test_id('profile-uid').inner_text() == 'uid-1')
        check('nav shows Profile and Logout when logged in', nav.get_by_role('link', name='Profile').is_visible() and nav.get_by_role('button', name='Logout').is_visible() and nav.get_by_role('link', name='Login').count() == 0)
        page.screenshot(path=str(ART / 'profile.png'))
        page.reload()
        expect(page.get_by_test_id('profile-email')).to_have_text('abylay@example.com')
        check('session persists after refresh', True)
        page.goto(BASE + '/login')
        page.wait_for_url('**/profile')
        check('logged-in user is redirected away from /login', page.url.endswith('/profile'))
        page.get_by_role('button', name=re.compile('Log out')).click()
        expect(page.get_by_role('heading', name=re.compile('Welcome'))).to_be_visible()
        check('logout returns to /login and clears nav', nav.get_by_role('link', name='Login').is_visible())
        page.goto(BASE + '/profile')
        expect(page.get_by_role('heading', name=re.compile('Welcome'))).to_be_visible()
        check('profile is protected again after logout', page.url.endswith('/login'))

        # --- login errors and success
        page.get_by_label('Email').fill('abylay@example.com'); page.get_by_label('Password').fill('wrongpass')
        page.get_by_role('button', name='Log in').click()
        expect(page.get_by_role('alert').filter(has_text='incorrect')).to_be_visible()
        check('wrong password shows a readable error', True)
        page.get_by_label('Password').fill('secret12'); page.get_by_role('button', name='Log in').click()
        expect(page.get_by_role('heading', name=re.compile('Your profile'))).to_be_visible()
        check('login succeeds and opens /profile', page.url.endswith('/profile'))
        page.goto(BASE + '/'); nav.get_by_role('button', name='Logout').click()
        expect(nav.get_by_role('link', name='Login')).to_be_visible()
        check('navbar Logout works', page.url == BASE + '/')

        # --- redirect back to the requested protected page
        page.goto(BASE + '/profile'); expect(page.get_by_role('heading', name=re.compile('Welcome'))).to_be_visible()
        page.get_by_label('Email').fill('abylay@example.com'); page.get_by_label('Password').fill('secret12'); page.get_by_role('button', name='Log in').click()
        expect(page.get_by_role('heading', name=re.compile('Your profile'))).to_be_visible()
        check('login returns to the originally requested page', page.url.endswith('/profile'))

        # --- previous routes still work
        for path, heading in [('/', 'Explore'), ('/bags?sort=price-asc&page=2', 'Explore'), ('/about', None), ('/dashboard', 'catalog'), ('/add', 'Share'), ('/reservations', 'reservations')]:
            page.goto(BASE + path); page.wait_for_load_state('networkidle')
            check(f'route {path} renders', page.locator('main').inner_text().strip() != '')
        page.goto(BASE + '/bags?sort=price-asc&page=2'); page.wait_for_selector('.bag-grid article, .bag-grid a')
        check('catalog keeps URL filters and pagination', 'sort=price-asc' in page.url and 'page=2' in page.url)

        # --- cache: revisiting the catalog shows data instantly (no skeleton)
        page.goto(BASE + '/bags'); page.wait_for_selector('.bag-grid a, .bag-grid article')
        page.get_by_label('Primary navigation').get_by_role('link', name='About').click()
        expect(page.get_by_text('ABOUT CRUMBSAVE')).to_be_visible()
        # Record whether a loading skeleton is ever inserted while returning to the catalog.
        page.evaluate("window.__skeletonSeen = false; new MutationObserver(() => { if (document.querySelector('.skeleton-card')) window.__skeletonSeen = true; }).observe(document.body, { childList: true, subtree: true });")
        page.get_by_label('Primary navigation').get_by_role('link', name='Explore Bags').click()
        page.wait_for_selector('.bag-grid a, .bag-grid article')
        page.wait_for_timeout(700)
        check('cached catalog renders without a loading skeleton', page.evaluate('window.__skeletonSeen') is False)

        # --- cache invalidation after reserve
        page.goto(BASE + '/bags/fan-001'); expect(page.get_by_role('button', name='Reserve this bag')).to_be_visible()
        before = page.locator('.detail-facts').inner_text()
        page.get_by_role('button', name='Reserve this bag').click()
        expect(page.get_by_role('button', name='Already reserved')).to_be_visible()
        after = page.locator('.detail-facts').inner_text()
        check('reserving updates quantity in the detail cache', before != after)
        nav.get_by_role('link', name='My reservations').click()
        expect(page.locator('.reservation-card')).to_have_count(1)
        check('reservations list refreshed after reserving', True)
        # --- cache invalidation after create
        page.goto(BASE + '/bags'); page.wait_for_selector('.bag-grid a, .bag-grid article')
        total_before = page.locator('.results-count, [aria-live]').first.inner_text()
        page.goto(BASE + '/add')
        page.get_by_label('Bag title').fill('Zzz Cache Bag'); page.get_by_label('Business name').fill('Zzz Cafe')
        page.get_by_label('Category').select_option('Bakery'); page.get_by_label('District').select_option(index=1)
        page.get_by_label('Description').fill('A listing created by the browser test to prove the catalog cache is invalidated.')
        page.get_by_label('Original price (KZT)').fill('4000'); page.get_by_label('Bag price (KZT)').fill('1500'); page.get_by_label('Available quantity').fill('2')
        page.get_by_label('Pickup start').fill('18:00'); page.get_by_label('Pickup end').fill('20:00')
        page.get_by_role('button', name='Publish surprise bag').click()
        expect(page.get_by_text('BAG PUBLISHED')).to_be_visible()
        nav.get_by_role('link', name='Explore Bags').click()
        page.get_by_placeholder(re.compile('search', re.I)).fill('Zzz Cache') if page.get_by_placeholder(re.compile('search', re.I)).count() else None
        expect(page.get_by_text('Zzz Cache Bag').first).to_be_visible()
        check('new bag appears in catalog without a page reload (cache invalidated)', True)
        check('no console or page errors', not errors)
        if errors: print(errors)
        browser.close()
finally:
    server.terminate()
failed = [n for n, ok in results if not ok]
print(f'\n{len(results) - len(failed)}/{len(results)} checks passed')
sys.exit(1 if failed else 0)
