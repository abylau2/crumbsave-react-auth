import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLogin, validateSignup } from '../src/utils/authValidation.js';
import { authErrorMessage, AuthError, toAuthError } from '../src/utils/authErrors.js';

test('login validation requires a valid email and a password', () => {
  assert.deepEqual(validateLogin({ email: 'a@b.co', password: 'x' }), {});
  assert.ok(validateLogin({ email: '', password: '' }).email);
  assert.ok(validateLogin({ email: '', password: '' }).password);
  assert.equal(validateLogin({ email: 'not-an-email', password: 'x' }).email, 'Enter a valid email address.');
});

test('signup validation checks email, length and confirmation', () => {
  assert.deepEqual(validateSignup({ email: 'a@b.co', password: 'secret1', confirmPassword: 'secret1' }), {});
  assert.ok(validateSignup({ email: 'bad', password: 'secret1', confirmPassword: 'secret1' }).email);
  assert.match(validateSignup({ email: 'a@b.co', password: '123', confirmPassword: '123' }).password, /at least 6/i);
  assert.equal(validateSignup({ email: 'a@b.co', password: 'secret1', confirmPassword: 'secret2' }).confirmPassword, 'Passwords do not match.');
  assert.ok(validateSignup({ email: 'a@b.co', password: 'secret1', confirmPassword: '' }).confirmPassword);
});

test('Firebase error codes become readable messages', () => {
  assert.match(authErrorMessage({ code: 'auth/invalid-credential' }), /incorrect/i);
  assert.match(authErrorMessage({ code: 'auth/email-already-in-use' }), /already exists/i);
  assert.match(authErrorMessage({ code: 'auth/popup-closed-by-user' }), /closed/i);
  assert.match(authErrorMessage({ code: 'auth/network-request-failed' }), /network/i);
  assert.match(authErrorMessage({ code: 'something/else' }), /try again/i);
  assert.equal(authErrorMessage(new AuthError('custom')), 'custom');
  const wrapped = toAuthError({ code: 'auth/weak-password' });
  assert.ok(wrapped instanceof AuthError);
  assert.equal(wrapped.code, 'auth/weak-password');
});

test('wrong password and unknown user give the same message (no account enumeration)', () => {
  assert.equal(authErrorMessage({ code: 'auth/wrong-password' }), authErrorMessage({ code: 'auth/user-not-found' }));
});
