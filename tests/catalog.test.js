import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { seedBags, CATEGORIES } from '../src/data/seedBags.js';
import { discountPercent, filterAndSortBags, paginate } from '../src/utils/catalog.js';
import { emptyForm, normalizeBag, validateBag } from '../src/utils/validation.js';
import { getBags, getBagById, createBag, reserveBag, getReservations, demoStorageKey, demoFailNextKey } from '../src/api/bagsApi.js';

class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}
globalThis.localStorage = new MemoryStorage();
globalThis.sessionStorage = new MemoryStorage();
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

const filters = { search: '', category: 'All', district: 'All districts', price: 'any', availableOnly: false, sort: 'featured' };
const goodValues = {
  title: 'Evening Bread Bundle', businessName: 'Test Bakery', category: 'Bakery', district: 'Medeu',
  description: 'A generous selection of fresh bread and pastries from today’s bakery counter.',
  originalPrice: '5000', price: '2100', quantity: '4', pickupStart: '18:00', pickupEnd: '19:30'
};

test('120 varied, valid seed records have unique IDs and local images', () => {
  assert.equal(seedBags.length, 120);
  assert.equal(new Set(seedBags.map((bag) => bag.id)).size, 120);
  assert.equal(new Set(seedBags.map((bag) => bag.title)).size, 120);
  assert.equal(new Set(seedBags.map((bag) => bag.image)).size, 120);
  assert.deepEqual(new Set(seedBags.map((bag) => bag.category)), new Set(CATEGORIES));
  for (const category of CATEGORIES) assert.equal(seedBags.filter((bag) => bag.category === category).length, 20);
  assert.ok(seedBags.some((bag) => bag.quantity === 0));
  assert.ok(seedBags.some((bag) => bag.price > 4000));
  assert.deepEqual(seedBags.slice(0, 12).map((bag) => bag.title), [
    'Ichiraku Ramen', 'Krabby Patty', "Howl's Moving Breakfast", "Luffy's Meat on the Bone",
    "Homer's Pink Donut", "Jake's Perfect Sandwich", "Remy's Ratatouille", "Sasha's Half Potato",
    "Ponyo's Ham Ramen", 'The Cake Is a Lie', "Garfield's Lasagna", 'Skyrim Sweetroll'
  ]);
  const potato = seedBags.find((bag) => bag.title === "Sasha's Half Potato");
  assert.deepEqual([potato.originalPrice, potato.price, discountPercent(potato), potato.description], [1980, 990, 50, 'Half a potato. A full commitment.']);
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  for (const bag of seedBags) {
    assert.ok(bag.price > 0 && bag.price < bag.originalPrice);
    assert.ok(bag.description.length > 25);
    assert.ok(bag.reference?.length > 2);
    assert.ok(existsSync(join(root, 'public', bag.image)), bag.image);
  }
});

test('combined search and filters use all constraints', () => {
  const result = filterAndSortBags(seedBags, { ...filters, search: 'Simpsons', category: 'Bakery', district: 'Turksib', price: 'under', availableOnly: true });
  assert.ok(result.length > 0);
  assert.ok(result.every((bag) => bag.category === 'Bakery' && bag.district === 'Turksib' && bag.price < 2000 && bag.quantity > 0 && bag.reference === 'The Simpsons'));
  assert.equal(filterAndSortBags(seedBags, { ...filters, search: '  impossible bag  ' }).length, 0);
});

test('price boundaries, sorting and pagination are deterministic', () => {
  for (const bag of filterAndSortBags(seedBags, { ...filters, price: 'under' })) assert.ok(bag.price < 2000);
  for (const bag of filterAndSortBags(seedBags, { ...filters, price: 'middle' })) assert.ok(bag.price >= 2000 && bag.price <= 4000);
  for (const bag of filterAndSortBags(seedBags, { ...filters, price: 'above' })) assert.ok(bag.price > 4000);
  const ascending = filterAndSortBags(seedBags, { ...filters, sort: 'price-asc' });
  assert.ok(ascending.every((bag, index) => index === 0 || ascending[index - 1].price <= bag.price));
  const discounts = filterAndSortBags(seedBags, { ...filters, sort: 'discount' });
  assert.ok(discounts.every((bag, index) => index === 0 || discountPercent(discounts[index - 1]) >= discountPercent(bag)));
  const first = paginate(ascending, 1);
  const second = paginate(ascending, 2);
  assert.equal(first.items.length, 12);
  assert.equal(first.pageCount, 10);
  assert.notEqual(first.items[0].id, second.items[0].id);
  assert.equal(paginate(ascending, 100).currentPage, 10);
});

test('featured pages keep the first picks and avoid repeated food images', () => {
  const featured = filterAndSortBags(seedBags, filters);
  assert.deepEqual(featured.slice(0, 12).map((bag) => bag.id), seedBags.slice(0, 12).map((bag) => bag.id));
  for (let page = 1; page <= 10; page += 1) {
    const images = paginate(featured, page).items.map((bag) => bag.image);
    assert.equal(new Set(images).size, images.length, `Page ${page} repeats a food image`);
  }
});

test('form validates required fields, price relation, quantity and time', () => {
  assert.equal(Object.keys(validateBag(emptyForm)).length, 10);
  assert.deepEqual(validateBag(goodValues), {});
  assert.ok(validateBag({ ...goodValues, price: '5000' }).price);
  assert.ok(validateBag({ ...goodValues, quantity: '21' }).quantity);
  assert.ok(validateBag({ ...goodValues, pickupEnd: '17:00' }).pickupEnd);
  assert.ok(validateBag({ ...goodValues, pickupEnd: '25:99' }).pickupEnd);
});

test('API seeds once and respects a stored empty array', async () => {
  assert.equal((await getBags()).length, 120);
  const stored = JSON.parse(localStorage.getItem(demoStorageKey));
  stored.bags = [];
  localStorage.setItem(demoStorageKey, JSON.stringify(stored));
  assert.deepEqual(await getBags(), []);
});

test('catalog migration replaces generic seed and keeps created bags and old reservations', async () => {
  const created = { ...seedBags[0], id: 'bag-user-created', title: 'My own bag' };
  const oldReservation = { id: 'reservation-old', bagId: 'seed-001', title: 'Old bag', price: 1000, image: '/images/croissants.jpg' };
  localStorage.setItem(demoStorageKey, JSON.stringify({ bags: [{ ...created, id: 'seed-001' }, created], reservations: [oldReservation] }));
  const migrated = await getBags();
  assert.equal(migrated.length, 121);
  assert.equal(migrated.filter((bag) => bag.id === created.id).length, 1);
  assert.equal(migrated.some((bag) => bag.id === 'seed-001'), false);
  assert.equal((await getReservations())[0].archived, true);
  assert.equal(JSON.parse(localStorage.getItem(demoStorageKey)).catalogVersion, 3);
});

test('catalog image migration preserves inventory and reservations', async () => {
  const reservedBag = { ...seedBags[12], image: '/images/fan-food/old-image.webp', quantity: 2 };
  const reservation = { id: 'reservation-existing', bagId: reservedBag.id, image: reservedBag.image };
  localStorage.setItem(demoStorageKey, JSON.stringify({ catalogVersion: 2, bags: [reservedBag], reservations: [reservation] }));
  const [migrated] = await getBags();
  assert.equal(migrated.id, reservedBag.id);
  assert.equal(migrated.quantity, 2);
  assert.equal(migrated.image, seedBags[12].image);
  assert.equal((await getReservations())[0].image, seedBags[12].image);
});

test('API creates a bag, persists it and rejects malformed data', async () => {
  await assert.rejects(createBag({ ...normalizeBag(goodValues), price: 5000 }), { code: 'VALIDATION_ERROR' });
  const bag = await createBag(normalizeBag(goodValues));
  assert.match(bag.id, /^bag-/);
  assert.equal((await getBagById(bag.id)).title, goodValues.title);
  assert.equal((await getBags()).length, 121);
});

test('reservation decrements inventory once and persists a snapshot', async () => {
  const before = await getBagById('fan-001');
  const result = await reserveBag('fan-001');
  assert.equal(result.bag.quantity, before.quantity - 1);
  assert.equal((await getReservations()).length, 1);
  assert.equal((await getBagById('fan-001')).quantity, before.quantity - 1);
  await assert.rejects(reserveBag('fan-001'), { code: 'DUPLICATE' });
  await assert.rejects(reserveBag('fan-023'), { code: 'SOLD_OUT' });
  assert.equal((await getBagById('fan-001')).quantity, before.quantity - 1);
});

test('transient failures recover and aborted requests do not complete', async () => {
  sessionStorage.setItem(demoFailNextKey, 'getBags');
  await assert.rejects(getBags(), { code: 'SIMULATED_FAILURE' });
  assert.equal((await getBags()).length, 120);
  const controller = new AbortController();
  const request = getBags({ signal: controller.signal });
  controller.abort();
  await assert.rejects(request, { name: 'AbortError' });
});
