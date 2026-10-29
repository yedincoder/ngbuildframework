
import assert from 'node:assert/strict';

import { createFramework } from '../core/framework';

import { createMobileRuntime } from './runtime.js';
import { createMobileApp } from './app.js';
import { createMobileNavigation } from './navigation.js';
import { createMobileScreenManager } from './screen.js';
import { createMobileState } from './state.js';

import {
  createMobileStorage,
  createMemoryStorageAdapter
} from './storage.js';

import { createMobileDeviceBridge } from './device.js';
import { createMobileUI } from './ui.js';
import { createMobileModule } from './module.js';

// ========================================
// NgBuild Mobile Final Integration Test
// ========================================

let passed = 0;
let failed = 0;

async function test(
  name: string,
  callback: () => Promise<void> | void
) {
  try {
    await callback();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`[FAIL] ${name}`, error);
  }
}

// ========================================
// Test DOM Root
// ========================================

function createTestRoot() {
  return {
    textContent: '',
    children: [] as any[],

    replaceChildren(...nodes: any[]) {
      this.children = [...nodes];

      this.textContent = nodes
        .map(node => String(node.textContent ?? ''))
        .join('');
    }
  };
}

// ========================================
// 1. Mobile Runtime
// ========================================

console.log('\n=== MOBILE RUNTIME ===');

await test('Web Runtime', () => {
  const runtime = createMobileRuntime({
    environment: {},
    userAgent: 'Mozilla/5.0'
  });

  assert.equal(runtime.platform, 'web');
  assert.equal(runtime.isNative, false);
  assert.equal(runtime.isWeb(), true);
});

await test('Android Browser Runtime', () => {
  const runtime = createMobileRuntime({
    environment: {},
    userAgent: 'Mozilla/5.0 (Linux; Android 15)'
  });

  assert.equal(runtime.platform, 'android');
  assert.equal(runtime.isNative, false);
  assert.equal(runtime.isAndroid(), true);
});

await test('Android Native Runtime', () => {
  const runtime = createMobileRuntime({
    nativePlatform: 'android'
  });

  assert.equal(runtime.platform, 'android');
  assert.equal(runtime.isNative, true);
  assert.equal(runtime.isMobile, true);
});

await test('iOS Native Runtime', () => {
  const runtime = createMobileRuntime({
    nativePlatform: 'ios'
  });

  assert.equal(runtime.platform, 'ios');
  assert.equal(runtime.isNative, true);
  assert.equal(runtime.isIOS(), true);
});

// ========================================
// 2. Mobile Application Lifecycle
// ========================================

console.log('\n=== MOBILE APPLICATION ===');

await test('Application Creation', () => {
  const app = createMobileApp({
    name: 'NgBuild Mobile Test'
  });

  assert.equal(app.name, 'NgBuild Mobile Test');
  assert.equal(app.getStatus(), 'created');
});

await test('Application Start and Stop', async () => {
  const events: string[] = [];

  const app = createMobileApp({
    onInitialize: () => {
      events.push('initialize');
    },
    onStart: () => {
      events.push('start');
    },
    onStop: () => {
      events.push('stop');
    }
  });

  await app.start();

  assert.equal(app.isRunning(), true);

  await app.stop();

  assert.equal(app.getStatus(), 'stopped');

  assert.deepEqual(events, [
    'initialize',
    'start',
    'stop'
  ]);
});

await test('Application Restart', async () => {
  let starts = 0;

  const app = createMobileApp({
    onStart: () => {
      starts++;
    }
  });

  await app.start();
  await app.stop();
  await app.start();

  assert.equal(starts, 2);
  assert.equal(app.getStatus(), 'running');

  await app.stop();
});

await test('Application Error Handling', async () => {
  const app = createMobileApp({
    onStart() {
      throw new Error('Start failed');
    }
  });

  await assert.rejects(
    app.start(),
    /Start failed/
  );

  assert.equal(app.getStatus(), 'initialized');
});

// ========================================
// 3. Mobile Navigation
// ========================================

console.log('\n=== MOBILE NAVIGATION ===');

await test('Navigation Initial Route', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  assert.equal(nav.getCurrent(), '/home');
  assert.equal(nav.canGoBack(), false);
});

await test('Navigation Push and Back', () => {
  const nav = createMobileNavigation({
    initialRoute: '/home'
  });

  nav.push('/profile');

  assert.equal(nav.getCurrent(), '/profile');
  assert.equal(nav.canGoBack(), true);

  nav.back();

  assert.equal(nav.getCurrent(), '/home');
});

await test('Navigation Replace', () => {
  const nav = createMobileNavigation();

  nav.push('/profile');
  nav.replace('/settings');

  assert.deepEqual(nav.getHistory(), [
    '/',
    '/settings'
  ]);
});

await test('Navigation Reset', () => {
  const nav = createMobileNavigation();

  nav.push('/profile');
  nav.push('/settings');
  nav.reset('/login');

  assert.deepEqual(nav.getHistory(), ['/login']);
});

await test('Navigation Events', () => {
  const nav = createMobileNavigation();

  const actions: string[] = [];

  const unsubscribe = nav.subscribe(event => {
    actions.push(event.action);
  });

  nav.push('/profile');
  nav.back();
  unsubscribe();
  nav.push('/settings');

  assert.deepEqual(actions, [
    'push',
    'back'
  ]);
});

// ========================================
// 4. Mobile Screen Manager
// ========================================

console.log('\n=== MOBILE SCREEN MANAGER ===');

await test('Screen Registration', () => {
  const manager = createMobileScreenManager();

  manager.register('/home', () => 'Home');

  assert.equal(manager.has('/home'), true);
  assert.equal(manager.resolve('/missing'), null);

  manager.destroy();
});

await test('Screen Rendering', () => {
  const manager = createMobileScreenManager();

  manager.register('/home', () => 'Home Screen');

  const screen = manager.render('/home');

  assert.equal(screen.found, true);
  assert.equal(screen.content, 'Home Screen');

  manager.destroy();
});

await test('Screen Navigation Integration', () => {
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

  navigation.back();

  assert.equal(
    manager.getCurrent().content,
    'Home'
  );

  manager.destroy();
});

await test('Screen Not Found', () => {
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
// 5. Mobile State
// ========================================

console.log('\n=== MOBILE STATE ===');

await test('State Initialization', () => {
  const state = createMobileState({
    count: 0,
    name: 'NgBuild'
  });

  assert.deepEqual(state.getState(), {
    count: 0,
    name: 'NgBuild'
  });
});

await test('State Partial Update', () => {
  const state = createMobileState({
    count: 0,
    name: 'NgBuild'
  });

  state.setState({ count: 5 });

  assert.deepEqual(state.getState(), {
    count: 5,
    name: 'NgBuild'
  });
});

await test('State Subscription', () => {
  const state = createMobileState({
    count: 0
  });

  let changes = 0;

  const unsubscribe = state.subscribe(() => {
    changes++;
  });

  state.setState({ count: 1 });
  unsubscribe();
  state.setState({ count: 2 });

  assert.equal(changes, 1);
});

await test('State Reset', () => {
  const state = createMobileState({
    count: 0
  });

  state.setState({
    count: 10,
    active: true
  });

  state.reset();

  assert.deepEqual(state.getState(), {
    count: 0
  });
});

// ========================================
// 6. Mobile Storage
// ========================================

console.log('\n=== MOBILE STORAGE ===');

await test('Storage Save and Read', () => {
  const storage = createMobileStorage({
    adapter: createMemoryStorageAdapter()
  });

  storage.setItem('user', {
    id: 1,
    name: 'NgBuild'
  });

  assert.deepEqual(storage.getItem('user'), {
    id: 1,
    name: 'NgBuild'
  });
});

await test('Storage Remove', () => {
  const storage = createMobileStorage({
    adapter: createMemoryStorageAdapter()
  });

  storage.setItem('name', 'NgBuild');

  assert.equal(storage.hasItem('name'), true);

  storage.removeItem('name');

  assert.equal(storage.hasItem('name'), false);
});

await test('Storage Namespace Isolation', () => {
  const adapter = createMemoryStorageAdapter();

  const first = createMobileStorage({
    namespace: 'first',
    adapter
  });

  const second = createMobileStorage({
    namespace: 'second',
    adapter
  });

  first.setItem('name', 'First');
  second.setItem('name', 'Second');

  first.clear();

  assert.equal(first.getItem('name'), null);
  assert.equal(second.getItem('name'), 'Second');
});

await test('Storage Shared Adapter', () => {
  const adapter = createMemoryStorageAdapter();

  const first = createMobileStorage({
    namespace: 'shared',
    adapter
  });

  first.setItem('count', 25);

  const second = createMobileStorage({
    namespace: 'shared',
    adapter
  });

  assert.equal(second.getItem('count'), 25);
});

await test('Storage Invalid JSON', () => {
  const adapter = createMemoryStorageAdapter();

  adapter.setItem('test:broken', '{invalid');

  const storage = createMobileStorage({
    namespace: 'test',
    adapter
  });

  assert.throws(
    () => storage.getItem('broken'),
    /Invalid stored JSON/
  );
});

// ========================================
// 7. Mobile Device Bridge
// ========================================

console.log('\n=== MOBILE DEVICE BRIDGE ===');

await test('Device Capability Registration', () => {
  const bridge = createMobileDeviceBridge();

  bridge.register('share', {
    web: () => 'shared'
  });

  assert.equal(bridge.has('share'), true);
  assert.equal(bridge.isAvailable('share'), true);
});

await test('Android Native Device Handler', async () => {
  const runtime = createMobileRuntime({
    nativePlatform: 'android'
  });

  const bridge = createMobileDeviceBridge({
    runtime
  });

  bridge.register('camera', {
    android: () => 'android-camera',
    web: () => 'web-camera'
  });

  assert.equal(
    await bridge.call('camera'),
    'android-camera'
  );
});

await test('Device Web Fallback', async () => {
  const runtime = createMobileRuntime({
    nativePlatform: 'ios'
  });

  const bridge = createMobileDeviceBridge({
    runtime
  });

  bridge.register('share', {
    web: () => 'web-share'
  });

  assert.equal(
    await bridge.call('share'),
    'web-share'
  );
});

await test('Device Capability Error', async () => {
  const bridge = createMobileDeviceBridge({
    environment: {},
    userAgent: 'Mozilla/5.0'
  });

  await assert.rejects(
    bridge.call('camera'),
    /Device capability unavailable/
  );
});

// ========================================
// 8. Mobile UI Integration
// ========================================

console.log('\n=== MOBILE UI INTEGRATION ===');

await test('UI Initial Mount', () => {
  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  const root = createTestRoot();

  manager.register('/home', () => 'Home Screen');

  const ui = createMobileUI({
    screenManager: manager,
    root
  });

  ui.mount();

  assert.equal(ui.isMounted(), true);
  assert.equal(root.textContent, 'Home Screen');

  ui.unmount();
  manager.destroy();
});

await test('UI Automatic Navigation', () => {
  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  const root = createTestRoot();

  manager.register('/home', () => 'Home');
  manager.register('/profile', () => 'Profile');

  const ui = createMobileUI({
    screenManager: manager,
    root
  });

  ui.mount();
  navigation.push('/profile');

  assert.equal(root.textContent, 'Profile');

  navigation.back();

  assert.equal(root.textContent, 'Home');

  ui.unmount();
  manager.destroy();
});

await test('UI State Integration', () => {
  const state = createMobileState({
    count: 0
  });

  const navigation = createMobileNavigation({
    initialRoute: '/counter'
  });

  const manager = createMobileScreenManager({
    navigation
  });

  const root = createTestRoot();

  manager.register('/counter', () => {
    return `Count: ${state.getState().count}`;
  });

  const ui = createMobileUI({
    screenManager: manager,
    root
  });

  // Connect state changes to screen refresh.
  const unsubscribe = state.subscribe(() => {
    ui.update();
  });

  ui.mount();

  assert.equal(root.textContent, 'Count: 0');

  state.setState({ count: 5 });

  assert.equal(root.textContent, 'Count: 5');

  unsubscribe();
  ui.unmount();
  manager.destroy();
});

await test('UI Safe Text Rendering', () => {
  const manager = createMobileScreenManager();

  const root = createTestRoot();

  manager.register('/', () => {
    return '<script>alert("test")</script>';
  });

  const ui = createMobileUI({
    screenManager: manager,
    root
  });

  ui.mount();

  assert.equal(
    root.textContent,
    '<script>alert("test")</script>'
  );

  assert.equal(root.children.length, 0);

  ui.unmount();
  manager.destroy();
});

await test('UI Unmount', () => {
  const manager = createMobileScreenManager();

  const root = createTestRoot();

  manager.register('/', () => 'Home');

  const ui = createMobileUI({
    screenManager: manager,
    root
  });

  ui.mount();
  ui.unmount();

  assert.equal(ui.isMounted(), false);
  assert.equal(root.textContent, '');

  manager.destroy();
});

// ========================================
// 9. Mobile Core Integration
// ========================================

console.log('\n=== MOBILE CORE INTEGRATION ===');

const events: string[] = [];

const mobileRuntime = createMobileRuntime({
  nativePlatform: 'android'
});

const mobileModule = createMobileModule({
  moduleName: 'mobile',
  name: 'NgBuild Mobile Final Test',
  runtime: mobileRuntime,

  async onInitialize() {
    await Promise.resolve();
    events.push('initialize');
  },

  async onStart() {
    await Promise.resolve();
    events.push('start');
  },

  async onStop() {
    await Promise.resolve();
    events.push('stop');
  }
});

const framework = createFramework();

await test('Core Module Registration', () => {
  framework.modules.register(mobileModule);

  assert.equal(
    framework.modules.has('mobile'),
    true
  );
});

await test('Core Module Initialization', () => {
  framework.initialize();

  assert.equal(
    framework.modules.getStatus('mobile').initialized,
    true
  );
});

await test('Core Module Start', async () => {
  framework.start('mobile');

  await mobileModule.whenReady();

  assert.equal(
    framework.modules.isActive('mobile'),
    true
  );

  assert.equal(
    mobileModule.app.isRunning(),
    true
  );

  assert.deepEqual(events, [
    'initialize',
    'start'
  ]);
});

await test('Core Module Stop', async () => {
  framework.stop('mobile');

  await mobileModule.whenStopped();

  assert.equal(
    framework.modules.isActive('mobile'),
    false
  );

  assert.equal(
    mobileModule.getStatus(),
    'stopped'
  );

  assert.deepEqual(events, [
    'initialize',
    'start',
    'stop'
  ]);
});

await test('Core Module Restart', async () => {
  framework.start('mobile');

  await mobileModule.whenReady();

  assert.equal(
    mobileModule.getStatus(),
    'running'
  );

  assert.deepEqual(events, [
    'initialize',
    'start',
    'stop',
    'start'
  ]);
});

await test('Core Framework Shutdown', async () => {
  framework.shutdown();

  await mobileModule.whenStopped();

  assert.equal(
    framework.modules.isActive('mobile'),
    false
  );

  assert.equal(
    mobileModule.getStatus(),
    'stopped'
  );

  assert.deepEqual(events, [
    'initialize',
    'start',
    'stop',
    'start',
    'stop'
  ]);
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('===================================');
console.log('NGBUILD MOBILE FINAL INTEGRATION TEST');
console.log('===================================');

console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
