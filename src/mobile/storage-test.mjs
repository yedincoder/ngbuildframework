
import assert from 'node:assert/strict';

import {
  createMobileStorage,
  createMemoryStorageAdapter
} from './storage.js';

// ========================================
// NgBuild Mobile Storage Test
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

function createTestStorage(options = {}) {
  return createMobileStorage({
    adapter: createMemoryStorageAdapter(),
    ...options
  });
}

// ========================================
// 1. Storage Creation
// ========================================

test('Storage Creation', () => {
  const storage = createTestStorage();

  assert.equal(
    storage.namespace,
    'ngbuild-mobile'
  );

  assert.deepEqual(storage.keys(), []);
});

// ========================================
// 2. String Storage
// ========================================

test('String Storage', () => {
  const storage = createTestStorage();

  storage.setItem('name', 'NgBuild');

  assert.equal(
    storage.getItem('name'),
    'NgBuild'
  );
});

// ========================================
// 3. Number Storage
// ========================================

test('Number Storage', () => {
  const storage = createTestStorage();

  storage.setItem('count', 25);

  assert.equal(storage.getItem('count'), 25);
});

// ========================================
// 4. Boolean Storage
// ========================================

test('Boolean Storage', () => {
  const storage = createTestStorage();

  storage.setItem('active', false);

  assert.equal(storage.getItem('active'), false);
});

// ========================================
// 5. Object Storage
// ========================================

test('Object Storage', () => {
  const storage = createTestStorage();

  const user = {
    id: 1,
    name: 'NgBuild'
  };

  storage.setItem('user', user);

  assert.deepEqual(
    storage.getItem('user'),
    user
  );
});

// ========================================
// 6. Array Storage
// ========================================

test('Array Storage', () => {
  const storage = createTestStorage();

  storage.setItem('items', [1, 2, 3]);

  assert.deepEqual(
    storage.getItem('items'),
    [1, 2, 3]
  );
});

// ========================================
// 7. Null Storage
// ========================================

test('Null Storage', () => {
  const storage = createTestStorage();

  storage.setItem('empty', null);

  assert.equal(storage.getItem('empty'), null);
  assert.equal(storage.hasItem('empty'), true);
});

// ========================================
// 8. Missing Item
// ========================================

test('Missing Item', () => {
  const storage = createTestStorage();

  assert.equal(storage.getItem('unknown'), null);
  assert.equal(storage.hasItem('unknown'), false);
});

// ========================================
// 9. Update Item
// ========================================

test('Update Item', () => {
  const storage = createTestStorage();

  storage.setItem('count', 1);
  storage.setItem('count', 2);

  assert.equal(storage.getItem('count'), 2);
});

// ========================================
// 10. Remove Item
// ========================================

test('Remove Item', () => {
  const storage = createTestStorage();

  storage.setItem('name', 'NgBuild');
  storage.removeItem('name');

  assert.equal(storage.getItem('name'), null);
  assert.equal(storage.hasItem('name'), false);
});

// ========================================
// 11. Has Item
// ========================================

test('Has Item', () => {
  const storage = createTestStorage();

  storage.setItem('active', true);

  assert.equal(storage.hasItem('active'), true);
  assert.equal(storage.hasItem('missing'), false);
});

// ========================================
// 12. Storage Keys
// ========================================

test('Storage Keys', () => {
  const storage = createTestStorage();

  storage.setItem('name', 'NgBuild');
  storage.setItem('count', 1);

  assert.deepEqual(
    storage.keys(),
    ['name', 'count']
  );
});

// ========================================
// 13. Clear Storage
// ========================================

test('Clear Storage', () => {
  const storage = createTestStorage();

  storage.setItem('name', 'NgBuild');
  storage.setItem('count', 10);

  storage.clear();

  assert.deepEqual(storage.keys(), []);
  assert.equal(storage.getItem('name'), null);
});

// ========================================
// 14. Namespace Isolation
// ========================================

test('Namespace Isolation', () => {
  const adapter = createMemoryStorageAdapter();

  const first = createMobileStorage({
    namespace: 'app-one',
    adapter
  });

  const second = createMobileStorage({
    namespace: 'app-two',
    adapter
  });

  first.setItem('name', 'First');
  second.setItem('name', 'Second');

  assert.equal(first.getItem('name'), 'First');
  assert.equal(second.getItem('name'), 'Second');

  first.clear();

  assert.equal(first.getItem('name'), null);
  assert.equal(second.getItem('name'), 'Second');
});

// ========================================
// 15. Shared Adapter Persistence
// ========================================

test('Shared Adapter Persistence', () => {
  const adapter = createMemoryStorageAdapter();

  const first = createMobileStorage({
    namespace: 'shared-app',
    adapter
  });

  first.setItem('token', 'abc123');

  const second = createMobileStorage({
    namespace: 'shared-app',
    adapter
  });

  assert.equal(
    second.getItem('token'),
    'abc123'
  );
});

// ========================================
// 16. Raw Adapter JSON
// ========================================

test('Raw Adapter JSON', () => {
  const adapter = createMemoryStorageAdapter();

  const storage = createMobileStorage({
    namespace: 'test',
    adapter
  });

  storage.setItem('name', 'NgBuild');

  assert.equal(
    adapter.getItem('test:name'),
    '"NgBuild"'
  );
});

// ========================================
// 17. Invalid Namespace
// ========================================

test('Invalid Namespace', () => {
  assert.throws(
    () => createTestStorage({
      namespace: ''
    }),
    /namespace must be a non-empty string/
  );

  assert.throws(
    () => createTestStorage({
      namespace: 123
    }),
    /namespace must be a non-empty string/
  );
});

// ========================================
// 18. Invalid Key
// ========================================

test('Invalid Key', () => {
  const storage = createTestStorage();

  assert.throws(
    () => storage.setItem('', 'value'),
    /key must be a non-empty string/
  );

  assert.throws(
    () => storage.getItem(null),
    /key must be a non-empty string/
  );
});

// ========================================
// 19. Invalid Adapter
// ========================================

test('Invalid Adapter', () => {
  assert.throws(
    () => createMobileStorage({
      adapter: {}
    }),
    /Invalid mobile storage adapter/
  );
});

// ========================================
// 20. Invalid JSON Value
// ========================================

test('Invalid JSON Value', () => {
  const storage = createTestStorage();

  assert.throws(
    () => storage.setItem('value', undefined),
    /must be JSON serializable/
  );
});

// ========================================
// 21. Corrupted Stored JSON
// ========================================

test('Corrupted Stored JSON', () => {
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
// 22. Adapter Clear
// ========================================

test('Memory Adapter Clear', () => {
  const adapter = createMemoryStorageAdapter();

  adapter.setItem('a', '1');
  adapter.setItem('b', '2');

  assert.equal(adapter.length, 2);

  adapter.clear();

  assert.equal(adapter.length, 0);
  assert.equal(adapter.getItem('a'), null);
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE STORAGE TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
