import { Link } from 'react-router-dom';
import { Clock3, MapPin, ArrowUpRight } from 'lucide-react';
import { formatKzt, pickupWindow } from '../utils/catalog.js';
import { imageSrc } from '../utils/imageSrc.js';

export function ReservationCard({ reservation }) {
  return <article className="reservation-card"><img src={imageSrc(reservation.image)} alt={`Image of ${reservation.title}`} width="160" height="130" loading="lazy" /><div><span className="category-label">YOUR RESERVATION</span><h2>{reservation.title}</h2><p>{reservation.businessName}</p><div className="reservation-meta"><span><MapPin size={15} />{reservation.district}, Almaty</span><span><Clock3 size={15} />{pickupWindow(reservation)}</span></div></div><div className="reservation-end"><span className="status-label">{reservation.status}</span><strong>{formatKzt(reservation.price)}</strong>{reservation.archived ? <span className="reservation-archived">Original demo listing retired</span> : <Link to={`/bags/${reservation.bagId}`}>View bag <ArrowUpRight size={15} /></Link>}</div></article>;
}
