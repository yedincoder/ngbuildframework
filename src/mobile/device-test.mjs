
import assert from 'node:assert/strict';

import {
  createMobileRuntime
} from './runtime.js';

import {
  createMobileDeviceBridge
} from './device.js';

// ========================================
// NgBuild Mobile Device Bridge Test
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

function createBridge(platform = 'web') {
  const runtime = createMobileRuntime({
    nativePlatform: platform
  });

  return createMobileDeviceBridge({ runtime });
}

// ========================================
// 1. Bridge Creation
// ========================================

await test('Device Bridge Creation', () => {
  const bridge = createBridge();

  assert.equal(bridge.name, 'device');
  assert.deepEqual(bridge.list(), []);
});

// ========================================
// 2. Register Capability
// ========================================

await test('Register Device Capability', () => {
  const bridge = createBridge();

  bridge.register('camera', {
    web: () => 'web-camera'
  });

  assert.equal(bridge.has('camera'), true);
  assert.deepEqual(bridge.list(), ['camera']);
});

// ========================================
// 3. Missing Capability
// ========================================

await test('Missing Device Capability', () => {
  const bridge = createBridge();

  assert.equal(bridge.has('camera'), false);
  assert.equal(bridge.isAvailable('camera'), false);
  assert.equal(bridge.resolve('camera'), null);
});

// ========================================
// 4. Web Handler
// ========================================

await test('Web Device Handler', async () => {
  const bridge = createBridge();

  bridge.register('deviceInfo', {
    web: () => ({
      platform: 'web'
    })
  });

  const result = await bridge.call('deviceInfo');

  assert.deepEqual(result, {
    platform: 'web'
  });
});

// ========================================
// 5. Android Native Handler
// ========================================

await test('Android Native Handler', async () => {
  const bridge = createBridge('android');

  bridge.register('camera', {
    android: () => 'android-camera',
    ios: () => 'ios-camera',
    web: () => 'web-camera'
  });

  assert.equal(
    await bridge.call('camera'),
    'android-camera'
  );
});

// ========================================
// 6. iOS Native Handler
// ========================================

await test('iOS Native Handler', async () => {
  const bridge = createBridge('ios');

  bridge.register('camera', {
    android: () => 'android-camera',
    ios: () => 'ios-camera',
    web: () => 'web-camera'
  });

  assert.equal(
    await bridge.call('camera'),
    'ios-camera'
  );
});

// ========================================
// 7. Native Handler Priority
// ========================================

await test('Native Handler Priority', async () => {
  const bridge = createBridge('android');

  bridge.register('share', {
    android: () => 'native',
    web: () => 'fallback'
  });

  assert.equal(
    await bridge.call('share'),
    'native'
  );
});

// ========================================
// 8. Native Fallback To Web
// ========================================

await test('Native Fallback To Web', async () => {
  const bridge = createBridge('android');

  bridge.register('share', {
    ios: () => 'ios-share',
    web: () => 'web-share'
  });

  assert.equal(
    await bridge.call('share'),
    'web-share'
  );
});

// ========================================
// 9. Browser Cannot Use Native Handler
// ========================================

await test('Browser Native Restriction', async () => {
  const runtime = createMobileRuntime({
    userAgent: 'Mozilla/5.0 (Linux; Android 15)'
  });

  const bridge = createMobileDeviceBridge({
    runtime
  });

  bridge.register('camera', {
    android: () => 'native-camera'
  });

  assert.equal(runtime.isNative, false);
  assert.equal(bridge.isAvailable('camera'), false);

  await assert.rejects(
    bridge.call('camera'),
    /Device capability unavailable/
  );
});

// ========================================
// 10. Payload Forwarding
// ========================================

await test('Device Payload Forwarding', async () => {
  const bridge = createBridge();

  bridge.register('share', {
    web: payload => payload.text
  });

  const result = await bridge.call('share', {
    text: 'Hello NgBuild'
  });

  assert.equal(result, 'Hello NgBuild');
});

// ========================================
// 11. Handler Context
// ========================================

await test('Device Handler Context', async () => {
  const bridge = createBridge('android');

  bridge.register('deviceInfo', {
    android: (payload, context) => context
  });

  const result = await bridge.call('deviceInfo');

  assert.deepEqual(result, {
    platform: 'android',
    isNative: true,
    source: 'native'
  });
});

// ========================================
// 12. Async Device Handler
// ========================================

await test('Async Device Handler', async () => {
  const bridge = createBridge();

  bridge.register('deviceInfo', {
    async web() {
      await Promise.resolve();

      return 'async-result';
    }
  });

  assert.equal(
    await bridge.call('deviceInfo'),
    'async-result'
  );
});

// ========================================
// 13. Device Handler Error
// ========================================

await test('Device Handler Error', async () => {
  const bridge = createBridge();

  bridge.register('camera', {
    web() {
      throw new Error('Camera failed');
    }
  });

  await assert.rejects(
    bridge.call('camera'),
    /Camera failed/
  );
});

// ========================================
// 14. Unavailable Capability
// ========================================

await test('Unavailable Device Capability', async () => {
  const bridge = createBridge('ios');

  bridge.register('camera', {
    android: () => 'android-only'
  });

  assert.equal(bridge.has('camera'), true);
  assert.equal(bridge.isAvailable('camera'), false);

  await assert.rejects(
    bridge.call('camera'),
    /Device capability unavailable/
  );
});

// ========================================
// 15. Duplicate Registration
// ========================================

await test('Duplicate Capability Registration', () => {
  const bridge = createBridge();

  bridge.register('camera', {
    web: () => null
  });

  assert.throws(
    () => bridge.register('camera', {
      web: () => null
    }),
    /already registered/
  );
});

// ========================================
// 16. Invalid Capability Name
// ========================================

await test('Invalid Capability Name', () => {
  const bridge = createBridge();

  assert.throws(
    () => bridge.register('', {
      web: () => null
    }),
    /non-empty string/
  );
});

// ========================================
// 17. Invalid Device Adapter
// ========================================

await test('Invalid Device Adapter', () => {
  const bridge = createBridge();

  assert.throws(
    () => bridge.register('camera', {}),
    /at least one handler/
  );

  assert.throws(
    () => bridge.register('camera', {
      web: 'invalid'
    }),
    /must be a function/
  );
});

// ========================================
// 18. Runtime Information
// ========================================

await test('Device Bridge Information', () => {
  const bridge = createBridge('android');

  bridge.register('camera', {
    android: () => 'camera'
  });

  const info = bridge.getInfo();

  assert.equal(info.platform, 'android');
  assert.equal(info.isNative, true);
  assert.deepEqual(info.capabilities, ['camera']);
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE DEVICE BRIDGE TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
