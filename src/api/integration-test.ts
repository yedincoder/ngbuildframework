
import assert from 'node:assert/strict';
import { once } from 'node:events';

import { createFramework } from '../core/framework';
import { createApiModule } from './module.js';

async function main() {
  const framework = createFramework();

  const apiModule = createApiModule({
    name: 'api',
    host: 'localhost',
    port: 0
  });

  let passed = 0;

  // ========================================
  // 1. Module Registration
  // ========================================

  framework.modules.register(apiModule);

  assert.equal(
    framework.modules.has('api'),
    true
  );

  console.log('[PASS] API Module Registration');
  passed++;

  // ========================================
  // 2. Module Initialization
  // ========================================

  framework.initialize();

  assert.equal(
    framework.modules.getStatus('api').initialized,
    true
  );

  console.log('[PASS] API Module Initialization');
  passed++;

  // ========================================
  // 3. Start Through Core
  // ========================================

  const listening = once(
    apiModule.server,
    'listening'
  );

  framework.start('api');

  // Wait until HTTP server is actually listening.
  await listening;

  assert.equal(
    framework.modules.isActive('api'),
    true
  );

  assert.equal(
    apiModule.server.listening,
    true
  );

  console.log('[PASS] API Module Started Through Core');
  passed++;

  // ========================================
  // 4. Real HTTP Health Check
  // ========================================

  const address = apiModule.server.address();

  assert.ok(
    address &&
    typeof address !== 'string'
  );

  const base = `http://localhost:${address.port}`;

  const healthResponse = await fetch(
    `${base}/api/health`
  );

  const healthData = await healthResponse.json();

  assert.equal(
    healthResponse.status,
    200
  );

  assert.deepEqual(healthData, {
    success: true,
    message: 'NgBuild API running'
  });

  console.log('[PASS] API HTTP Health Check');
  passed++;

  // ========================================
  // 5. Existing Route Parameters
  // ========================================

  const userResponse = await fetch(
    `${base}/api/users/123`
  );

  const userData = await userResponse.json();

  assert.equal(userResponse.status, 200);
  assert.equal(userData.params.id, '123');

  console.log('[PASS] Existing API Routes');
  passed++;

  // ========================================
  // 6. Stop Through Core
  // ========================================

  const closed = once(
    apiModule.server,
    'close'
  );

  framework.stop('api');

  // Wait until HTTP server has actually closed.
  await closed;

  assert.equal(
    framework.modules.isActive('api'),
    false
  );

  assert.equal(
    apiModule.server.listening,
    false
  );

  console.log('[PASS] API Module Stopped Through Core');
  passed++;

  // ========================================
  // 7. Framework Shutdown
  // ========================================

  framework.shutdown();

  assert.equal(
    framework.modules.isActive('api'),
    false
  );

  console.log('[PASS] Framework Shutdown');
  passed++;

  // ========================================
  // Result
  // ========================================

  console.log('');
  console.log('=== API CORE INTEGRATION RESULT ===');
  console.log(`Passed: ${passed}`);
  console.log('Failed: 0');
  console.log(`Total: ${passed}`);
}

main().catch(error => {
  console.error(
    '[FAIL] API Core Integration:',
    error
  );

  process.exitCode = 1;
});
