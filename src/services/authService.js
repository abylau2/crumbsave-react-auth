import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase.js';
import { AuthError, NOT_CONFIGURED_MESSAGE, toAuthError } from '../utils/authErrors.js';

// The only module that talks to Firebase Auth. UI code goes through AuthContext.

function requireAuth() {
  if (!isFirebaseConfigured || !auth) throw new AuthError(NOT_CONFIGURED_MESSAGE, 'auth/not-configured');
  return auth;
}

async function run(operation) {
  try {
    return await operation(requireAuth());
  } catch (error) {
    throw toAuthError(error);
  }
}

// "Keep me signed in" -> localStorage/IndexedDB persistence (survives refresh and restart).
// Unchecked -> session persistence (cleared when the tab is closed).
function applyPersistence(instance, remember) {
  return setPersistence(instance, remember ? browserLocalPersistence : browserSessionPersistence);
}

export const isAuthConfigured = isFirebaseConfigured;

export function subscribeToAuth(onUser, onError) {
  if (!isFirebaseConfigured || !auth) {
    onUser(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onUser, (error) => onError?.(toAuthError(error)));
}

export function signUpWithEmail(email, password) {
  return run(async (instance) => {
    await applyPersistence(instance, true);
    const credential = await createUserWithEmailAndPassword(instance, email.trim(), password);
    return credential.user;
  });
}

export function logInWithEmail(email, password, remember = true) {
  return run(async (instance) => {
    await applyPersistence(instance, remember);
    const credential = await signInWithEmailAndPassword(instance, email.trim(), password);
    return credential.user;
  });
}

export function logInWithGoogle(remember = true) {
  return run(async (instance) => {
    await applyPersistence(instance, remember);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(instance, provider);
    return credential.user;
  });
}

export function logOut() {
  return run((instance) => signOut(instance));
}
