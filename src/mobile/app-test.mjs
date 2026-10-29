
import assert from 'node:assert/strict';

import { createMobileApp } from './app.js';
import { createMobileRuntime } from './runtime.js';

// ========================================
// NgBuild Mobile Application Tests
// ========================================

let passed = 0;
let failed = 0;

async function test(name, callback) {
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
// 1. Application Creation
// ========================================

await test('Application Creation', () => {
  const app = createMobileApp({
    name: 'NgBuild Test App'
  });

  assert.equal(app.name, 'NgBuild Test App');
  assert.equal(app.getStatus(), 'created');
  assert.equal(app.isRunning(), false);
});

// ========================================
// 2. Application Initialization
// ========================================

await test('Application Initialization', async () => {
  let initialized = 0;

  const app = createMobileApp({
    onInitialize() {
      initialized++;
    }
  });

  await app.initialize();

  assert.equal(app.getStatus(), 'initialized');
  assert.equal(initialized, 1);
});

// ========================================
// 3. Application Start
// ========================================

await test('Application Start', async () => {
  const events = [];

  const app = createMobileApp({
    onInitialize() {
      events.push('initialize');
    },

    onStart() {
      events.push('start');
    }
  });

  await app.start();

  assert.equal(app.getStatus(), 'running');
  assert.equal(app.isRunning(), true);

  assert.deepEqual(events, [
    'initialize',
    'start'
  ]);
});

// ========================================
// 4. Application Stop
// ========================================

await test('Application Stop', async () => {
  let stopped = 0;

  const app = createMobileApp({
    onStop() {
      stopped++;
    }
  });

  await app.start();
  await app.stop();

  assert.equal(app.getStatus(), 'stopped');
  assert.equal(app.isRunning(), false);
  assert.equal(stopped, 1);
});

// ========================================
// 5. Repeated Start
// ========================================

await test('Repeated Start', async () => {
  let count = 0;

  const app = createMobileApp({
    onStart() {
      count++;
    }
  });

  await app.start();
  await app.start();

  assert.equal(count, 1);
  assert.equal(app.getStatus(), 'running');
});

// ========================================
// 6. Repeated Stop
// ========================================

await test('Repeated Stop', async () => {
  let count = 0;

  const app = createMobileApp({
    onStop() {
      count++;
    }
  });

  await app.start();
  await app.stop();
  await app.stop();

  assert.equal(count, 1);
  assert.equal(app.getStatus(), 'stopped');
});

// ========================================
// 7. Application Restart
// ========================================

await test('Application Restart', async () => {
  let started = 0;

  const app = createMobileApp({
    onStart() {
      started++;
    }
  });

  await app.start();
  await app.stop();
  await app.start();

  assert.equal(started, 2);
  assert.equal(app.getStatus(), 'running');
});

// ========================================
// 8. Mobile Runtime Integration
// ========================================

await test('Mobile Runtime Integration', () => {
  const runtime = createMobileRuntime({
    nativePlatform: 'android'
  });

  const app = createMobileApp({
    name: 'Android App',
    runtime
  });

  const info = app.getInfo();

  assert.equal(info.platform, 'android');
  assert.equal(info.isNative, true);
  assert.equal(info.isMobile, true);
});

// ========================================
// 9. Async Lifecycle
// ========================================

await test('Async Lifecycle', async () => {
  const events = [];

  const app = createMobileApp({
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

  await app.start();
  await app.stop();

  assert.deepEqual(events, [
    'initialize',
    'start',
    'stop'
  ]);
});

// ========================================
// 10. Initialization Error
// ========================================

await test('Initialization Error', async () => {
  const app = createMobileApp({
    onInitialize() {
      throw new Error('Initialization failed');
    }
  });

  await assert.rejects(
    app.initialize(),
    /Initialization failed/
  );

  assert.equal(app.getStatus(), 'created');
});

// ========================================
// 11. Start Error
// ========================================

await test('Start Error', async () => {
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
  assert.equal(app.isRunning(), false);
});

// ========================================
// 12. Stop Error
// ========================================

await test('Stop Error', async () => {
  const app = createMobileApp({
    onStop() {
      throw new Error('Stop failed');
    }
  });

  await app.start();

  await assert.rejects(
    app.stop(),
    /Stop failed/
  );

  assert.equal(app.getStatus(), 'running');
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE APPLICATION TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
