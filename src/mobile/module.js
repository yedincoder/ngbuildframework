
import { createMobileApp } from './app.js';

// ========================================
// NgBuild Mobile Core Module
// ========================================

export function createMobileModule(options = {}) {
  const name = options.moduleName ?? 'mobile';

  const app = options.app ?? createMobileApp({
    name: options.name ?? 'NgBuild Mobile App',
    runtime: options.runtime,
    onInitialize: options.onInitialize,
    onStart: options.onStart,
    onStop: options.onStop
  });

  if (
    !app ||
    typeof app.initialize !== 'function' ||
    typeof app.start !== 'function' ||
    typeof app.stop !== 'function' ||
    typeof app.getStatus !== 'function'
  ) {
    throw new TypeError('Invalid mobile application');
  }

  let startTask = Promise.resolve();
  let stopTask = Promise.resolve();

  let starting = false;
  let stopping = false;

  // ========================================
  // Core Module
  // ========================================

  return {
    name,
    version: '1.0.0',
    app,

    // ========================================
    // Setup - Synchronous Core Lifecycle
    // ========================================

    setup() {
      // Application initialization is handled
      // by app.start(), which supports async hooks.
    },

    // ========================================
    // Start - Synchronous Core Lifecycle
    // ========================================

    start() {
      if (starting || app.isRunning()) {
        return;
      }

      starting = true;

      startTask = (async () => {
        await stopTask;
        await app.start();
      })();

      // Prevent an unhandled rejection before
      // whenReady() is called.
      void startTask.catch(() => {});

      void startTask.finally(() => {
        starting = false;
      }).catch(() => {});
    },

    // ========================================
    // Stop - Synchronous Core Lifecycle
    // ========================================

    stop() {
      if (stopping) {
        return;
      }

      stopping = true;

      stopTask = (async () => {
        await startTask;
        await app.stop();
      })();

      // Keep errors available to whenStopped().
      void stopTask.catch(() => {});

      void stopTask.finally(() => {
        stopping = false;
      }).catch(() => {});
    },

    // ========================================
    // Async Completion Helpers
    // ========================================

    whenReady() {
      return startTask;
    },

    whenStopped() {
      return stopTask;
    },

    // ========================================
    // Module Information
    // ========================================

    getStatus() {
      return app.getStatus();
    },

    getInfo() {
      return {
        module: name,
        ...app.getInfo()
      };
    }
  };
}
