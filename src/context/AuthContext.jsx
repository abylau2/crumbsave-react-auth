import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  isAuthConfigured,
  logInWithEmail,
  logInWithGoogle,
  logOut,
  signUpWithEmail,
  subscribeToAuth
} from '../services/authService.js';
import { NOT_CONFIGURED_MESSAGE } from '../utils/authErrors.js';

const AuthContext = createContext(null);

// Keep only what the UI needs so Firebase objects do not leak into components.
function toUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    providers: firebaseUser.providerData.map((item) => item.providerId),
    lastSignInTime: firebaseUser.metadata?.lastSignInTime ?? null
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `loading` stays true until Firebase has restored (or ruled out) a saved session.
  const [loading, setLoading] = useState(isAuthConfigured);
  const [error, setError] = useState(isAuthConfigured ? '' : NOT_CONFIGURED_MESSAGE);

  useEffect(() => {
    if (!isAuthConfigured) return undefined;
    const unsubscribe = subscribeToAuth(
      (firebaseUser) => {
        setUser(toUser(firebaseUser));
        setLoading(false);
      },
      (authError) => {
        setError(authError.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const clearError = useCallback(() => setError(''), []);
  const signup = useCallback((email, password) => signUpWithEmail(email, password), []);
  const login = useCallback((email, password, remember = true) => logInWithEmail(email, password, remember), []);
  const loginWithGoogle = useCallback((remember = true) => logInWithGoogle(remember), []);
  const logout = useCallback(() => logOut(), []);

  const value = useMemo(
    () => ({ user, loading, error, configured: isAuthConfigured, clearError, signup, login, loginWithGoogle, logout }),
    [user, loading, error, clearError, signup, login, loginWithGoogle, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
