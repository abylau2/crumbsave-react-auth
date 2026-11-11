export function filterDashboard(bags, category = 'All', district = 'All districts') {
  return bags.filter((bag) => (category === 'All' || bag.category === category) && (district === 'All districts' || bag.district === district));
}
export function dashboardStats(bags) {
  const prices = bags.map((bag) => bag.price).filter((price) => Number.isFinite(price) && price >= 0);
  const discounts = bags.filter((bag) => Number.isFinite(bag.price) && bag.price >= 0 && Number.isFinite(bag.originalPrice) && bag.originalPrice > 0 && bag.price <= bag.originalPrice).map((bag) => (1 - bag.price / bag.originalPrice) * 100);
  function breakdown(field) {
    const counts = new Map();
    for (const bag of bags) counts.set(bag[field], (counts.get(bag[field]) || 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }
  return {
    total: bags.length,
    available: bags.filter((bag) => bag.quantity > 0).length,
    soldOut: bags.filter((bag) => bag.quantity === 0).length,
    units: bags.reduce((total, bag) => total + (Number.isFinite(bag.quantity) ? Math.max(0, bag.quantity) : 0), 0),
    averagePrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    averageDiscount: discounts.length ? discounts.reduce((a, b) => a + b, 0) / discounts.length : 0,
    categories: breakdown('category'), districts: breakdown('district')
  };
}
