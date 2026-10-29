
import { createMobileRuntime } from './runtime.js';

// ========================================
// NgBuild Mobile Application
// ========================================

export function createMobileApp(options = {}) {
  const name = options.name ?? 'NgBuild Mobile App';

  const runtime = options.runtime ??
    createMobileRuntime(options);

  const hooks = {
    onInitialize: options.onInitialize,
    onStart: options.onStart,
    onStop: options.onStop
  };

  for (const [name, hook] of Object.entries(hooks)) {
    if (hook !== undefined && typeof hook !== 'function') {
      throw new TypeError(`${name} must be a function`);
    }
  }

  let status = 'created';
  let pending = null;

  // ========================================
  // Application Information
  // ========================================

  function getStatus() {
    return status;
  }

  function getInfo() {
    return {
      name,
      status,
      platform: runtime.platform,
      isNative: runtime.isNative,
      isMobile: runtime.isMobile
    };
  }

  // ========================================
  // Lifecycle Execution
  // ========================================

  function runLifecycle(action) {
    if (pending) {
      return pending;
    }

    const operation = (async () => {
      return action();
    })();

    pending = operation;

    void operation.finally(() => {
      if (pending === operation) {
        pending = null;
      }
    }).catch(() => {});

    return operation;
  }

  // ========================================
  // Initialize Application
  // ========================================

  async function initialize() {
    if (pending) {
      await pending;
    }

    if (status !== 'created') {
      return getInfo();
    }

    return runLifecycle(async () => {
      await hooks.onInitialize?.(getInfo());
      status = 'initialized';

      return getInfo();
    });
  }

  // ========================================
  // Start Application
  // ========================================

  async function start() {
    if (pending) {
      await pending;
    }

    if (status === 'running') {
      return getInfo();
    }

    if (status === 'created') {
      await initialize();
    }

    return runLifecycle(async () => {
      await hooks.onStart?.(getInfo());
      status = 'running';

      return getInfo();
    });
  }

  // ========================================
  // Stop Application
  // ========================================

  async function stop() {
    if (pending) {
      await pending;
    }

    if (status !== 'running') {
      return getInfo();
    }

    return runLifecycle(async () => {
      await hooks.onStop?.(getInfo());
      status = 'stopped';

      return getInfo();
    });
  }

  // ========================================
  // Public Application API
  // ========================================

  return {
    name,
    version: '1.0.0',
    runtime,

    initialize,
    start,
    stop,

    getStatus,
    getInfo,

    isRunning() {
      return status === 'running';
    }
  };
}
