import { fanConcepts } from './fanConcepts.js';

export const CATEGORIES = ['Bakery', 'Meals', 'Produce', 'Desserts', 'Groceries', 'Drinks'];
export const DISTRICTS = ['Bostandyk', 'Medeu', 'Almaly', 'Auezov', 'Turksib', 'Zhetysu', 'Alatau', 'Nauryzbay'];
const assetBase = typeof import.meta.env === 'object' ? import.meta.env.BASE_URL : '/';

const firstPage = [
  'ichiraku-ramen', 'krabby-patty', 'howls-breakfast', 'luffy-meat',
  'homers-pink-donut', 'jakes-sandwich', 'remys-ratatouille',
  'sashas-half-potato', 'ponyos-ham-ramen', 'portal-cake',
  'garfields-lasagna', 'skyrim-sweetroll'
];

const listings = fanConcepts.flatMap((concept) => [
  { concept, title: concept.title, description: concept.description, variation: 0 },
  ...(concept.variations ?? []).map(([title, description], index) => ({ concept, title, description, variation: index + 1 }))
]);

// Lead with twelve recognizable dishes. The rest alternate categories and concepts
// so variations of one food do not appear next to one another in Featured.
const firstListings = firstPage.map((slug) => listings.find((entry) => entry.concept.slug === slug && entry.variation === 0));
const rest = listings.filter((entry) => !firstListings.includes(entry));
const categoryQueues = CATEGORIES.map((category) => rest.filter((entry) => entry.concept.category === category));
const spreadRest = [];
while (categoryQueues.some((queue) => queue.length)) {
  for (const queue of categoryQueues) {
    if (queue.length) spreadRest.push(queue.shift());
  }
}

const pickupWindows = [['17:30', '19:00'], ['18:00', '19:30'], ['18:30', '20:00'], ['19:00', '20:30'], ['16:30', '18:00']];

export const seedBags = [...firstListings, ...spreadRest].map((entry, index) => {
  const { concept, title, description, variation } = entry;
  const price = concept.price + variation * (concept.category === 'Drinks' ? 180 : 270);
  const originalPrice = variation === 0 && concept.originalPrice
    ? concept.originalPrice
    : Math.ceil(price / (0.44 + (index % 4) * 0.035) / 10) * 10;
  const [pickupStart, pickupEnd] = pickupWindows[(index + CATEGORIES.indexOf(concept.category)) % pickupWindows.length];
  return {
    id: `fan-${String(index + 1).padStart(3, '0')}`,
    title,
    businessName: concept.businessName,
    category: concept.category,
    reference: concept.reference,
    district: DISTRICTS[(index * 3 + CATEGORIES.indexOf(concept.category)) % DISTRICTS.length],
    description,
    originalPrice,
    price,
    quantity: index > 11 && index % 11 === 0 ? 0 : 1 + ((index * 5 + 2) % 7),
    pickupStart,
    pickupEnd,
    image: `${assetBase}images/fan-food/${concept.slug}${variation ? `-v${variation}` : ''}.webp`,
    featuredRank: index,
    createdAt: `2026-10-${String(1 + (index % 20)).padStart(2, '0')}T12:00:00.000Z`
  };
});

export const categoryImage = (category) => {
  const defaults = {
    Bakery: 'bakery-bread', Meals: 'dinner', Produce: 'produce',
    Desserts: 'dessert', Groceries: 'fruit', Drinks: 'coffee-cup'
  };
  return `${assetBase}images/${defaults[category] ?? 'bakery-bread'}.jpg`;
};
