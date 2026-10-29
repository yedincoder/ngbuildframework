
import assert from 'node:assert/strict';

// ========================================
// NgBuild Framework Package Test
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
// 1. Main Package Import
// ========================================

await test('Main Package Import', async () => {
  const framework = await import(
    '@yedincoder/ngbuildframework'
  );

  assert.equal(
    typeof framework.createFramework,
    'function'
  );

  assert.equal(
    typeof framework.loadApi,
    'function'
  );

  assert.equal(
    typeof framework.loadMobile,
    'function'
  );
});

// ========================================
// 2. Core Package Import
// ========================================

await test('Core Package Import', async () => {
  const core = await import(
    '@yedincoder/ngbuildframework/core'
  );

  assert.equal(
    typeof core.createFramework,
    'function'
  );

  assert.equal(
    typeof core.ModuleManager,
    'function'
  );

  assert.equal(
    typeof core.PluginManager,
    'function'
  );
});

// ========================================
// 3. Web Package Import
// ========================================

await test('Web Package Import', async () => {
  const web = await import(
    '@yedincoder/ngbuildframework/web'
  );

  assert.equal(typeof web.mount, 'function');
  assert.equal(typeof web.update, 'function');
  assert.equal(typeof web.unmount, 'function');
  assert.equal(typeof web.createState, 'function');
  assert.equal(typeof web.Router, 'function');
});

// ========================================
// 4. API Package Import
// ========================================

await test('API Package Import', async () => {
  const api = await import(
    '@yedincoder/ngbuildframework/api'
  );

  assert.equal(
    typeof api.createApiServer,
    'function'
  );

  assert.equal(
    typeof api.createApiModule,
    'function'
  );

  assert.equal(
    typeof api.validateBody,
    'function'
  );

  assert.equal(
    typeof api.configureApi,
    'function'
  );
});

// ========================================
// 5. Mobile Package Import
// ========================================

await test('Mobile Package Import', async () => {
  const mobile = await import(
    '@yedincoder/ngbuildframework/mobile'
  );

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
    typeof mobile.createMobileState,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileUI,
    'function'
  );
});

// ========================================
// 6. Core Module Registration
// ========================================

await test('Core Module Registration', async () => {
  const { createFramework } = await import(
    '@yedincoder/ngbuildframework/core'
  );

  const framework = createFramework();

  framework.modules.register({
    name: 'package-test',
    setup() {},
    start() {},
    stop() {}
  });

  framework.initialize();
  framework.start('package-test');

  assert.equal(
    framework.modules.isActive('package-test'),
    true
  );

  framework.shutdown();

  assert.equal(
    framework.modules.isActive('package-test'),
    false
  );
});

// ========================================
// 7. API Server Creation
// ========================================

await test('API Server Creation', async () => {
  const { createApiServer } = await import(
    '@yedincoder/ngbuildframework/api'
  );

  const api = createApiServer({
    host: 'localhost',
    port: 0
  });

  assert.equal(
    typeof api.start,
    'function'
  );

  assert.equal(
    typeof api.stop,
    'function'
  );

  assert.equal(
    api.router.has('GET', '/api/health'),
    true
  );

  // Server has not been started.
  assert.equal(api.server.listening, false);
});

// ========================================
// 8. Mobile Navigation
// ========================================

await test('Mobile Navigation', async () => {
  const { createMobileNavigation } = await import(
    '@yedincoder/ngbuildframework/mobile'
  );

  const navigation = createMobileNavigation({
    initialRoute: '/home'
  });

  navigation.push('/profile');

  assert.equal(
    navigation.getCurrent(),
    '/profile'
  );

  navigation.back();

  assert.equal(
    navigation.getCurrent(),
    '/home'
  );
});

// ========================================
// 9. Mobile State
// ========================================

await test('Mobile State', async () => {
  const { createMobileState } = await import(
    '@yedincoder/ngbuildframework/mobile'
  );

  const state = createMobileState({
    count: 0
  });

  state.setState({
    count: 10
  });

  assert.equal(
    state.getState().count,
    10
  );
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD FRAMEWORK PACKAGE TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
