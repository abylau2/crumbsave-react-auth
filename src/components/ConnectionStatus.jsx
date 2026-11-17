import { useState } from 'react';
import { Download, RefreshCw, WifiOff } from 'lucide-react';
import { checkConnection, useConnection } from '../lib/connection.js';
import { applyUpdate, dismissUpdate, useServiceWorkerStatus } from '../pwa/registerSW.js';
import { promptInstall, useInstallPrompt } from '../pwa/install.js';

const BASE = import.meta.env.BASE_URL;

// Small always-visible indicator in the header.
export function ConnectionPill() {
  const { online } = useConnection();
  return <span className={`conn-pill ${online ? 'is-online' : 'is-offline'}`} role="status" aria-live="polite" data-testid="connection-indicator">
    <span className="conn-dot" aria-hidden="true" />{online ? 'Online' : 'Offline'}
  </span>;
}

function formatTime(iso) {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : null;
}

// Strip under the header: shown when offline, or when the data on screen is a saved copy.
export function ConnectionBanner() {
  const { online, savedData, savedAt } = useConnection();
  const [checking, setChecking] = useState(false);
  if (online && !savedData) return null;
  async function retry() { setChecking(true); await checkConnection(BASE); setChecking(false); }
  const when = formatTime(savedAt);
  return <div className={`conn-banner ${online ? 'is-saved' : 'is-offline'}`} role="status" data-testid="connection-banner">
    <div className="container conn-banner-inner">
      <WifiOff size={17} aria-hidden="true" />
      <p>{online ? 'Showing saved data' : 'You are offline'}<span>{online
        ? `${when ? ` from ${when}` : ''}. Some bags may have changed since then.`
        : ' — you are viewing saved data. Reservations you make are kept on this device.'}</span></p>
      <button type="button" className="conn-retry" onClick={retry} disabled={checking}><RefreshCw size={15} aria-hidden="true" /> {checking ? 'Checking…' : 'Retry'}</button>
    </div>
  </div>;
}

// "A new version is ready" + button that activates the waiting service worker.
export function UpdateToast() {
  const { updateReady } = useServiceWorkerStatus();
  if (!updateReady) return null;
  return <div className="update-toast" role="alertdialog" aria-labelledby="update-title" data-testid="update-toast">
    <div><strong id="update-title">A new version of CrumbSave is ready.</strong><p>Update to get the latest changes. Your reservations and login are kept.</p></div>
    <div className="update-actions">
      <button type="button" className="button button-primary" onClick={applyUpdate}>Update now</button>
      <button type="button" className="button button-plain" onClick={dismissUpdate}>Later</button>
    </div>
  </div>;
}

export function InstallButton({ onDone }) {
  const { canInstall } = useInstallPrompt();
  if (!canInstall) return null;
  return <button type="button" className="nav-link install-button" onClick={() => { promptInstall(); onDone?.(); }}><Download size={16} aria-hidden="true" /> Install app</button>;
}
