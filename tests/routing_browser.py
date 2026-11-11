"""Routing acceptance tests against the production preview on port 4173."""
import json,re,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE='http://127.0.0.1:4173'
class PagesHandler(SimpleHTTPRequestHandler):
    def send_error(self,code,message=None,explain=None):
        if code==404:
            self.send_response(404);self.send_header('Content-Type','text/html');self.end_headers();self.wfile.write((ROOT/'dist-pages/404.html').read_bytes())
        else:super().send_error(code,message,explain)
    def log_message(self,*args):pass

# The server maps the production base to the actual build directory.
class ActualPagesHandler(PagesHandler):
    def translate_path(self,path):
        from urllib.parse import urlsplit,unquote
        relative=unquote(urlsplit(path).path).removeprefix('/crumbsave-react-auth/')
        return str(ROOT/'dist-pages'/relative)

server=ThreadingHTTPServer(('127.0.0.1',4175),ActualPagesHandler)
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ctx=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE)
    expect(page.locator('.bag-card')).to_have_count(6)
    page.evaluate('window.testDocumentMarker=42')
    page.get_by_role('navigation',name='Primary navigation').get_by_role('link',name='Explore Bags',exact=True).click()
    expect(page.locator('.bag-card')).to_have_count(12)
    assert page.evaluate('window.testDocumentMarker')==42
    print('PASS landing preview, SPA navigation, full catalog')
    page.goto(BASE+'/bags?category=Bakery&sort=price-asc&page=2')
    expect(page.get_by_role('button',name='Page 2',exact=True)).to_have_attribute('aria-current','page')
    expect(page.get_by_role('button',name='Bakery',exact=True)).to_have_attribute('aria-pressed','true')
    expect(page.get_by_label('Sort by',exact=True)).to_have_value('price-asc')
    assert page.locator('.bag-card').count()==8
    page.reload();expect(page.locator('.bag-card')).to_have_count(8)
    url=page.url
    page.locator('.card-action').first.click()
    expect(page.get_by_role('button',name='Back',exact=True)).to_be_visible()
    page.get_by_role('link',name='All Bags',exact=True).click()
    expect(page).to_have_url(url)
    page.locator('.card-action').first.click()
    page.get_by_role('button',name='Back',exact=True).click()
    expect(page).to_have_url(url)
    page.get_by_label('District',exact=True).select_option('Medeu')
    expect(page).not_to_have_url(re.compile('page=2'))
    page.go_back();expect(page).to_have_url(url)
    page.go_forward();expect(page.get_by_label('District',exact=True)).to_have_value('Medeu')
    print('PASS direct URL, refresh, context, Back/Forward, page reset')
    for value in ['-3','nan','99999999','2.5']:
        page.goto(BASE+'/bags?category=Bakery&page='+value)
        expect(page.locator('.bag-card').first).to_be_visible()
        expect(page).not_to_have_url(re.compile('page='+re.escape(value)+'$'))
    page.goto(BASE+'/bags?q=NO-SUCH-BAG&category=Bakery')
    expect(page.get_by_text('No bags found.',exact=True)).to_be_visible()
    page.get_by_role('button',name='Clear filters',exact=True).last.click()
    expect(page.locator('.bag-card')).to_have_count(12)
    search=page.get_by_role('searchbox');search.fill('Homer')
    expect(page).to_have_url(re.compile('q=Homer'))
    expect(search).to_be_focused()
    print('PASS malformed URL normalization, empty results and search focus')
    page.goto(BASE+'/bags/fan-001');expect(page.get_by_role('heading',level=1)).to_have_text('Ichiraku Ramen')
    page.get_by_role('button',name='Back',exact=True).click();expect(page).to_have_url(BASE+'/bags')
    page.goto(BASE+'/bags/not-real');expect(page.get_by_text('BAG NOT FOUND',exact=True)).to_be_visible()
    for route in ['/random-page','/something-that-does-not-exist']:
        page.goto(BASE+route);expect(page.get_by_text('404',exact=True)).to_be_visible();expect(page.get_by_role('link',name='Home',exact=True).last).to_be_visible()
    page.goto(BASE+'/bags/fan-001',wait_until='domcontentloaded')
    page.goto(BASE+'/bags/fan-002',wait_until='domcontentloaded')
    expect(page.get_by_role('heading',level=1)).to_have_text('Krabby Patty')
    page.wait_for_timeout(600);expect(page.get_by_role('heading',level=1)).to_have_text('Krabby Patty')
    print('PASS dynamic records, direct Back fallback, missing bags, 404, fast navigation')
    page.goto(BASE+'/dashboard');expect(page.locator('.kpi')).to_have_count(6)
    stats=page.evaluate("""() => { const b=JSON.parse(localStorage.getItem('crumbsave:demo:v1')).bags;return { total:b.length, available:b.filter(x=>x.quantity>0).length, units:b.reduce((s,x)=>s+x.quantity,0) }; }""")
    expect(page.locator('.kpi').nth(0).locator('strong')).to_have_text(str(stats['total']))
    expect(page.locator('.kpi').nth(1).locator('strong')).to_have_text(str(stats['available']))
    expect(page.locator('.kpi').nth(5).locator('strong')).to_have_text(str(stats['units']))
    page.get_by_label('Category',exact=True).select_option('Bakery')
    expect(page.locator('.kpi').first.locator('strong')).to_have_text('20')
    assert len(page.locator('.breakdown').first.locator('li').all_text_contents())==1
    page.locator('.breakdown').first.get_by_role('link',name=re.compile('Bakery')).click()
    expect(page).to_have_url(BASE+'/bags?category=Bakery')
    page.goto(BASE+'/dashboard');expect(page.locator('.kpi')).to_have_count(6)
    page.evaluate("sessionStorage.setItem('crumbsave:fail-next','getBags')");page.reload()
    expect(page.get_by_text("Something didn't load.",exact=True)).to_be_visible()
    page.get_by_role('button',name='Try again',exact=True).click();expect(page.locator('.kpi')).to_have_count(6)
    print('PASS API-based Dashboard KPIs, filter, breakdown drill-down, error/retry')
    page.goto(BASE+'/login');page.get_by_role('button',name='Continue',exact=True).click()
    expect(page.locator('.field-error')).to_have_count(2)
    page.get_by_label('Email',exact=True).fill('student@example.com');page.get_by_label('Password',exact=True).fill('example-pass')
    page.get_by_role('button',name='Continue',exact=True).click();expect(page.get_by_role('status')).to_have_text('Authentication is not available in this demo yet.')
    assert 'example-pass' not in page.evaluate('JSON.stringify(localStorage)')
    print('PASS honest Login placeholder and validation; password not persisted')
    for width in [375,768,1440]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['/','/bags','/bags/fan-001','/dashboard','/about','/login','/add','/reservations']:
            page.goto(BASE+route,wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,route)
            if route in ['/dashboard','/about','/login','/bags']:
                page.screenshot(path=str(ART/f'routing-{route.strip("/")}-{width}.png'),full_page=True)
        if width==375:
            page.get_by_role('button',name='Open menu').click()
            page.get_by_role('navigation',name='Primary navigation').get_by_role('link',name='Dashboard',exact=True).click()
            expect(page.get_by_role('button',name='Open menu')).to_be_visible()
    print('PASS 8 routes at 375, 768, 1440px, mobile navigation')
    for route in ['/about','/bags?category=Bakery&sort=price-asc&page=2','/bags/fan-001','/dashboard','/login','/#how-it-works']:
        page.goto('http://127.0.0.1:4175/crumbsave-react-auth'+route,wait_until='networkidle')
        expect(page.locator('main h1').first).to_be_visible()
        assert '__route' not in page.url
        assert page.url.endswith(route), (page.url, route)
        if 'page=2' in route:expect(page.locator('.bag-card')).to_have_count(8)
        page.reload(wait_until='networkidle');expect(page.locator('main h1').first).to_be_visible()
    print('PASS Pages real 404 fallback restores nested routes, query and hash on refresh')
    page.goto(BASE+'/dashboard');expect(page.locator('.kpi')).to_have_count(6)
    page.evaluate("""() => { const key='crumbsave:demo:v1';const state=JSON.parse(localStorage.getItem(key));state.bags=[{...state.bags[0],category:'Bakery',district:'Medeu'},{...state.bags[1],category:'Meals',district:'Almaly'}];localStorage.setItem(key,JSON.stringify(state)); }""")
    page.reload();expect(page.locator('.kpi').first.locator('strong')).to_have_text('2')
    page.get_by_label('Category',exact=True).select_option('Bakery');page.get_by_label('District',exact=True).select_option('Almaly')
    expect(page.get_by_text('No listings match these filters.',exact=True)).to_be_visible()
    page.get_by_role('button',name='Reset Filters',exact=True).first.click();expect(page.locator('.kpi').first.locator('strong')).to_have_text('2')
    print('PASS Dashboard combined filters, empty filtered state and reset')
    page.goto('http://127.0.0.1:4175/crumbsave-react-auth/bags',wait_until='networkidle')
    original=page.evaluate("""() => { const key='crumbsave:demo:v1';const state=JSON.parse(localStorage.getItem(key));state.bags[0].image='/crumbsave-react-midterm/images/fan-food/ichiraku-ramen.webp';state.bags.push({...state.bags[0],id:'bag-rename-test',title:'Saved before rename',quantity:2});state.reservations.push({id:'reservation-rename-test',bagId:'bag-rename-test',title:'Saved before rename',businessName:'Test Bakery',price:2000,district:'Medeu',pickupStart:'18:00',pickupEnd:'19:00',image:state.bags[0].image,status:'Reserved'});const raw=JSON.stringify(state);localStorage.setItem(key,raw);return raw; }""")
    page.goto('http://127.0.0.1:4175/crumbsave-react-auth/bags/bag-rename-test',wait_until='networkidle')
    expect(page.get_by_role('heading',level=1)).to_have_text('Saved before rename')
    expect(page.get_by_role('button',name='Already reserved')).to_be_disabled()
    assert page.locator('.detail-media img').evaluate('(img) => img.complete && img.naturalWidth > 0')
    assert page.locator('.detail-media img').get_attribute('src').startswith('/crumbsave-react-auth/')
    assert page.evaluate("localStorage.getItem('crumbsave:demo:v1')")==original
    page.goto('http://127.0.0.1:4175/crumbsave-react-auth/reservations',wait_until='networkidle')
    assert page.locator('.reservation-card img').first.evaluate('(img) => img.complete && img.naturalWidth > 0')
    print('PASS rename preserves old listings, reservations and image URLs without resetting data')
    empty=ctx.new_page();empty.goto(BASE)
    empty.evaluate("localStorage.setItem('crumbsave:demo:v1',JSON.stringify({catalogVersion:3,bags:[],reservations:[]}))")
    empty.goto(BASE+'/dashboard');expect(empty.get_by_text('Your catalog is empty.',exact=True)).to_be_visible();expect(empty.locator('.kpi')).to_have_count(0)
    assert not errors,errors
    print('PASS intentional empty catalog remains empty; no page errors')
    b.close()
server.shutdown()
