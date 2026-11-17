import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, WifiOff } from 'lucide-react';
import { checkConnection, useConnection } from '../lib/connection.js';

// /offline is part of the app (and offline.html is the same page for cases when the app itself cannot load).
export default function OfflinePage() {
  const { online } = useConnection();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function retry() {
    setBusy(true);
    setMessage('Checking connection…');
    const ok = await checkConnection(import.meta.env.BASE_URL);
    setBusy(false);
    if (ok) navigate('/');
    else setMessage('Still offline. Check your connection and try again.');
  }
  return <div className="container page-state offline-page">
    <WifiOff className="offline-icon" size={44} aria-hidden="true" />
    <p className="eyebrow">{online ? 'CONNECTION RESTORED' : 'YOU ARE OFFLINE'}</p>
    <h1>{online ? 'You are back online.' : 'No connection right now.'}</h1>
    <p>{online ? 'Everything works as usual again.' : 'Bags and pages you opened before are saved on this device, so you can keep browsing. New content will load when the connection returns.'}</p>
    <div className="offline-actions">
      <button className="button button-primary" type="button" onClick={retry} disabled={busy}><RefreshCw size={17} aria-hidden="true" /> Retry Connection</button>
      <Link className="button button-secondary" to="/bags">Browse saved bags</Link>
    </div>
    <p className="offline-status" role="status" aria-live="polite">{message}</p>
  </div>;
}
