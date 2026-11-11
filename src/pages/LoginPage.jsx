import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthField, ConfigNotice, GoogleSignInButton, useSubmitState } from '../components/AuthForm.jsx';
import { authErrorMessage } from '../utils/authErrors.js';
import { validateLogin } from '../utils/authValidation.js';

export default function LoginPage() {
  const { login, configured } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const { busy, setBusy, message, setMessage } = useSubmitState();

  function change(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setMessage('');
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const next = validateLogin(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setMessage('');
    try {
      // On success AuthContext receives the new user and GuestRoute redirects.
      await login(values.email, values.password, remember);
    } catch (error) {
      setMessage(authErrorMessage(error));
      setBusy(false);
    }
  }
  const disabled = busy || !configured;
  return <div className="container form-page"><div className="page-intro"><p className="eyebrow">YOUR NEXT GOOD FIND</p><h1>Welcome <em>back.</em></h1><p>Log in to see your profile. You can still browse bags without an account.</p></div>
    <div className="form-layout"><div className="form-side"><h2>A place for<br /><em>your good finds.</em></h2><p>New here? Creating an account takes less than a minute.</p><Link className="text-link" to="/signup">Create an account</Link></div>
      <form className="bag-form login-form" onSubmit={submit} noValidate aria-busy={busy}>
        <ConfigNotice />
        <AuthField id="login-email" name="email" type="email" label="Email" autoComplete="email" value={values.email} onChange={change} error={errors.email} />
        <AuthField id="login-password" name="password" type="password" label="Password" autoComplete="current-password" value={values.password} onChange={change} error={errors.password} />
        <label className="checkbox-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Keep me signed in on this device</label>
        {message && <p className="feedback error" role="alert">{message}</p>}
        <button className="button button-primary" type="submit" disabled={disabled}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="auth-divider"><span>or</span></p>
        <GoogleSignInButton remember={remember} disabled={disabled} onBusyChange={setBusy} onError={setMessage} />
        <p className="auth-switch">No account yet? <Link to="/signup">Sign up</Link></p>
      </form></div></div>;
}
