
// ========================================
// NgBuild Mobile Navigation
// ========================================

export function createMobileNavigation(options = {}) {
  const initialRoute = options.initialRoute ?? '/';

  // ========================================
  // Route Validation
  // ========================================

  function validateRoute(route) {
    if (
      typeof route !== 'string' ||
      !route.startsWith('/') ||
      route.startsWith('//') ||
      route.trim() !== route
    ) {
      throw new Error('Invalid mobile route');
    }

    return route;
  }

  // ========================================
  // Navigation Stack
  // ========================================

  const stack = [
    validateRoute(initialRoute)
  ];

  const listeners = new Set();

  // ========================================
  // Navigation Information
  // ========================================

  function getCurrent() {
    return stack[stack.length - 1];
  }

  function getHistory() {
    return [...stack];
  }

  function canGoBack() {
    return stack.length > 1;
  }

  // ========================================
  // Change Notifications
  // ========================================

  function notify(action) {
    const event = {
      action,
      current: getCurrent(),
      history: getHistory(),
      canGoBack: canGoBack()
    };

    for (const listener of [...listeners]) {
      listener(event);
    }
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError(
        'Navigation listener must be a function'
      );
    }

    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  // ========================================
  // Push Navigation
  // ========================================

  function push(route) {
    validateRoute(route);

    stack.push(route);
    notify('push');

    return getCurrent();
  }

  // ========================================
  // Back Navigation
  // ========================================

  function back() {
    if (!canGoBack()) {
      return getCurrent();
    }

    stack.pop();
    notify('back');

    return getCurrent();
  }

  // ========================================
  // Replace Navigation
  // ========================================

  function replace(route) {
    validateRoute(route);

    stack[stack.length - 1] = route;
    notify('replace');

    return getCurrent();
  }

  // ========================================
  // Reset Navigation
  // ========================================

  function reset(route = initialRoute) {
    validateRoute(route);

    stack.length = 0;
    stack.push(route);

    notify('reset');

    return getCurrent();
  }

  // ========================================
  // Public Navigation API
  // ========================================

  return {
    push,
    back,
    replace,
    reset,

    getCurrent,
    getHistory,
    canGoBack,
    subscribe
  };
}
