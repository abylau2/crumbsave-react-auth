const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6; // Firebase Email/Password minimum

export function validateLogin({ email, password }) {
  const errors = {};
  if (!String(email ?? '').trim()) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function validateSignup({ email, password, confirmPassword }) {
  const errors = {};
  if (!String(email ?? '').trim()) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Choose a password.';
  else if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (!confirmPassword) errors.confirmPassword = 'Repeat your password.';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}
