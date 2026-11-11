import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBags } from '../hooks/useBags.js';
import { ErrorState, LoadingSkeleton } from '../components/States.jsx';
import { filterDashboard, dashboardStats } from '../utils/dashboard.js';
import { catalogLink } from '../utils/catalogParams.js';
import { formatKzt } from '../utils/catalog.js';

function Breakdown({ title, rows, field, filters }) {
  const maximum = Math.max(1, ...rows.map((row) => row.count));
  return <section className="breakdown"><h2>{title}</h2><ul>{rows.map((row) => <li key={row.name}><Link to={catalogLink({ ...filters, [field]: row.name })}><span>{row.name}</span><strong>{row.count}</strong><span className="chart-track" aria-hidden="true"><span style={{ width: `${row.count / maximum * 100}%` }} /></span></Link></li>)}</ul></section>;
}
export default function DashboardPage() {
  const { bags, status, error, retry } = useBags();
  const [category, setCategory] = useState('All');
  const [district, setDistrict] = useState('All districts');
  const filtered = useMemo(() => filterDashboard(bags, category, district), [bags, category, district]);
  const stats = useMemo(() => dashboardStats(filtered), [filtered]);
  const categories = useMemo(() => [...new Set(bags.map((bag) => bag.category))].sort(), [bags]);
  const districts = useMemo(() => [...new Set(bags.map((bag) => bag.district))].sort(), [bags]);
  function reset() { setCategory('All'); setDistrict('All districts'); }
  const filters = { category, district };
  const metrics = [
    ['Total listings', stats.total, filters],
    ['Available listings', stats.available, { ...filters, availableOnly: true }],
    ['Sold-out listings', stats.soldOut],
    ['Average discount', `${Math.round(stats.averageDiscount)}%`],
    ['Average bag price', formatKzt(Math.round(stats.averagePrice))],
    ['Available bag units', stats.units]
  ];
  return <div className="container dashboard-page"><div className="page-intro"><p className="eyebrow">THE CATALOG, AT A GLANCE</p><h1>Your catalog,<br /><em>at a glance.</em></h1><p>See what’s available, compare categories and explore listings by district.</p></div>
    {status === 'loading' && <LoadingSkeleton count={3} />}
    {status === 'error' && <ErrorState message={error} onRetry={retry} />}
    {status === 'success' && <>
      <div className="dashboard-filters"><label>Category<select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}><option>All</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></label><label>District<select aria-label="District" value={district} onChange={(e) => setDistrict(e.target.value)}><option>All districts</option>{districts.map((name) => <option key={name}>{name}</option>)}</select></label><button className="button button-secondary" onClick={reset}>Reset Filters</button></div>
      {!filtered.length ? <div className="state-panel"><h2>{bags.length ? 'No listings match these filters.' : 'Your catalog is empty.'}</h2><p>{bags.length ? 'Try a different category or district.' : 'Create a bag to start exploring your catalog.'}</p><button className="button button-secondary" onClick={reset}>Reset Filters</button><Link className="text-link" to="/add">List a bag</Link></div> : <>
        <div className="kpi-grid" aria-live="polite">{metrics.map(([label, value, target]) => <div className="kpi" key={label}>{target ? <Link to={catalogLink(target)}><span>{label}</span><strong>{value}</strong></Link> : <><span>{label}</span><strong>{value}</strong></>}</div>)}</div>
        <div className="breakdown-grid"><Breakdown title="Listings by category" rows={stats.categories} field="category" filters={filters} /><Breakdown title="Listings by district" rows={stats.districts} field="district" filters={filters} /></div>
        <Link className="button button-primary" to={catalogLink(filters)}>Explore these bags</Link>
      </>}
    </>}
  </div>;
}
