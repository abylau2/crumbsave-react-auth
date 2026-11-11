import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
export function NotFoundPage() {
  return <div className="container page-state not-found"><span className="not-found-number">404</span><p className="eyebrow">PAGE NOT FOUND</p><h1>Looks like this one's <em>gone missing.</em></h1><p>There is no page at this address. Let's find you something good instead.</p><Link className="back-link" to="/">Home</Link><Link className="button button-primary" to="/bags">Explore surprise bags <ArrowUpRight size={17} /></Link></div>;
}
