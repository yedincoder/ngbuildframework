
import assert from 'node:assert/strict';

import {
  createMobileNavigation
} from './navigation.js';

import {
  createMobileScreenManager
} from './screen.js';

import {
  createMobileUI
} from './ui.js';

// ========================================
// NgBuild Mobile UI Integration Test
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
// Fake DOM Root
// ========================================

function createTestRoot() {
  return {
    textContent: '',
    children: [],

    replaceChildren(...nodes) {
      this.children = [...nodes];

      this.textContent = nodes
        .map(node => node.textContent ?? '')
        .join('');
    }
  };
}

// ========================================
// Test Environment
// ========================================

function createEnvironment(initialRoute = '/home') {
  const navigation = createMobileNavigation({
    initialRoute
  });

  const screenManager = createMobileScreenManager({
    navigation
  });

  const root = createTestRoot();

  const ui = createMobileUI({
    screenManager,
    root
  });

  return {
    navigation,
    screenManager,
    root,
    ui,

    destroy() {
      ui.unmount();
      screenManager.destroy();
    }
  };
}

// ========================================
// 1. UI Creation
// ========================================

test('Mobile UI Creation', () => {
  const env = createEnvironment();

  assert.equal(env.ui.isMounted(), false);
  assert.equal(env.ui.getCurrent(), null);

  env.destroy();
});

// ========================================
// 2. Mount UI
// ========================================

test('Mount Mobile UI', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => {
    return 'Home Screen';
  });

  env.ui.mount();

  assert.equal(env.ui.isMounted(), true);
  assert.equal(env.root.textContent, 'Home Screen');

  env.destroy();
});

// ========================================
// 3. Initial Active Screen
// ========================================

test('Initial Active Screen', () => {
  const env = createEnvironment('/profile');

  env.screenManager.register('/profile', () => {
    return 'Profile Screen';
  });

  const screen = env.ui.mount();

  assert.equal(screen.route, '/profile');
  assert.equal(screen.found, true);
  assert.equal(env.root.textContent, 'Profile Screen');

  env.destroy();
});

// ========================================
// 4. Navigation Push
// ========================================

test('UI Navigation Push', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => 'Home');
  env.screenManager.register('/profile', () => 'Profile');

  env.ui.mount();

  env.navigation.push('/profile');

  assert.equal(env.root.textContent, 'Profile');
  assert.equal(env.ui.getCurrent().route, '/profile');

  env.destroy();
});

// ========================================
// 5. Navigation Back
// ========================================

test('UI Navigation Back', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => 'Home');
  env.screenManager.register('/profile', () => 'Profile');

  env.ui.mount();

  env.navigation.push('/profile');
  env.navigation.back();

  assert.equal(env.root.textContent, 'Home');

  env.destroy();
});

// ========================================
// 6. Navigation Replace
// ========================================

test('UI Navigation Replace', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => 'Home');
  env.screenManager.register('/settings', () => 'Settings');

  env.ui.mount();

  env.navigation.replace('/settings');

  assert.equal(env.root.textContent, 'Settings');

  env.destroy();
});

// ========================================
// 7. Navigation Reset
// ========================================

test('UI Navigation Reset', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => 'Home');
  env.screenManager.register('/login', () => 'Login');

  env.ui.mount();

  env.navigation.push('/profile');
  env.navigation.reset('/login');

  assert.equal(env.root.textContent, 'Login');

  env.destroy();
});

// ========================================
// 8. Screen Not Found
// ========================================

test('UI Screen Not Found', () => {
  const env = createEnvironment();

  env.ui.mount();

  env.navigation.push('/unknown');

  assert.equal(
    env.root.textContent,
    'Screen not found: /unknown'
  );

  assert.equal(env.ui.getCurrent().found, false);

  env.destroy();
});

// ========================================
// 9. Manual Update
// ========================================

test('Manual UI Update', () => {
  const env = createEnvironment();

  let count = 0;

  env.screenManager.register('/home', () => {
    count++;

    return `Counter ${count}`;
  });

  env.ui.mount();

  assert.equal(env.root.textContent, 'Counter 1');

  env.ui.update();

  assert.equal(env.root.textContent, 'Counter 2');

  env.destroy();
});

// ========================================
// 10. Screen Manager Refresh
// ========================================

test('Screen Manager Refresh Integration', () => {
  const env = createEnvironment();

  let message = 'First';

  env.screenManager.register('/home', () => message);

  env.ui.mount();

  message = 'Updated';

  env.screenManager.refresh();

  assert.equal(env.root.textContent, 'Updated');

  env.destroy();
});

// ========================================
// 11. DOM Node Content
// ========================================

test('DOM Node Content', () => {
  const env = createEnvironment();

  const node = {
    nodeType: 1,
    textContent: 'Native DOM Element'
  };

  env.screenManager.register('/home', () => node);

  env.ui.mount();

  assert.equal(env.root.children[0], node);
  assert.equal(
    env.root.textContent,
    'Native DOM Element'
  );

  env.destroy();
});

// ========================================
// 12. Safe Text Rendering
// ========================================

test('Safe Text Rendering', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => {
    return '<script>alert("test")</script>';
  });

  env.ui.mount();

  assert.equal(
    env.root.textContent,
    '<script>alert("test")</script>'
  );

  assert.equal(env.root.children.length, 0);

  env.destroy();
});

// ========================================
// 13. Unmount UI
// ========================================

test('Unmount Mobile UI', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => 'Home');

  env.ui.mount();
  env.ui.unmount();

  assert.equal(env.ui.isMounted(), false);
  assert.equal(env.ui.getCurrent(), null);
  assert.equal(env.root.textContent, '');

  // Navigation must remain independent.
  env.navigation.push('/profile');

  assert.equal(env.root.textContent, '');

  env.destroy();
});

// ========================================
// 14. Repeated Mount
// ========================================

test('Repeated UI Mount', () => {
  const env = createEnvironment();

  let renders = 0;

  env.screenManager.register('/home', () => {
    renders++;
    return 'Home';
  });

  env.ui.mount();
  env.ui.mount();

  assert.equal(renders, 1);

  env.destroy();
});

// ========================================
// 15. Mount After Unmount
// ========================================

test('Remount Mobile UI', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => 'Home');

  env.ui.mount();
  env.ui.unmount();
  env.ui.mount();

  assert.equal(env.ui.isMounted(), true);
  assert.equal(env.root.textContent, 'Home');

  env.destroy();
});

// ========================================
// 16. Invalid Screen Manager
// ========================================

test('Invalid Screen Manager', () => {
  assert.throws(
    () => createMobileUI({
      screenManager: {},
      root: createTestRoot()
    }),
    /Invalid mobile screen manager/
  );
});

// ========================================
// 17. Invalid Root Element
// ========================================

test('Invalid UI Root Element', () => {
  const manager = createMobileScreenManager();

  assert.throws(
    () => createMobileUI({
      screenManager: manager,
      root: {}
    }),
    /Invalid mobile UI root element/
  );

  manager.destroy();
});

// ========================================
// 18. Update Before Mount
// ========================================

test('Update Before Mount', () => {
  const env = createEnvironment();

  assert.throws(
    () => env.ui.update(),
    /Mobile UI is not mounted/
  );

  env.destroy();
});

// ========================================
// 19. Unsupported Screen Content
// ========================================

test('Unsupported Screen Content', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => ({
    invalid: true
  }));

  assert.throws(
    () => env.ui.mount(),
    /Mobile screen content must be text or a DOM Node/
  );

  assert.equal(env.ui.isMounted(), false);

  env.destroy();
});

// ========================================
// 20. Unmount Does Not Destroy Navigation
// ========================================

test('Navigation After UI Unmount', () => {
  const env = createEnvironment();

  env.screenManager.register('/home', () => 'Home');

  env.ui.mount();
  env.ui.unmount();

  env.navigation.push('/other');

  assert.equal(
    env.navigation.getCurrent(),
    '/other'
  );

  assert.equal(env.ui.isMounted(), false);

  env.destroy();
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE UI INTEGRATION TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
