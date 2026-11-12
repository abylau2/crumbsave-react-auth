import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Brand } from './Brand.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  const close = () => setOpen(false);
  const onHome = location.pathname === '/';
  const onAbout = onHome && location.hash === '#about';
  // Clicking Home while already on the top of the home page still scrolls up smoothly.
  function goHome() {
    close();
    if (onHome && !location.hash) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function handleLogout() {
    close();
    try {
      await logout();
      navigate('/', { replace: true });
    } catch {
      // The profile page shows logout errors; here the user simply stays signed in.
    }
  }
  return <header className="site-header">
    <div className="container header-inner">
      <Brand onClick={close} />
      <button className="menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((value) => !value)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      <nav id="primary-navigation" className={`primary-nav ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
        <Link to="/" onClick={goHome} className="nav-link" aria-current={onHome && !onAbout ? 'page' : undefined}>Home</Link>
        <NavLink to="/bags" onClick={close} className="nav-link">Explore Bags</NavLink>
        <Link to="/#about" onClick={close} className="nav-link" aria-current={onAbout ? 'page' : undefined}>About</Link>
        <NavLink to="/reservations" onClick={close} className="nav-link">My reservations</NavLink>
        {loading ? <span className="nav-link nav-auth-loading" aria-hidden="true">…</span> : user ? <>
          <NavLink to="/profile" onClick={close} className="nav-link">Profile</NavLink>
          <button type="button" onClick={handleLogout} className="nav-link nav-button">Logout</button>
        </> : <>
          <NavLink to="/login" onClick={close} className="nav-link">Login</NavLink>
          <NavLink to="/signup" onClick={close} className="nav-link">Signup</NavLink>
        </>}
        <Link to="/add" onClick={close} className="button button-primary header-cta">List a bag <ArrowUpRight size={16} /></Link>
      </nav>
    </div>
  </header>;
}
