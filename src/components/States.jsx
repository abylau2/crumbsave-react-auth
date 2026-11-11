import { Link } from 'react-router-dom';
import { ArrowUpRight, RefreshCw } from 'lucide-react';

export function LoadingSkeleton({ count = 6 }) {
  return <div className="bag-grid" role="status" aria-label="Loading surprise bags">{Array.from({ length: count }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-photo shimmer" /><div className="skeleton-content"><div className="skeleton-line short shimmer" /><div className="skeleton-line title shimmer" /><div className="skeleton-line shimmer" /><div className="skeleton-line medium shimmer" /><div className="skeleton-line bottom shimmer" /></div></div>)}<span className="sr-only">Loading surprise bags…</span></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="state-panel" role="alert"><span className="state-symbol">!</span><h3>Something didn't load.</h3><p>{message || "We couldn't get the bags right now. Please try again."}</p><button className="button button-primary" type="button" onClick={onRetry}><RefreshCw size={17} /> Try again</button></div>;
}

export function EmptyState({ kind = 'catalog', onClear }) {
  if (kind === 'reservations') return <div className="state-panel state-panel-soft"><span className="state-symbol">0</span><h2>Nothing in your bag yet.</h2><p>Your next good find is waiting.</p><Link className="button button-primary" to="/bags">Explore surprise bags <ArrowUpRight size={17} /></Link></div>;
  return <div className="state-panel state-panel-soft"><span className="state-symbol">0</span><h3>No bags found.</h3><p>Try another search or clear your filters to see more good finds.</p><button className="button button-primary" type="button" onClick={onClear}>Clear filters</button></div>;
}
