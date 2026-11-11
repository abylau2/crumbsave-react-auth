import { Link } from 'react-router-dom';
import { Brand } from './Brand.jsx';

export function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Brand /><p>Good food. Lower prices.<br />Less waste.</p></div>
      <nav aria-label="Footer navigation"><Link to="/bags">Explore bags</Link><Link to="/#how-it-works">How it works</Link><Link to="/about">About</Link><Link to="/dashboard">Dashboard</Link><Link to="/login">Login</Link><Link to="/add">List a bag</Link><Link to="/reservations">My reservations</Link></nav>
      <div className="footer-note"><strong>Made for Almaty, Kazakhstan.</strong><p>Find leftover food from cafés, bakeries and restaurants for less.</p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} CrumbSave</span><span>Discover. Reserve. Pick up.</span></div>
  </footer>;
}
