import { CATEGORIES, DISTRICTS } from '../data/seedBags.js';

export const defaultFilters = { search: '', category: 'All', district: 'All districts', price: 'any', availableOnly: false, sort: 'featured', page: 1 };
const keys = { search: 'q', category: 'category', district: 'district', price: 'price', availableOnly: 'available', sort: 'sort', page: 'page' };
const sorts = ['featured', 'price-asc', 'price-desc', 'discount', 'pickup'];
export function parseCatalogParams(params) {
  const page = params.get('page');
  return {
    search: params.get('q') || '',
    category: CATEGORIES.includes(params.get('category')) ? params.get('category') : 'All',
    district: DISTRICTS.includes(params.get('district')) ? params.get('district') : 'All districts',
    price: ['under', 'middle', 'above'].includes(params.get('price')) ? params.get('price') : 'any',
    availableOnly: params.get('available') === 'true',
    sort: sorts.includes(params.get('sort')) ? params.get('sort') : 'featured',
    page: /^\d+$/.test(page || '') && Number.isSafeInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1
  };
}
export function catalogParams(filters, current = new URLSearchParams()) {
  const params = new URLSearchParams(current);
  for (const [field, key] of Object.entries(keys)) {
    params.delete(key);
    if (filters[field] !== defaultFilters[field]) params.set(key, String(filters[field]));
  }
  return params;
}
export function catalogLink(filters) {
  const query = catalogParams({ ...defaultFilters, ...filters }).toString();
  return `/bags${query ? '?' + query : ''}`;
}
