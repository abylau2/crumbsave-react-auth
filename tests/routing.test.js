import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defaultFilters, parseCatalogParams, catalogParams, catalogLink } from '../src/utils/catalogParams.js';
import { dashboardStats, filterDashboard } from '../src/utils/dashboard.js';
import { filterAndSortBags, paginate } from '../src/utils/catalog.js';
import { seedBags } from '../src/data/seedBags.js';
import * as service from '../src/services/service.js';
import * as legacy from '../src/api/bagsApi.js';

test('URL filters round-trip and keep unrelated query parameters', () => {
  const filters = { ...defaultFilters, search: 'bread & tea', category: 'Bakery', district: 'Medeu', price: 'middle', availableOnly: true, sort: 'price-asc', page: 2 };
  const params = catalogParams(filters, new URLSearchParams('ref=home&category=bad'));
  assert.deepEqual(parseCatalogParams(params), filters);
  assert.equal(params.get('ref'), 'home');
  assert.equal(catalogParams(defaultFilters, params).toString(), 'ref=home');
});
test('invalid URL values use safe defaults', () => {
  for (const page of ['-2', '0', '1.5', 'NaN', 'Infinity', '99999999999999999999', '2x', '']) {
    assert.equal(parseCatalogParams(new URLSearchParams({ page })).page, 1);
  }
  assert.deepEqual(parseCatalogParams(new URLSearchParams('category=no&district=no&sort=no&price=no&available=yes')), defaultFilters);
  assert.equal(parseCatalogParams(new URLSearchParams('q=')).search, '');
});
test('catalog direct URL combines search, category, availability and sorting', () => {
  const filters = parseCatalogParams(new URLSearchParams('q=bread&category=Bakery&available=true&sort=price-asc'));
  const results = filterAndSortBags(seedBags, filters);
  assert.ok(results.length);
  assert.ok(results.every((bag) => bag.category === 'Bakery' && bag.quantity > 0));
  assert.deepEqual(results.map((bag) => bag.price), results.map((bag) => bag.price).sort((a,b) => a-b));
});
test('pagination clamps empty, singleton, full page and out-of-range URLs', () => {
  for (const size of [0, 1, 12, 13, 24]) {
    const items = seedBags.slice(0, size);
    const page = paginate(items, parseCatalogParams(new URLSearchParams('page=999')).page);
    assert.equal(page.currentPage, Math.max(1, Math.ceil(size / 12)));
    assert.ok(page.items.length <= 12);
  }
});
const bags = [
  { category: 'Bakery', district: 'Medeu', price: 100, originalPrice: 200, quantity: 2 },
  { category: 'Meals', district: 'Almaly', price: 300, originalPrice: 400, quantity: 0 },
  { category: 'Bakery', district: 'Almaly', price: 200, originalPrice: 400, quantity: 3 }
];
test('dashboard computes six KPIs and two consistent breakdowns', () => {
  const stats = dashboardStats(bags);
  assert.deepEqual([stats.total, stats.available, stats.soldOut, stats.units, stats.averagePrice], [3,2,1,5,200]);
  assert.equal(stats.averageDiscount, 125 / 3);
  assert.deepEqual(stats.categories, [{name:'Bakery', count:2}, {name:'Meals', count:1}]);
  assert.deepEqual(stats.districts, [{name:'Almaly', count:2}, {name:'Medeu', count:1}]);
  assert.equal(stats.districts.reduce((sum,r) => sum+r.count, 0), stats.total);
});
test('dashboard combined filters change statistics without mutating data', () => {
  const stats = dashboardStats(filterDashboard(bags, 'Bakery', 'Almaly'));
  assert.equal(stats.total, 1); assert.equal(stats.units, 3); assert.equal(stats.averagePrice,200);
  assert.equal(bags.length,3);
  assert.equal(catalogLink({category:'Bakery', district:'Almaly', availableOnly:true}), '/bags?category=Bakery&district=Almaly&available=true');
});
test('dashboard empty and invalid numerical values remain finite', () => {
  const empty = dashboardStats([]);
  assert.deepEqual([empty.total,empty.units,empty.averageDiscount,empty.averagePrice],[0,0,0,0]);
  const invalid = dashboardStats([{category:'Meals', district:'Medeu', price: NaN, originalPrice:0, quantity:-2}]);
  assert.deepEqual([invalid.units,invalid.averagePrice,invalid.averageDiscount],[0,0,0]);
});
test('service compatibility module exports the same operations and storage key', () => {
  for (const name of ['getBags','getBagById','createBag','reserveBag','getReservations','resetDemoData']) assert.equal(service[name], legacy[name]);
  assert.equal(service.demoStorageKey, 'crumbsave:demo:v1');
});
test('GitHub Pages fallback encodes query and hash as part of the route', () => {
  const script=readFileSync(new URL('../scripts/write-pages-fallback.mjs',import.meta.url),'utf8');
  assert.ok(script.includes('encodeURIComponent(path + location.search + location.hash)'));
});

test('saved image paths from before the rename work without rewriting stored data', async () => {
  const { imageSrc } = await import('../src/utils/imageSrc.js');
  const path = '/crumbsave-react-midterm/images/fan-food/ichiraku-ramen.webp';
  assert.equal(imageSrc(path), '/images/fan-food/ichiraku-ramen.webp?v=8');
  assert.equal(imageSrc('/crumbsave-react-routing/images/fan-food/ichiraku-ramen.webp'), '/images/fan-food/ichiraku-ramen.webp?v=8');
  assert.equal(imageSrc('/images/example.webp?crop=1'), '/images/example.webp?crop=1&v=8');
  assert.equal(path, '/crumbsave-react-midterm/images/fan-food/ichiraku-ramen.webp');
});
