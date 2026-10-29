
import assert from 'node:assert/strict';

import { createFramework } from '../core/framework';
import { createMobileRuntime } from './runtime.js';
import { createMobileModule } from './module.js';

// ========================================
// NgBuild Mobile - Core Integration Test
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
// Test Environment
// ========================================

const events: string[] = [];

const runtime = createMobileRuntime({
  nativePlatform: 'android',
  userAgent: 'NgBuild Test Android'
});

const mobileModule = createMobileModule({
  moduleName: 'mobile',
  name: 'NgBuild Test Mobile',

  runtime,

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

// ========================================
// 1. Module Registration
// ========================================

await test('Mobile Module Registration', () => {
  framework.modules.register(mobileModule);

  assert.equal(
    framework.modules.has('mobile'),
    true
  );
});

// ========================================
// 2. Module Initialization
// ========================================

await test('Mobile Module Initialization', () => {
  framework.initialize();

  assert.equal(
    framework.modules.getStatus('mobile').initialized,
    true
  );
});

// ========================================
// 3. Start Through Core
// ========================================

await test('Mobile Start Through Core', async () => {
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

  assert.equal(
    mobileModule.getStatus(),
    'running'
  );
});

// ========================================
// 4. Mobile Runtime Integration
// ========================================

await test('Mobile Runtime Integration', () => {
  const info = mobileModule.getInfo();

  assert.equal(info.module, 'mobile');
  assert.equal(info.name, 'NgBuild Test Mobile');
  assert.equal(info.platform, 'android');
  assert.equal(info.isNative, true);
  assert.equal(info.isMobile, true);
});

// ========================================
// 5. Async Lifecycle Order
// ========================================

await test('Async Lifecycle Order', () => {
  assert.deepEqual(events, [
    'initialize',
    'start'
  ]);
});

// ========================================
// 6. Repeated Core Start
// ========================================

await test('Repeated Core Start', async () => {
  framework.start('mobile');

  await mobileModule.whenReady();

  assert.deepEqual(events, [
    'initialize',
    'start'
  ]);
});

// ========================================
// 7. Stop Through Core
// ========================================

await test('Mobile Stop Through Core', async () => {
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

// ========================================
// 8. Restart Through Core
// ========================================

await test('Mobile Restart Through Core', async () => {
  framework.start('mobile');

  await mobileModule.whenReady();

  assert.equal(
    framework.modules.isActive('mobile'),
    true
  );

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

// ========================================
// 9. Framework Shutdown
// ========================================

await test('Mobile Framework Shutdown', async () => {
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
// 10. Module Status
// ========================================

await test('Mobile Module Status', () => {
  const status = framework.modules.getStatus('mobile');

  assert.equal(status.registered, true);
  assert.equal(status.initialized, true);
  assert.equal(status.active, false);
});

// ========================================
// 11. Independent Mobile Application
// ========================================

await test('Independent Mobile Application', async () => {
  const independent = createMobileModule({
    moduleName: 'independent-mobile',
    name: 'Independent App'
  });

  independent.start();
  await independent.whenReady();

  assert.equal(
    independent.getStatus(),
    'running'
  );

  independent.stop();
  await independent.whenStopped();

  assert.equal(
    independent.getStatus(),
    'stopped'
  );
});

// ========================================
// 12. Invalid Application
// ========================================

await test('Invalid Mobile Application', () => {
  assert.throws(
    () => createMobileModule({
      app: {}
    }),
    /Invalid mobile application/
  );
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE CORE INTEGRATION ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
