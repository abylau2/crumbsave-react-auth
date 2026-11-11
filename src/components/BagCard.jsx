import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { discountPercent, formatKzt, pickupWindow } from '../utils/catalog.js';
import { imageSrc } from '../utils/imageSrc.js';

export function BagCard({ bag, priority = false, navigationState = { fromApp: true } }) {
  const soldOut = bag.quantity === 0;
  return <article className={`bag-card ${soldOut ? 'is-sold-out' : ''}`}>
    <Link className="bag-image-link" to={`/bags/${bag.id}`} state={navigationState} aria-label={`View ${bag.title} from ${bag.businessName}`}>
      <img src={imageSrc(bag.image)} alt={`Image of ${bag.title}`} width="1000" height="750" loading={priority ? 'eager' : 'lazy'} />
      <span className="discount-tag">SAVE {discountPercent(bag)}%</span>
    </Link>
    <div className="bag-body">
      <div className="bag-topline"><span className="category-label">{bag.category}</span><span className={`availability ${soldOut ? 'sold-out' : ''}`}>{soldOut ? 'Sold out' : `${bag.quantity} left`}</span></div>
      <h3><Link to={`/bags/${bag.id}`} state={navigationState}>{bag.title}</Link></h3>
      <p className="bag-origin"><strong>{bag.businessName}</strong><span aria-hidden="true"> · </span>{bag.district}, Almaty</p>
      <div className="bag-pickup"><span>Pick up</span><strong>{pickupWindow(bag)}</strong></div>
      <div className="bag-bottom"><div className="prices"><del>{formatKzt(bag.originalPrice)}</del><strong>{formatKzt(bag.price)}</strong></div><Link to={`/bags/${bag.id}`} state={navigationState} className="card-action">View bag <ArrowUpRight size={17} /></Link></div>
    </div>
  </article>;
}
