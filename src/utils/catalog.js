export const PAGE_SIZE = 12;

export function discountPercent(bag) {
  return Math.round((1 - bag.price / bag.originalPrice) * 100);
}

export function formatKzt(amount) {
  return `₸${new Intl.NumberFormat('en-US').format(amount)}`;
}

export function pickupWindow(bag) {
  return `${bag.pickupStart}–${bag.pickupEnd}`;
}

// Keep repeated preparations of one food apart in the Featured catalog.
// IDs and saved inventory stay untouched; this changes presentation order only.
function spreadFeaturedImages(items, keepFirstPage) {
  const result = keepFirstPage ? items.slice(0, PAGE_SIZE) : [];
  const pending = items.slice(result.length);

  while (pending.length) {
    const recentImages = new Set(result.slice(-PAGE_SIZE).map((bag) => bag.image));
    const pageStart = Math.floor(result.length / PAGE_SIZE) * PAGE_SIZE;
    const pageImages = new Set(result.slice(pageStart).map((bag) => bag.image));
    const remainingCounts = new Map();
    for (const bag of pending) {
      remainingCounts.set(bag.image, (remainingCounts.get(bag.image) ?? 0) + 1);
    }

    let choices = pending.filter((bag) => !recentImages.has(bag.image));
    if (!choices.length) choices = pending.filter((bag) => !pageImages.has(bag.image));
    if (!choices.length) choices = pending;
    choices.sort((a, b) =>
      remainingCounts.get(b.image) - remainingCounts.get(a.image)
      || a.featuredRank - b.featuredRank
      || a.id.localeCompare(b.id)
    );
    const index = pending.indexOf(choices[0]);
    result.push(pending.splice(index, 1)[0]);
  }
  return result;
}

export function filterAndSortBags(bags, filters) {
  const query = filters.search.trim().toLocaleLowerCase();
  const filtered = bags.filter((bag) => {
    const searchable = [bag.title, bag.businessName, bag.description, bag.district, bag.reference].join(' ').toLocaleLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (filters.category !== 'All' && bag.category !== filters.category) return false;
    if (filters.district !== 'All districts' && bag.district !== filters.district) return false;
    if (filters.availableOnly && bag.quantity === 0) return false;
    if (filters.price === 'under' && bag.price >= 2000) return false;
    if (filters.price === 'middle' && (bag.price < 2000 || bag.price > 4000)) return false;
    if (filters.price === 'above' && bag.price <= 4000) return false;
    return true;
  });
  const sorted = filtered.sort((a, b) => {
    if (filters.sort === 'price-asc') return a.price - b.price || a.id.localeCompare(b.id);
    if (filters.sort === 'price-desc') return b.price - a.price || a.id.localeCompare(b.id);
    if (filters.sort === 'discount') return discountPercent(b) - discountPercent(a) || a.id.localeCompare(b.id);
    if (filters.sort === 'pickup') return a.pickupStart.localeCompare(b.pickupStart) || a.id.localeCompare(b.id);
    return a.featuredRank - b.featuredRank || a.id.localeCompare(b.id);
  });
  if (filters.sort !== 'featured') return sorted;
  const unfiltered = !query && filters.category === 'All' && filters.district === 'All districts'
    && filters.price === 'any' && !filters.availableOnly;
  return spreadFeaturedImages(sorted, unfiltered);
}

export function paginate(items, page, pageSize = PAGE_SIZE) {
  const pageCount = Math.ceil(items.length / pageSize);
  const currentPage = Math.min(Math.max(1, page), Math.max(1, pageCount));
  return { items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize), pageCount, currentPage };
}
