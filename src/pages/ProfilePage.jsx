import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

const PROVIDER_LABELS = { password: 'Email and password', 'google.com': 'Google' };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function leave() {
    setBusy(true);
    setError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (failure) {
      setError(authErrorMessage(failure));
      setBusy(false);
    }
  }
  // ProtectedRoute guarantees a user; this keeps the page safe during sign-out.
  if (!user) return null;
  const methods = user.providers.map((id) => PROVIDER_LABELS[id] || id).join(', ');
  return <div className="container form-page profile-page"><div className="page-intro"><p className="eyebrow">YOUR ACCOUNT</p><h1>Your <em>profile.</em></h1><p>You are signed in. This page is only visible to signed-in users.</p></div>
    <section className="profile-card" aria-label="Account details">
      <dl>
        <div><dt>Email</dt><dd data-testid="profile-email">{user.email || 'Not provided'}</dd></div>
        <div><dt>User ID (UID)</dt><dd className="mono" data-testid="profile-uid">{user.uid}</dd></div>
        {methods && <div><dt>Sign-in method</dt><dd>{methods}</dd></div>}
      </dl>
      {error && <p className="feedback error" role="alert">{error}</p>}
      <button className="button button-secondary" type="button" onClick={leave} disabled={busy}><LogOut size={17} /> {busy ? 'Logging out…' : 'Log out'}</button>
    </section></div>;
}
