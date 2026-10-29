
// ========================================
// NgBuild Mobile Screen Manager
// ========================================

import { createMobileNavigation } from './navigation.js';

export function createMobileScreenManager(options = {}) {
  const navigation =
    options.navigation ?? createMobileNavigation();

  const screens = new Map();
  const listeners = new Set();

  const notFound =
    options.notFound ??
    ((route) => `Screen not found: ${route}`);

  if (typeof notFound !== 'function') {
    throw new TypeError(
      'Screen notFound handler must be a function'
    );
  }

  if (
    typeof navigation.getCurrent !== 'function' ||
    typeof navigation.subscribe !== 'function'
  ) {
    throw new TypeError('Invalid mobile navigation');
  }

  let destroyed = false;
  let currentScreen = null;

  // ========================================
  // Screen Validation
  // ========================================

  function validateRoute(route) {
    if (
      typeof route !== 'string' ||
      !route.startsWith('/') ||
      route.startsWith('//') ||
      route.trim() !== route
    ) {
      throw new Error('Invalid mobile screen route');
    }
  }

  function ensureActive() {
    if (destroyed) {
      throw new Error('Screen Manager is destroyed');
    }
  }

  // ========================================
  // Register Screen
  // ========================================

  function register(route, renderer) {
    ensureActive();
    validateRoute(route);

    if (typeof renderer !== 'function') {
      throw new TypeError(
        'Screen renderer must be a function'
      );
    }

    if (screens.has(route)) {
      throw new Error(
        `Mobile screen already registered: ${route}`
      );
    }

    screens.set(route, renderer);

    return route;
  }

  // ========================================
  // Resolve Screen
  // ========================================

  function resolve(route) {
    validateRoute(route);

    return screens.get(route) ?? null;
  }

  function has(route) {
    validateRoute(route);

    return screens.has(route);
  }

  function list() {
    return [...screens.keys()];
  }

  // ========================================
  // Render Screen
  // ========================================

  function render(route = navigation.getCurrent()) {
    ensureActive();
    validateRoute(route);

    const renderer = resolve(route);

    const context = {
      route,
      navigation
    };

    const content = renderer
      ? renderer(context)
      : notFound(route, context);

    return {
      route,
      found: Boolean(renderer),
      content
    };
  }

  // ========================================
  // Active Screen
  // ========================================

  function getCurrent() {
    ensureActive();

    const route = navigation.getCurrent();

    if (!currentScreen || currentScreen.route !== route) {
      currentScreen = render(route);
    }

    return currentScreen;
  }

  function refresh() {
    ensureActive();

    currentScreen = render();

    notify({
      action: 'refresh',
      screen: currentScreen
    });

    return currentScreen;
  }

  // ========================================
  // Screen Change Events
  // ========================================

  function notify(event) {
    for (const listener of [...listeners]) {
      listener(event);
    }
  }

  function subscribe(listener) {
    ensureActive();

    if (typeof listener !== 'function') {
      throw new TypeError(
        'Screen listener must be a function'
      );
    }

    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  // ========================================
  // Navigation Integration
  // ========================================

  const unsubscribeNavigation =
    navigation.subscribe((event) => {
      if (destroyed) {
        return;
      }

      currentScreen = render(event.current);

      notify({
        action: event.action,
        screen: currentScreen
      });
    });

  // ========================================
  // Destroy Screen Manager
  // ========================================

  function destroy() {
    if (destroyed) {
      return;
    }

    unsubscribeNavigation();

    listeners.clear();
    screens.clear();

    currentScreen = null;
    destroyed = true;
  }

  // ========================================
  // Public Screen API
  // ========================================

  return {
    navigation,

    register,
    resolve,
    has,
    list,

    render,
    getCurrent,
    refresh,

    subscribe,
    destroy
  };
}
