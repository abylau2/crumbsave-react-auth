"""Optional production-preview browser smoke test: python3 tests/browser_smoke.py."""
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = 'http://127.0.0.1:4173'
ARTIFACTS = Path(__file__).resolve().parents[1] / 'artifacts'
ARTIFACTS.mkdir(exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    context = browser.new_context(viewport={ 'width': 1440, 'height': 900 }, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    bad_responses = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: bad_responses.append(f'{response.status} {response.url}') if response.status >= 400 else None)
    page.goto(BASE + '/bags', wait_until='networkidle')
    expect(page.locator('.bag-card')).to_have_count(12)
    expect(page.locator('.result-count')).to_contain_text('120 bags found')
    first_page_ids = page.locator('.bag-card h3').all_text_contents()
    assert first_page_ids == [
        'Ichiraku Ramen', 'Krabby Patty', "Howl's Moving Breakfast", "Luffy's Meat on the Bone",
        "Homer's Pink Donut", "Jake's Perfect Sandwich", "Remy's Ratatouille", "Sasha's Half Potato",
        "Ponyo's Ham Ramen", 'The Cake Is a Lie', "Garfield's Lasagna", 'Skyrim Sweetroll',
    ]
    assert len(set(page.locator('.bag-card img').evaluate_all('(images) => images.map((image) => image.getAttribute("src"))'))) == 12
    print('PASS initial 120 records, 12 cards')
    page.get_by_role('link', name='How it works').first.click()
    page.wait_for_timeout(350)
    assert abs(page.locator('#how-it-works').bounding_box()['y']) < 80
    page.get_by_role('link', name='Explore surprise bags').first.click()
    expect(page.locator('.bag-card')).to_have_count(12)
    print('PASS landing anchor and catalog navigation')

    page.get_by_role('button', name='Bakery', exact=True).click()
    expect(page.locator('.result-count')).to_contain_text('20 bags found')
    expect(page.locator('.bag-card .category-label')).to_have_text(['Bakery'] * 12)
    page.get_by_role('searchbox').fill('Homer')
    expect(page.locator('.result-count')).to_contain_text('bags found')
    assert page.locator('.bag-card').count() > 0
    page.get_by_role('searchbox').fill('zzzz-no-food')
    expect(page.get_by_text('No bags found.')).to_be_visible()
    page.get_by_role('button', name='Clear filters').last.click()
    expect(page.locator('.result-count')).to_contain_text('120 bags found')
    print('PASS combined filters, search, empty and clear')

    page.get_by_role('button', name='Page 2').click()
    expect(page.get_by_role('button', name='Page 2')).to_have_attribute('aria-current', 'page')
    assert page.locator('.bag-card h3').all_text_contents() != first_page_ids
    page.get_by_role('button', name='Page 1').click()
    print('PASS pagination changes records')

    page.locator('.bag-card').first.get_by_role('link', name=re.compile('View bag', re.I)).last.click()
    expect(page).to_have_url(re.compile('/bags/fan-001$'))
    expect(page.get_by_role('heading', level=1)).to_contain_text('Ichiraku Ramen')
    expect(page.get_by_text('Inspired by Naruto')).to_be_visible()
    page.get_by_role('button', name=re.compile('Reserve this bag')).click()
    expect(page.get_by_text('A good find is yours.')).to_be_visible()
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('button', name=re.compile('Already reserved'))).to_be_disabled()
    page.get_by_role('link', name='My reservations').first.click()
    expect(page.locator('.reservation-card')).to_have_count(1)
    print('PASS detail, reserve, duplicate prevention, persistence')

    page.goto(BASE + '/bags/does-not-exist')
    expect(page.get_by_role('heading', name=re.compile('gone missing'))).to_be_visible()
    page.goto(BASE + '/not-a-route')
    expect(page.get_by_text('404')).to_be_visible()
    print('PASS invalid detail and 404 direct routes')

    page.goto(BASE + '/add')
    page.get_by_role('button', name=re.compile('Publish surprise bag')).click()
    expect(page.locator('.field-error')).to_have_count(10)
    page.get_by_label('Bag title').fill('A Lovely Bakery Surprise')
    page.get_by_label('Business name').fill('Test Kitchen')
    page.get_by_label('Category').select_option('Bakery')
    page.get_by_label('District').select_option('Medeu')
    page.get_by_label('Description').fill('A generous changing selection of fresh bakery favorites from our counter.')
    page.get_by_label('Original price (KZT)').fill('4500')
    page.get_by_label('Bag price (KZT)').fill('1990')
    page.get_by_label('Available quantity').fill('3')
    page.get_by_label('Pickup start').fill('18:00')
    page.get_by_label('Pickup end').fill('19:30')
    page.get_by_role('button', name=re.compile('Publish surprise bag')).click()
    expect(page.get_by_role('heading', name='Your bag is ready to discover.')).to_be_visible()
    page.get_by_role('link', name=re.compile('View your bag')).click()
    expect(page.get_by_role('heading', level=1)).to_contain_text('A Lovely Bakery Surprise')
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('heading', level=1)).to_contain_text('A Lovely Bakery Surprise')
    page.goto(BASE + '/bags')
    expect(page.locator('.result-count')).to_contain_text('121 bags found')
    print('PASS controlled form, validation, creation, persistence')

    page.evaluate("sessionStorage.setItem('crumbsave:fail-next', 'getBags')")
    page.reload(wait_until='domcontentloaded')
    expect(page.get_by_text("Something didn't load.")).to_be_visible()
    page.get_by_role('button', name='Try again').click()
    expect(page.locator('.bag-card')).to_have_count(12)
    print('PASS transient error and retry')

    for width in (360, 390, 768, 1024, 1440):
        page.set_viewport_size({ 'width': width, 'height': 900 })
        page.wait_for_timeout(200)
        dimensions = page.evaluate('({width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth})')
        assert dimensions['scroll'] <= dimensions['width'] + 1, (width, dimensions)
        page.screenshot(path=str(ARTIFACTS / f'home-{width}.png'), full_page=True)
    print('PASS no horizontal overflow at five widths')

    page.set_viewport_size({ 'width': 390, 'height': 844 })
    page.get_by_role('button', name='Open menu').click()
    expect(page.get_by_role('navigation', name='Primary navigation')).to_be_visible()
    page.get_by_role('navigation', name='Primary navigation').get_by_role('link', name='List a bag').click()
    expect(page).to_have_url(re.compile('/add$'))
    expect(page.get_by_role('button', name='Open menu')).to_be_visible()
    print('PASS mobile navigation')

    assert not errors, errors
    assert not bad_responses, bad_responses
    print('PASS no page errors or failed HTTP assets')
    browser.close()
