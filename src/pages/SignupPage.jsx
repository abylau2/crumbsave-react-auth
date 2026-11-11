import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthField, ConfigNotice, GoogleSignInButton, useSubmitState } from '../components/AuthForm.jsx';
import { authErrorMessage } from '../utils/authErrors.js';
import { MIN_PASSWORD_LENGTH, validateSignup } from '../utils/authValidation.js';

export default function SignupPage() {
  const { signup, configured } = useAuth();
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '' });
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
    const next = validateSignup(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setMessage('');
    try {
      // Firebase signs the new user in; GuestRoute then redirects to /profile.
      await signup(values.email, values.password);
    } catch (error) {
      setMessage(authErrorMessage(error));
      setBusy(false);
    }
  }
  const disabled = busy || !configured;
  return <div className="container form-page"><div className="page-intro"><p className="eyebrow">JOIN CRUMBSAVE</p><h1>Create your <em>account.</em></h1><p>Sign up with email or Google. Reservations in this demo stay in your browser.</p></div>
    <div className="form-layout"><div className="form-side"><h2>Good food,<br /><em>another chance.</em></h2><p>Already have an account?</p><Link className="text-link" to="/login">Log in</Link></div>
      <form className="bag-form login-form" onSubmit={submit} noValidate aria-busy={busy}>
        <ConfigNotice />
        <AuthField id="signup-email" name="email" type="email" label="Email" autoComplete="email" value={values.email} onChange={change} error={errors.email} />
        <AuthField id="signup-password" name="password" type="password" label="Password" autoComplete="new-password" value={values.password} onChange={change} error={errors.password} hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} />
        <AuthField id="signup-confirm" name="confirmPassword" type="password" label="Confirm password" autoComplete="new-password" value={values.confirmPassword} onChange={change} error={errors.confirmPassword} />
        {message && <p className="feedback error" role="alert">{message}</p>}
        <button className="button button-primary" type="submit" disabled={disabled}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="auth-divider"><span>or</span></p>
        <GoogleSignInButton disabled={disabled} onBusyChange={setBusy} onError={setMessage} />
        <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
      </form></div></div>;
}
