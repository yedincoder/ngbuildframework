
// ========================================
// NgBuild Mobile State
// ========================================

export function createMobileState(initialState = {}) {
  function isStateObject(value) {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    );
  }

  if (!isStateObject(initialState)) {
    throw new TypeError(
      'Initial mobile state must be an object'
    );
  }

  // ========================================
  // Internal State
  // ========================================

  const initial = { ...initialState };
  let state = { ...initial };

  const listeners = new Set();

  // ========================================
  // Get State
  // ========================================

  function getState() {
    return { ...state };
  }

  // ========================================
  // State Change Detection
  // ========================================

  function hasChanged(nextState) {
    const currentKeys = Object.keys(state);
    const nextKeys = Object.keys(nextState);

    if (currentKeys.length !== nextKeys.length) {
      return true;
    }

    return nextKeys.some(key => {
      return !Object.prototype.hasOwnProperty.call(
        state,
        key
      ) || !Object.is(state[key], nextState[key]);
    });
  }

  // ========================================
  // Notify State Listeners
  // ========================================

  function notify(previousState) {
    for (const listener of [...listeners]) {
      listener(getState(), { ...previousState });
    }
  }

  // ========================================
  // Set State
  // ========================================

  function setState(update) {
    const changes =
      typeof update === 'function'
        ? update(getState())
        : update;

    if (!isStateObject(changes)) {
      throw new TypeError(
        'Mobile state update must be an object'
      );
    }

    const nextState = {
      ...state,
      ...changes
    };

    if (!hasChanged(nextState)) {
      return getState();
    }

    const previousState = getState();

    state = nextState;

    notify(previousState);

    return getState();
  }

  // ========================================
  // Subscribe State Changes
  // ========================================

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError(
        'Mobile state listener must be a function'
      );
    }

    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  // ========================================
  // Reset State
  // ========================================

  function reset() {
    const nextState = { ...initial };

    if (!hasChanged(nextState)) {
      return getState();
    }

    const previousState = getState();

    state = nextState;

    notify(previousState);

    return getState();
  }

  // ========================================
  // Public State API
  // ========================================

  return {
    getState,
    setState,
    subscribe,
    reset
  };
}
