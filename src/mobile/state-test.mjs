
import assert from 'node:assert/strict';

import {
  createMobileState
} from './state.js';

// ========================================
// NgBuild Mobile State Test
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
// 1. Empty State
// ========================================

test('Empty State', () => {
  const store = createMobileState();

  assert.deepEqual(
    store.getState(),
    {}
  );
});

// ========================================
// 2. Initial State
// ========================================

test('Initial State', () => {
  const store = createMobileState({
    count: 0,
    name: 'NgBuild'
  });

  assert.deepEqual(store.getState(), {
    count: 0,
    name: 'NgBuild'
  });
});

// ========================================
// 3. Set State
// ========================================

test('Set State', () => {
  const store = createMobileState({
    count: 0
  });

  store.setState({
    count: 1
  });

  assert.equal(
    store.getState().count,
    1
  );
});

// ========================================
// 4. Partial Update
// ========================================

test('Partial State Update', () => {
  const store = createMobileState({
    name: 'NgBuild',
    count: 0
  });

  store.setState({
    count: 5
  });

  assert.deepEqual(store.getState(), {
    name: 'NgBuild',
    count: 5
  });
});

// ========================================
// 5. New State Property
// ========================================

test('New State Property', () => {
  const store = createMobileState({
    count: 1
  });

  store.setState({
    active: true
  });

  assert.deepEqual(store.getState(), {
    count: 1,
    active: true
  });
});

// ========================================
// 6. Functional State Update
// ========================================

test('Functional State Update', () => {
  const store = createMobileState({
    count: 1
  });

  store.setState(previous => ({
    count: previous.count + 1
  }));

  assert.equal(
    store.getState().count,
    2
  );
});

// ========================================
// 7. Multiple State Updates
// ========================================

test('Multiple State Updates', () => {
  const store = createMobileState({
    count: 0
  });

  store.setState({ count: 1 });
  store.setState({ count: 2 });
  store.setState({ count: 3 });

  assert.equal(
    store.getState().count,
    3
  );
});

// ========================================
// 8. State Change Event
// ========================================

test('State Change Event', () => {
  const store = createMobileState({
    count: 0
  });

  const events = [];

  store.subscribe((current, previous) => {
    events.push({
      current: current.count,
      previous: previous.count
    });
  });

  store.setState({
    count: 1
  });

  assert.deepEqual(events, [
    {
      current: 1,
      previous: 0
    }
  ]);
});

// ========================================
// 9. Multiple Listeners
// ========================================

test('Multiple State Listeners', () => {
  const store = createMobileState({
    count: 0
  });

  let first = 0;
  let second = 0;

  store.subscribe(() => {
    first++;
  });

  store.subscribe(() => {
    second++;
  });

  store.setState({
    count: 1
  });

  assert.equal(first, 1);
  assert.equal(second, 1);
});

// ========================================
// 10. Unsubscribe
// ========================================

test('Unsubscribe State Listener', () => {
  const store = createMobileState({
    count: 0
  });

  let count = 0;

  const unsubscribe = store.subscribe(() => {
    count++;
  });

  store.setState({ count: 1 });

  unsubscribe();

  store.setState({ count: 2 });

  assert.equal(count, 1);
});

// ========================================
// 11. Unchanged State
// ========================================

test('Unchanged State', () => {
  const store = createMobileState({
    count: 1
  });

  let notifications = 0;

  store.subscribe(() => {
    notifications++;
  });

  store.setState({
    count: 1
  });

  assert.equal(notifications, 0);
  assert.equal(store.getState().count, 1);
});

// ========================================
// 12. Reset State
// ========================================

test('Reset State', () => {
  const store = createMobileState({
    count: 0,
    name: 'NgBuild'
  });

  store.setState({
    count: 10,
    active: true
  });

  store.reset();

  assert.deepEqual(store.getState(), {
    count: 0,
    name: 'NgBuild'
  });
});

// ========================================
// 13. Reset Notification
// ========================================

test('Reset State Notification', () => {
  const store = createMobileState({
    count: 0
  });

  let notifications = 0;

  store.subscribe(() => {
    notifications++;
  });

  store.setState({ count: 5 });
  store.reset();

  assert.equal(notifications, 2);
  assert.equal(store.getState().count, 0);
});

// ========================================
// 14. State Snapshot Protection
// ========================================

test('State Snapshot Protection', () => {
  const store = createMobileState({
    count: 1
  });

  const snapshot = store.getState();

  snapshot.count = 999;

  assert.equal(
    store.getState().count,
    1
  );
});

// ========================================
// 15. Initial State Protection
// ========================================

test('Initial State Protection', () => {
  const initial = {
    count: 1
  };

  const store = createMobileState(initial);

  initial.count = 999;

  assert.equal(
    store.getState().count,
    1
  );

  store.setState({ count: 5 });
  store.reset();

  assert.equal(
    store.getState().count,
    1
  );
});

// ========================================
// 16. Invalid Initial State
// ========================================

test('Invalid Initial State', () => {
  assert.throws(
    () => createMobileState(null),
    /Initial mobile state must be an object/
  );

  assert.throws(
    () => createMobileState([]),
    /Initial mobile state must be an object/
  );
});

// ========================================
// 17. Invalid State Update
// ========================================

test('Invalid State Update', () => {
  const store = createMobileState({
    count: 1
  });

  assert.throws(
    () => store.setState(null),
    /Mobile state update must be an object/
  );

  assert.throws(
    () => store.setState([1, 2]),
    /Mobile state update must be an object/
  );

  assert.equal(
    store.getState().count,
    1
  );
});

// ========================================
// 18. Invalid State Listener
// ========================================

test('Invalid State Listener', () => {
  const store = createMobileState();

  assert.throws(
    () => store.subscribe(null),
    /Mobile state listener must be a function/
  );
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD MOBILE STATE TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
