import { useReservations } from '../hooks/useReservations.js';
import { EmptyState, ErrorState } from '../components/States.jsx';
import { ReservationCard } from '../components/ReservationCard.jsx';

export function ReservationsPage() {
  const { items, status, error, retry } = useReservations();
  return <div className="container reservations-page"><div className="page-intro"><p className="eyebrow">YOUR GOOD FINDS</p><h1>My <em>reservations.</em></h1><p>Your saved bags, with prices and pickup details in one place.</p></div>
    {status === 'loading' && <div className="reservation-loading" role="status"><div className="shimmer skeleton-line title" /><div className="shimmer skeleton-line" /><span className="sr-only">Loading reservations…</span></div>}
    {status === 'error' && <ErrorState message={error} onRetry={retry} />}
    {status === 'success' && (items.length ? <div className="reservations-list">{items.map((item) => <ReservationCard key={item.id} reservation={item} />)}</div> : <EmptyState kind="reservations" />)}
  </div>;
}
