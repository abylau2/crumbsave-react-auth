// Turns Firebase Auth error codes into messages a visitor can act on.
const MESSAGES = {
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/invalid-login-credentials': 'The email or password is incorrect.',
  'auth/wrong-password': 'The email or password is incorrect.',
  'auth/user-not-found': 'The email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/weak-password': 'Choose a stronger password (at least 6 characters).',
  'auth/missing-password': 'Enter your password.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
  'auth/cancelled-popup-request': 'Another sign-in window is already open.',
  'auth/account-exists-with-different-credential': 'This email is already registered with a different sign-in method.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in the Firebase console.',
  'auth/unauthorized-domain': 'This website address is not on the Firebase authorized domains list.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'The Firebase API key is not valid. Check .env.local.',
  'auth/invalid-api-key': 'The Firebase API key is not valid. Check .env.local.'
};

export class AuthError extends Error {
  constructor(message, code = 'auth/unknown') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export function authErrorMessage(error) {
  if (error instanceof AuthError) return error.message;
  return MESSAGES[error?.code] || 'Something went wrong. Please try again.';
}

export function toAuthError(error) {
  if (error instanceof AuthError) return error;
  return new AuthError(authErrorMessage(error), error?.code || 'auth/unknown');
}

export const NOT_CONFIGURED_MESSAGE = 'Firebase is not configured. Copy .env.example to .env.local, fill in your Firebase web app values, and restart the dev server.';
