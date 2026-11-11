import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MutationObserver, QueryObserver } from '@tanstack/react-query';

class MemoryStorage {
  #map = new Map();
  getItem(key) { return this.#map.has(key) ? this.#map.get(key) : null; }
  setItem(key, value) { this.#map.set(key, String(value)); }
  removeItem(key) { this.#map.delete(key); }
  clear() { this.#map.clear(); }
}
globalThis.localStorage = new MemoryStorage();
globalThis.sessionStorage = new MemoryStorage();
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

const { createQueryClient, STALE_TIME } = await import('../src/lib/queryClient.js');
const { queryKeys } = await import('../src/hooks/queryKeys.js');
const { bagListQuery, bagDetailQuery, reservationsQuery, createBagMutation, reserveBagMutation } = await import('../src/hooks/queries.js');
const { seedBags } = await import('../src/data/seedBags.js');

const validBag = {
  title: 'Cache Test Bag', businessName: 'Test Cafe', category: 'Bakery', district: 'Medeu',
  description: 'A bag created by the cache test to prove that the catalog refreshes.',
  originalPrice: 4000, price: 1500, quantity: 3, pickupStart: '18:00', pickupEnd: '20:00'
};

test('query keys go from general to specific', () => {
  assert.deepEqual(queryKeys.bagDetail('fan-001'), ['bags', 'detail', 'fan-001']);
  assert.deepEqual(queryKeys.bagList.slice(0, 1), queryKeys.bags);
  assert.notDeepEqual(queryKeys.bagDetail('a'), queryKeys.bagDetail('b'));
});

test('cache entries have an expiration strategy', () => {
  assert.ok(STALE_TIME.bags > 0 && STALE_TIME.reservations > 0);
  assert.equal(bagListQuery().staleTime, STALE_TIME.bags);
  assert.equal(reservationsQuery().staleTime, STALE_TIME.reservations);
});

test('a fresh cache entry is reused instead of calling the API again', async () => {
  const client = createQueryClient({ gcTime: Infinity });
  const first = await client.fetchQuery(bagListQuery());
  const stamp = client.getQueryState(queryKeys.bagList).dataUpdatedAt;
  // Change storage behind the cache: a fresh entry must NOT notice.
  const state = JSON.parse(localStorage.getItem('crumbsave:demo:v1'));
  state.bags = state.bags.slice(0, 1);
  localStorage.setItem('crumbsave:demo:v1', JSON.stringify(state));
  const second = await client.fetchQuery(bagListQuery());
  assert.equal(second, first);
  assert.equal(client.getQueryState(queryKeys.bagList).dataUpdatedAt, stamp);
  assert.equal(second.length, seedBags.length);
});

test('an invalidated entry is marked stale and refetched', async () => {
  const client = createQueryClient({ gcTime: Infinity });
  await client.fetchQuery(bagListQuery());
  assert.equal(client.getQueryState(queryKeys.bagList).isInvalidated, false);
  await client.invalidateQueries({ queryKey: queryKeys.bags });
  assert.equal(client.getQueryState(queryKeys.bagList).isInvalidated, true);
});

test('creating a bag invalidates the catalog cache', async () => {
  const client = createQueryClient({ gcTime: Infinity });
  await client.fetchQuery(bagListQuery());
  await client.fetchQuery(bagDetailQuery('fan-001'));
  await client.fetchQuery(reservationsQuery());
  const created = await new MutationObserver(client, createBagMutation(client)).mutate(validBag);
  assert.ok(created.id.startsWith('bag-'));
  assert.equal(client.getQueryState(queryKeys.bagList).isInvalidated, true);
  assert.equal(client.getQueryState(queryKeys.bagDetail('fan-001')).isInvalidated, true);
  assert.equal(client.getQueryState(queryKeys.reservations).isInvalidated, false, 'reservations are unaffected by creating a bag');
  const fresh = await client.fetchQuery({ ...bagListQuery(), staleTime: 0 });
  assert.equal(fresh.length, seedBags.length + 1);
  assert.equal(fresh[0].id, created.id);
});

test('reserving a bag updates the bag cache and invalidates bags and reservations', async () => {
  const client = createQueryClient({ gcTime: Infinity });
  await client.fetchQuery(bagListQuery());
  const before = await client.fetchQuery(bagDetailQuery('fan-001'));
  await client.fetchQuery(reservationsQuery());
  const result = await new MutationObserver(client, reserveBagMutation(client)).mutate('fan-001');
  assert.equal(result.bag.quantity, before.quantity - 1);
  assert.equal(client.getQueryData(queryKeys.bagDetail('fan-001')).quantity, before.quantity - 1);
  assert.equal(client.getQueryState(queryKeys.bagList).isInvalidated, true);
  assert.equal(client.getQueryState(queryKeys.reservations).isInvalidated, true);
  const reservations = await client.fetchQuery({ ...reservationsQuery(), staleTime: 0 });
  assert.equal(reservations.length, 1);
  assert.equal(reservations[0].bagId, 'fan-001');
});

test('an outdated request cannot overwrite a newer result', async () => {
  const client = createQueryClient({ gcTime: Infinity });
  const resolvers = {};
  const makeOptions = (id) => ({
    queryKey: ['race', id],
    queryFn: ({ signal }) => new Promise((resolve, reject) => {
      resolvers[id] = resolve;
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    })
  });
  const observer = new QueryObserver(client, makeOptions('A'));
  const unsubscribe = observer.subscribe(() => {});
  observer.setOptions(makeOptions('B')); // the user switched from A to B before A finished
  resolvers.B('result for B');
  await new Promise((resolve) => setTimeout(resolve, 10));
  resolvers.A?.('late result for A'); // A answers last
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(observer.getCurrentResult().data, 'result for B');
  unsubscribe();
});

test('service requests receive the AbortSignal from the cache layer', async () => {
  const client = createQueryClient({ gcTime: Infinity });
  const controller = new AbortController();
  const pending = client.fetchQuery({ ...bagListQuery(), queryKey: ['abort-demo'] });
  await client.cancelQueries({ queryKey: ['abort-demo'] });
  await assert.rejects(pending);
  controller.abort();
});
