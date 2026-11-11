import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';

export function RootLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) {
        let id;
        try { id = decodeURIComponent(hash.slice(1)); } catch { id = hash.slice(1); }
        document.getElementById(id)?.scrollIntoView();
      } else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return <><Header /><main id="main-content"><Suspense fallback={<div className="container page-state" role="status">Opening CrumbSave…</div>}><Outlet /></Suspense></main><Footer /></>;
}
