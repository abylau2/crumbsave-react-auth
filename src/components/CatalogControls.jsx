import { Search, X } from 'lucide-react';
import { CATEGORIES, DISTRICTS } from '../data/seedBags.js';

export { defaultFilters } from '../utils/catalogParams.js';

export function CatalogControls({ filters, onChange, onClear, resultCount }) {
  const hasActive = filters.search || filters.category !== 'All' || filters.district !== 'All districts' || filters.price !== 'any' || filters.availableOnly || filters.sort !== 'featured';
  return <div className="catalog-controls">
    <div className="controls-top"><label className="search-box"><span className="sr-only">Search bags, cafes, or food</span><Search size={20} aria-hidden="true" /><input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Search bags, cafes, or food..." /></label><p className="result-count" aria-live="polite">{resultCount} {resultCount === 1 ? 'bag' : 'bags'} found</p></div>
    <div className="category-tabs" role="group" aria-label="Filter by category">{['All', ...CATEGORIES].map((category) => <button key={category} type="button" className={`category-tab ${filters.category === category ? 'selected' : ''}`} aria-pressed={filters.category === category} onClick={() => onChange('category', category)}>{category}</button>)}</div>
    <div className="filter-row"><span className="filter-label">REFINE YOUR FIND</span>
      <label className="select-wrap"><span className="sr-only">District</span><select aria-label="District" value={filters.district} onChange={(event) => onChange('district', event.target.value)}><option>All districts</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></label>
      <label className="select-wrap"><span className="sr-only">Price range</span><select aria-label="Price range" value={filters.price} onChange={(event) => onChange('price', event.target.value)}><option value="any">Any price</option><option value="under">Under ₸2,000</option><option value="middle">₸2,000–₸4,000</option><option value="above">Above ₸4,000</option></select></label>
      <label className="available-control"><input type="checkbox" checked={filters.availableOnly} onChange={(event) => onChange('availableOnly', event.target.checked)} /><span>Available only</span></label>
      <label className="sort-control"><span>Sort by</span><select aria-label="Sort by" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="discount">Biggest discount</option><option value="pickup">Pickup: earliest first</option></select></label>
      {hasActive && <button className="clear-button" type="button" onClick={onClear}><X size={16} /> Clear filters</button>}
    </div>
  </div>;
}
