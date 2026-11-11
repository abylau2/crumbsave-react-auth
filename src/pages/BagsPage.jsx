import { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { BagCard } from '../components/BagCard.jsx';
import { CatalogControls } from '../components/CatalogControls.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/States.jsx';
import { useBags } from '../hooks/useBags.js';
import { filterAndSortBags, paginate } from '../utils/catalog.js';
import { defaultFilters, parseCatalogParams, catalogParams } from '../utils/catalogParams.js';

export default function BagsPage() {
  const { bags, status, error, retry } = useBags();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const filters = useMemo(() => parseCatalogParams(params), [params]);
  const results = useMemo(() => filterAndSortBags(bags, filters), [bags, filters]);
  const pageData = useMemo(() => paginate(results, filters.page), [results, filters.page]);
  useEffect(() => {
    if (status !== 'success') return;
    const normalized = catalogParams({ ...filters, page: pageData.currentPage }, params);
    if (normalized.toString() !== params.toString()) setParams(normalized, { replace: true });
  }, [status, filters, pageData.currentPage, params, setParams]);
  function change(field, value) {
    setParams(catalogParams({ ...filters, [field]: value, page: 1 }, params), { replace: field === 'search' });
  }
  function clear() { setParams(catalogParams(defaultFilters, params)); }
  const context = { catalog: `/bags${location.search}`, fromApp: true };
  return <section className="catalog-section container" id="catalog" aria-labelledby="catalog-title">
    <div className="section-header"><div><p className="eyebrow">THE DAILY FIND</p><h1 id="catalog-title">Explore what's on the menu.</h1><p>Good food from local spots, collected in one place.</p></div></div>
    {status === 'loading' && <LoadingSkeleton />}
    {status === 'error' && <ErrorState message={error} onRetry={retry} />}
    {status === 'success' && <>
      <CatalogControls filters={filters} onChange={change} onClear={clear} resultCount={results.length} />
      {!results.length ? <EmptyState onClear={clear} /> : <><div className="bag-grid">{pageData.items.map((bag, index) => <BagCard key={bag.id} bag={bag} priority={index < 3} navigationState={context} />)}</div><Pagination page={pageData.currentPage} pageCount={pageData.pageCount} onPage={(page) => setParams(catalogParams({ ...filters, page }, params))} /></>}
    </>}
  </section>;
}
