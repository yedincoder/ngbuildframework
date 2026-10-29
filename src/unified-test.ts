
import assert from 'node:assert/strict';

import {
  createFramework,
  ModuleManager,
  PluginManager,
  element,
  component,
  render,
  Web,
  loadApi,
  loadMobile
} from './index.js';

// ========================================
// NgBuild Unified Entry Point Test
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
// 1. Existing Core Exports
// ========================================

await test('Core Exports', () => {
  assert.equal(typeof createFramework, 'function');
  assert.equal(typeof ModuleManager, 'function');
  assert.equal(typeof PluginManager, 'function');
  assert.equal(typeof element, 'function');
  assert.equal(typeof component, 'function');
  assert.equal(typeof render, 'function');
});

// ========================================
// 2. Core Framework Creation
// ========================================

await test('Core Framework Creation', () => {
  const framework = createFramework();

  assert.ok(framework.modules);
  assert.ok(framework.plugins);

  framework.initialize();
  framework.shutdown();
});

// ========================================
// 3. Web Foundation
// ========================================

await test('Web Foundation Exports', () => {
  assert.equal(typeof Web.mount, 'function');
  assert.equal(typeof Web.update, 'function');
  assert.equal(typeof Web.unmount, 'function');
  assert.equal(typeof Web.createState, 'function');
  assert.equal(typeof Web.mountReactive, 'function');
  assert.equal(typeof Web.Router, 'function');
});

// ========================================
// 4. API Foundation
// ========================================

await test('API Foundation Loader', async () => {
  const api = await loadApi();

  assert.equal(typeof api.createApiServer, 'function');
  assert.equal(typeof api.createApiModule, 'function');
  assert.equal(typeof api.sendJson, 'function');
  assert.equal(typeof api.sendSuccess, 'function');
  assert.equal(typeof api.sendError, 'function');
  assert.equal(typeof api.validateBody, 'function');
});

// ========================================
// 5. Mobile Foundation
// ========================================

await test('Mobile Foundation Loader', async () => {
  const mobile = await loadMobile();

  assert.equal(
    typeof mobile.createMobileRuntime,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileApp,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileNavigation,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileScreenManager,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileState,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileStorage,
    'function'
  );

  assert.equal(
    typeof mobile.createMemoryStorageAdapter,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileDeviceBridge,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileUI,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileModule,
    'function'
  );
});

// ========================================
// 6. Mobile + Core Integration
// ========================================

await test('Mobile Module Registration Through Entry Point', async () => {
  const mobile = await loadMobile();

  const framework = createFramework();

  const mobileModule = mobile.createMobileModule({
    moduleName: 'mobile'
  });

  framework.modules.register(mobileModule);

  assert.equal(
    framework.modules.has('mobile'),
    true
  );

  framework.initialize();

  assert.equal(
    framework.modules.getStatus('mobile').initialized,
    true
  );

  framework.shutdown();
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD UNIFIED ENTRY POINT TEST ===');

console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
