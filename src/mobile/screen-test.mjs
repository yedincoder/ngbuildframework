
import assert from 'node:assert/strict';

import {
  createMobileNavigation
} from './navigation.js';

import {
  createMobileScreenManager
} from './screen.js';

// ========================================
// NgBuild Mobile Screen Manager Test
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
// 1. Screen Manager Creation
// ========================================

test('Screen Manager Creation', () => {
  const manager = createMobileScreenManager();

  assert.deepEqual(manager.list(), []);
  assert.equal(manager.getCurrent().route, '/');

  manager.destroy();
});

// ========================================
// 2. Register Screen
// ========================================

test('Register Screen', () => {
  const manager = createMobileScreenManager();

  manager.register('/home', () => 'Home Screen');

  assert.equal(manager.has('/home'), true);
  assert.deepEqual(manager.list(), ['/home']);

  manager.destroy();
});

// ========================================
// 3. Resolve Screen
// ========================================

test('Resolve Screen', () => {
  const manager = createMobileScreenManager();

  const renderer = () => 'Profile Screen';

  manager.register('/profile', renderer);

  assert.equal(
    manager.resolve('/profile'),
    renderer
  );

  assert.equal(
    manager.resolve('/missing'),
    null
  );

  manager.destroy();
});

// ========================================
// 4. Render Screen
// ========================================

test('Render Screen', () => {
  const manager = createMobileScreenManager();

  manager.register('/home', () => 'Home Screen');

  assert.deepEqual(
    manager.render('/home'),
    {
      route: '/home',
      found: true,
      content: 'Home Screen'
    }
  );

  manager.destroy();
});

// ========================================
// 5. Renderer Context
// ========================================

test('Renderer Context', () => {
  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/home', ({ route, navigation }) => {
    return `${route}:${navigation.getCurrent()}`;
  });

  assert.equal(
    manager.getCurrent().content,
    '/home:/home'
  );

  manager.destroy();
});

// ========================================
// 6. Initial Active Screen
// ========================================

test('Initial Active Screen', () => {
  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/home', () => 'Home Screen');

  const current = manager.getCurrent();

  assert.equal(current.route, '/home');
  assert.equal(current.content, 'Home Screen');

  manager.destroy();
});

// ========================================
// 7. Navigation Push
// ========================================

test('Navigation Push', () => {
  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/home', () => 'Home');
  manager.register('/profile', () => 'Profile');

  navigation.push('/profile');

  assert.equal(
    manager.getCurrent().content,
    'Profile'
  );

  manager.destroy();
});

// ========================================
// 8. Navigation Back
// ========================================

test('Navigation Back', () => {
  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/home', () => 'Home');
  manager.register('/profile', () => 'Profile');

  navigation.push('/profile');
  navigation.back();

  assert.equal(
    manager.getCurrent().content,
    'Home'
  );

  manager.destroy();
});

// ========================================
// 9. Navigation Replace
// ========================================

test('Navigation Replace', () => {
  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/settings', () => 'Settings');

  navigation.replace('/settings');

  assert.equal(
    manager.getCurrent().route,
    '/settings'
  );

  assert.equal(
    manager.getCurrent().content,
    'Settings'
  );

  manager.destroy();
});

// ========================================
// 10. Navigation Reset
// ========================================

test('Navigation Reset', () => {
  const navigation = createMobileNavigation();

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/login', () => 'Login');

  navigation.push('/profile');
  navigation.reset('/login');

  assert.equal(
    manager.getCurrent().content,
    'Login'
  );

  manager.destroy();
});

// ========================================
// 11. Screen Not Found
// ========================================

test('Screen Not Found', () => {
  const manager = createMobileScreenManager();

  const screen = manager.render('/unknown');

  assert.equal(screen.found, false);
  assert.equal(
    screen.content,
    'Screen not found: /unknown'
  );

  manager.destroy();
});

// ========================================
// 12. Custom Not Found
// ========================================

test('Custom Not Found Handler', () => {
  const manager = createMobileScreenManager({
    notFound: route => `404: ${route}`
  });

  assert.equal(
    manager.render('/missing').content,
    '404: /missing'
  );

  manager.destroy();
});

// ========================================
// 13. Navigation Events
// ========================================

test('Screen Change Events', () => {
  const navigation = createMobileNavigation();

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/home', () => 'Home');

  const events = [];

  manager.subscribe(event => {
    events.push(event.action);
  });

  navigation.push('/home');
  navigation.replace('/home');
  navigation.back();

  assert.deepEqual(events, [
    'push',
    'replace',
    'back'
  ]);

  manager.destroy();
});

// ========================================
// 14. Unsubscribe Events
// ========================================

test('Unsubscribe Screen Events', () => {
  const navigation = createMobileNavigation();

  const manager = createMobileScreenManager({
    navigation
  });

  let count = 0;

  const unsubscribe = manager.subscribe(() => {
    count++;
  });

  navigation.push('/home');

  unsubscribe();

  navigation.push('/profile');

  assert.equal(count, 1);

  manager.destroy();
});

// ========================================
// 15. Refresh Screen
// ========================================

test('Refresh Screen', () => {
  const manager = createMobileScreenManager();

  let count = 0;

  manager.register('/', () => {
    count++;

    return `Render ${count}`;
  });

  assert.equal(
    manager.getCurrent().content,
    'Render 1'
  );

  assert.equal(
    manager.refresh().content,
    'Render 2'
  );

  manager.destroy();
});

// ========================================
// 16. Duplicate Screen
// ========================================

test('Duplicate Screen Registration', () => {
  const manager = createMobileScreenManager();

  manager.register('/home', () => 'Home');

  assert.throws(
    () => manager.register('/home', () => 'Other'),
    /already registered/
  );

  manager.destroy();
});

// ========================================
// 17. Invalid Screen Route
// ========================================

test('Invalid Screen Route', () => {
  const manager = createMobileScreenManager();

  assert.throws(
    () => manager.register('home', () => 'Home'),
    /Invalid mobile screen route/
  );

  manager.destroy();
});

// ========================================
// 18. Invalid Renderer
// ========================================

test('Invalid Screen Renderer', () => {
  const manager = createMobileScreenManager();

  assert.throws(
    () => manager.register('/home', null),
    /Screen renderer must be a function/
  );

  manager.destroy();
});

// ========================================
// 19. Invalid Listener
// ========================================

test('Invalid Screen Listener', () => {
  const manager = createMobileScreenManager();

  assert.throws(
    () => manager.subscribe(null),
    /Screen listener must be a function/
  );

  manager.destroy();
});

// ========================================
// 20. Destroy Screen Manager
// ========================================

test('Destroy Screen Manager', () => {
  const navigation = createMobileNavigation();

  const manager = createMobileScreenManager({
    navigation
  });

  manager.register('/home', () => 'Home');

  manager.destroy();
  manager.destroy();

  assert.throws(
    () => manager.getCurrent(),
    /Screen Manager is destroyed/
  );

  assert.throws(
    () => manager.register('/other', () => 'Other'),
    /Screen Manager is destroyed/
  );

  // Navigation still works independently.
  navigation.push('/profile');

  assert.equal(
    navigation.getCurrent(),
    '/profile'
  );
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE SCREEN MANAGER TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
