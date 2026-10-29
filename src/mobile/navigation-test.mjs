
import assert from 'node:assert/strict';

import {
  createMobileNavigation
} from './navigation.js';

// ========================================
// NgBuild Mobile Navigation Tests
// ========================================

let passed = 0;
let failed = 0;

function test(name, callback) {
  try {
    callback();

    passed++;
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`[FAIL] ${name}`, error);
  }
}

// ========================================
// 1. Initial Navigation
// ========================================

test('Initial Navigation', () => {
  const nav = createMobileNavigation();

  assert.equal(nav.getCurrent(), '/');
  assert.deepEqual(nav.getHistory(), ['/']);
  assert.equal(nav.canGoBack(), false);
});

// ========================================
// 2. Custom Initial Route
// ========================================

test('Custom Initial Route', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  assert.equal(nav.getCurrent(), '/home');
});

// ========================================
// 3. Push Navigation
// ========================================

test('Push Navigation', () => {
  const nav = createMobileNavigation();

  nav.push('/home');
  nav.push('/profile');

  assert.equal(nav.getCurrent(), '/profile');

  assert.deepEqual(nav.getHistory(), [
    '/',
    '/home',
    '/profile'
  ]);
});

// ========================================
// 4. Back Navigation
// ========================================

test('Back Navigation', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  nav.push('/profile');
  nav.push('/settings');

  assert.equal(nav.back(), '/profile');
  assert.equal(nav.back(), '/home');
  assert.equal(nav.canGoBack(), false);
});

// ========================================
// 5. Back At Root
// ========================================

test('Back At Root', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  assert.equal(nav.back(), '/home');
  assert.deepEqual(nav.getHistory(), ['/home']);
});

// ========================================
// 6. Replace Navigation
// ========================================

test('Replace Navigation', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  nav.push('/profile');
  nav.replace('/account');

  assert.equal(nav.getCurrent(), '/account');

  assert.deepEqual(nav.getHistory(), [
    '/home',
    '/account'
  ]);
});

// ========================================
// 7. Reset Navigation
// ========================================

test('Reset Navigation', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  nav.push('/profile');
  nav.push('/settings');
  nav.reset('/login');

  assert.equal(nav.getCurrent(), '/login');
  assert.deepEqual(nav.getHistory(), ['/login']);
  assert.equal(nav.canGoBack(), false);
});

// ========================================
// 8. Reset To Initial Route
// ========================================

test('Reset To Initial Route', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  nav.push('/profile');
  nav.reset();

  assert.equal(nav.getCurrent(), '/home');
  assert.deepEqual(nav.getHistory(), ['/home']);
});

// ========================================
// 9. Navigation Events
// ========================================

test('Navigation Events', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  const events = [];

  nav.subscribe(event => {
    events.push(event.action);
  });

  nav.push('/profile');
  nav.replace('/account');
  nav.back();
  nav.reset('/login');

  assert.deepEqual(events, [
    'push',
    'replace',
    'back',
    'reset'
  ]);
});

// ========================================
// 10. Unsubscribe Listener
// ========================================

test('Unsubscribe Listener', () => {
  const nav = createMobileNavigation();

  let count = 0;

  const unsubscribe = nav.subscribe(() => {
    count++;
  });

  nav.push('/home');
  unsubscribe();
  nav.push('/profile');

  assert.equal(count, 1);
});

// ========================================
// 11. History Protection
// ========================================

test('History Protection', () => {
  const nav = createMobileNavigation();

  const history = nav.getHistory();
  history.push('/invalid');

  assert.deepEqual(nav.getHistory(), ['/']);
});

// ========================================
// 12. Invalid Initial Route
// ========================================

test('Invalid Initial Route', () => {
  assert.throws(
    () => createMobileNavigation({
      initialRoute: 'home'
    }),
    /Invalid mobile route/
  );
});

// ========================================
// 13. Invalid Push Route
// ========================================

test('Invalid Push Route', () => {
  const nav = createMobileNavigation();

  assert.throws(
    () => nav.push('profile'),
    /Invalid mobile route/
  );

  assert.deepEqual(nav.getHistory(), ['/']);
});

// ========================================
// 14. Invalid Replace Route
// ========================================

test('Invalid Replace Route', () => {
  const nav = createMobileNavigation();

  assert.throws(
    () => nav.replace('settings'),
    /Invalid mobile route/
  );

  assert.equal(nav.getCurrent(), '/');
});

// ========================================
// 15. Invalid Reset Route
// ========================================

test('Invalid Reset Route', () => {
  const nav = createMobileNavigation();

  nav.push('/profile');

  assert.throws(
    () => nav.reset('login'),
    /Invalid mobile route/
  );

  assert.deepEqual(nav.getHistory(), [
    '/',
    '/profile'
  ]);
});

// ========================================
// 16. Invalid Listener
// ========================================

test('Invalid Listener', () => {
  const nav = createMobileNavigation();

  assert.throws(
    () => nav.subscribe(null),
    /Navigation listener must be a function/
  );
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE NAVIGATION TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
