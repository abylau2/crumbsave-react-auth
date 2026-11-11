import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero.jsx';
import { HowItWorks } from '../components/HowItWorks.jsx';
import { BagCard } from '../components/BagCard.jsx';
import { defaultFilters } from '../components/CatalogControls.jsx';
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/States.jsx';
import { useBags } from '../hooks/useBags.js';
import { filterAndSortBags } from '../utils/catalog.js';

export function HomePage() {
  const { bags, status, error, retry } = useBags();
  const featured = useMemo(() => filterAndSortBags(bags, defaultFilters).slice(0, 6), [bags]);
  return <>
    <Hero />
    <section className="catalog-section container" id="catalog" aria-labelledby="catalog-title">
      <div className="section-header"><div><p className="eyebrow">THE DAILY FIND</p><h2 id="catalog-title">Explore what's on the menu.</h2><p>Leftover food from local spots, at lower prices.</p></div></div>
      {status === 'loading' && <LoadingSkeleton />}
      {status === 'error' && <ErrorState message={error} onRetry={retry} />}
      {status === 'success' && <>
        {!featured.length ? <EmptyState onClear={retry} /> : <div className="bag-grid">{featured.map((bag, index) => <BagCard key={bag.id} bag={bag} priority={index < 3} navigationState={{ fromApp: true }} />)}</div>}
        <Link className="button button-secondary featured-link" to="/bags">Explore all bags <ArrowUpRight size={18} /></Link>
      </>}
    </section>
    <HowItWorks />
    <section className="closing-banner"><div className="container closing-inner"><div><p className="eyebrow">HAVE SOMETHING GOOD LEFT?</p><h2>Give leftovers <em>a second chance.</em></h2><p>List what's left and help someone find their next meal.</p></div><Link className="button button-light" to="/add">List a surprise bag <ArrowUpRight size={18} /></Link></div></section>
  </>;
}
