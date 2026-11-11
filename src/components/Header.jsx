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
        <NavLink to="/" end onClick={close} className="nav-link">Home</NavLink>
        <NavLink to="/bags" onClick={close} className="nav-link">Explore Bags</NavLink>
        <NavLink to="/about" onClick={close} className="nav-link">About</NavLink><NavLink to="/dashboard" onClick={close} className="nav-link">Dashboard</NavLink>
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
