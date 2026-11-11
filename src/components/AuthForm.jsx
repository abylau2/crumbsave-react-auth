import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

export function AuthField({ id, label, error, hint, ...inputProps }) {
  return <div className={`field ${error ? 'has-error' : ''}`}>
    <label htmlFor={id}>{label}</label>
    <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...inputProps} />
    {hint && !error && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}

export function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>;
}

// Shared by /login and /signup: the Google button, the "or" divider and the
// "Firebase is not configured" notice.
export function GoogleSignInButton({ remember = true, disabled, onBusyChange, onError }) {
  const { loginWithGoogle } = useAuth();
  async function click() {
    onError('');
    onBusyChange(true);
    try {
      await loginWithGoogle(remember);
    } catch (error) {
      onError(authErrorMessage(error));
    } finally {
      onBusyChange(false);
    }
  }
  return <button className="button button-secondary button-google" type="button" onClick={click} disabled={disabled}><GoogleIcon /> Continue with Google</button>;
}

export function ConfigNotice() {
  const { configured, error } = useAuth();
  if (configured) return error ? <p className="feedback error" role="alert">{error}</p> : null;
  return <p className="feedback error" role="alert">{error}</p>;
}

export function useSubmitState() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return { busy, setBusy, message, setMessage };
}
