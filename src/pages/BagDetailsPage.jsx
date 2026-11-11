import { useRef } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Clock3, MapPin, ShoppingBag } from 'lucide-react';
import { useBag } from '../hooks/useBag.js';
import { useReservations } from '../hooks/useReservations.js';
import { useReserveBag } from '../hooks/useBagMutations.js';
import { ErrorState } from '../components/States.jsx';
import { discountPercent, formatKzt, pickupWindow } from '../utils/catalog.js';
import { imageSrc } from '../utils/imageSrc.js';

// `key={id}` gives every bag its own component instance, so the reservation
// message and pending state of one bag can never appear on another bag's page.
export function BagDetailsPage() {
  const { id } = useParams();
  return <BagDetails key={id} id={id} />;
}

function BagDetails({ id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const catalog = /^\/bags(?:\?|$)/.test(location.state?.catalog || '') ? location.state.catalog : '/bags';
  function goBack() {
    if (location.state?.fromApp && window.history.state?.idx > 0) navigate(-1);
    else navigate(catalog);
  }
  const bagQuery = useBag(id);
  const reservationsQuery = useReservations();
  const reserveMutation = useReserveBag();
  const reservationPending = useRef(false);

  const loading = bagQuery.status === 'loading' || reservationsQuery.status === 'loading';
  const failed = bagQuery.status === 'error' ? bagQuery : reservationsQuery.status === 'error' ? reservationsQuery : null;
  const reserved = reservationsQuery.items.some((item) => item.bagId === id);
  const action = reserveMutation.isPending
    ? { status: 'pending', message: '' }
    : reserveMutation.isSuccess
      ? { status: 'success', message: 'A good find is yours. Your reservation is saved.' }
      : reserveMutation.isError
        ? { status: 'error', message: reserveMutation.error.message }
        : { status: 'idle', message: '' };

  async function reserve() {
    if (!bagQuery.bag || reservationPending.current || reserved) return;
    reservationPending.current = true;
    try {
      await reserveMutation.mutateAsync(id);
    } catch {
      // The error is shown from reserveMutation.error.
    } finally {
      reservationPending.current = false;
    }
  }

  if (loading) return <div className="container detail-loading"><div className="shimmer detail-placeholder" /><div><div className="shimmer skeleton-line title" /><div className="shimmer skeleton-line" /><div className="shimmer skeleton-line medium" /></div><span className="sr-only">Loading bag details…</span></div>;
  if (failed) return <div className="container page-state"><ErrorState message={failed.error} onRetry={failed.retry} /></div>;
  if (!bagQuery.bag) return <div className="container page-state"><p className="eyebrow">BAG NOT FOUND</p><h1>Looks like this one's gone missing.</h1><p>That bag might have been removed or the link may be wrong.</p><Link className="back-link" to="/">Home</Link><Link className="button button-primary" to={catalog}>Explore bags <ArrowUpRight size={17} /></Link></div>;
  const bag = bagQuery.bag;
  const soldOut = bag.quantity === 0;
  return <div className="container detail-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to={catalog}>Explore bags</Link><span>/</span><span aria-current="page">{bag.title}</span></nav>
    <div className="detail-grid"><div className="detail-media"><img src={imageSrc(bag.image)} width="1000" height="750" alt={`Image of ${bag.title}`} /><div className="detail-image-caption">GOOD FOOD, ONE MORE CHANCE <span>CRUMBSAVE · ALMATY</span></div></div>
      <div className="detail-info"><p className="eyebrow">{bag.category.toUpperCase()} · ALMATY</p><h1>{bag.title}</h1><p className="detail-business">by {bag.businessName}</p>{bag.reference && <p className="detail-reference">Inspired by {bag.reference} · Unofficial fan-inspired listing</p>}<p className="detail-description">{bag.description} The exact contents can vary from day to day.</p>
        <div className="detail-facts"><div><MapPin size={20} /><div><span>Pickup area</span><strong>{bag.district}, Almaty</strong></div></div><div><Clock3 size={20} /><div><span>Pickup window</span><strong>{pickupWindow(bag)}</strong></div></div><div><ShoppingBag size={20} /><div><span>Availability</span><strong>{soldOut ? 'Sold out' : `${bag.quantity} ${bag.quantity === 1 ? 'bag' : 'bags'} left`}</strong></div></div></div>
        <div className="reservation-panel"><div className="reservation-price"><div><del>{formatKzt(bag.originalPrice)}</del><strong>{formatKzt(bag.price)}</strong></div><span className="discount-tag inline">SAVE {discountPercent(bag)}%</span></div><p>Saved in this browser. No payment is taken.</p><button className="button button-primary button-full" type="button" disabled={soldOut || reserved || action.status === 'pending'} onClick={reserve}>{action.status === 'pending' ? 'Reserving…' : reserved ? 'Already reserved' : soldOut ? 'Sold out' : 'Reserve this bag'} <ArrowUpRight size={18} /></button>
          {action.message && <p className={`feedback ${action.status}`} role={action.status === 'error' ? 'alert' : 'status'}>{action.message}{action.status === 'success' && <> <Link to="/reservations">View my reservations <ArrowUpRight size={15} /></Link></>}</p>}</div>
      </div></div>
    <div className="surprise-info"><div><p className="eyebrow">A LITTLE NOTE</p><h2>What's inside a <em>Surprise Bag?</em></h2></div><p>The exact selection depends on what's left at the end of the day. The category, pickup area, and price are shown before you reserve; the contents are the surprise.</p></div>
    <div className="detail-navigation"><button className="button button-secondary" type="button" onClick={goBack}><ArrowLeft size={18} /> Back</button><Link className="back-link" to={catalog}>All Bags</Link></div>
  </div>;
}
