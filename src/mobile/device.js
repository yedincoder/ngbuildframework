
// ========================================
// NgBuild Mobile Device Bridge
// ========================================

import { createMobileRuntime } from './runtime.js';

export function createMobileDeviceBridge(options = {}) {
  const runtime =
    options.runtime ?? createMobileRuntime(options);

  const capabilities = new Map();

  // ========================================
  // Capability Validation
  // ========================================

  function validateName(name) {
    if (
      typeof name !== 'string' ||
      name.trim() === '' ||
      name.trim() !== name
    ) {
      throw new TypeError(
        'Device capability name must be a non-empty string'
      );
    }

    return name;
  }

  function validateAdapter(adapter) {
    if (
      !adapter ||
      typeof adapter !== 'object' ||
      Array.isArray(adapter)
    ) {
      throw new TypeError(
        'Device adapter must be an object'
      );
    }

    for (const key of ['android', 'ios', 'web']) {
      if (
        adapter[key] !== undefined &&
        typeof adapter[key] !== 'function'
      ) {
        throw new TypeError(
          `Device adapter ${key} must be a function`
        );
      }
    }

    if (
      !['android', 'ios', 'web'].some(
        key => typeof adapter[key] === 'function'
      )
    ) {
      throw new TypeError(
        'Device adapter must provide at least one handler'
      );
    }
  }

  // ========================================
  // Register Device Capability
  // ========================================

  function register(name, adapter) {
    validateName(name);
    validateAdapter(adapter);

    if (capabilities.has(name)) {
      throw new Error(
        `Device capability already registered: ${name}`
      );
    }

    capabilities.set(name, {
      android: adapter.android,
      ios: adapter.ios,
      web: adapter.web
    });

    return name;
  }

  // ========================================
  // Capability Lookup
  // ========================================

  function has(name) {
    validateName(name);

    return capabilities.has(name);
  }

  function list() {
    return [...capabilities.keys()];
  }

  // ========================================
  // Resolve Device Handler
  // ========================================

  function resolve(name) {
    validateName(name);

    const adapter = capabilities.get(name);

    if (!adapter) {
      return null;
    }

    // Only use native handlers inside a native runtime.
    if (runtime.isNative) {
      const nativeHandler = adapter[runtime.platform];

      if (typeof nativeHandler === 'function') {
        return {
          handler: nativeHandler,
          source: 'native'
        };
      }
    }

    // Optional browser/fallback handler.
    if (typeof adapter.web === 'function') {
      return {
        handler: adapter.web,
        source: 'web'
      };
    }

    return null;
  }

  // ========================================
  // Capability Availability
  // ========================================

  function isAvailable(name) {
    return resolve(name) !== null;
  }

  // ========================================
  // Device Bridge Call
  // ========================================

  async function call(name, payload = undefined) {
    const capability = resolve(name);

    if (!capability) {
      throw new Error(
        `Device capability unavailable: ${name}`
      );
    }

    return await capability.handler(payload, {
      platform: runtime.platform,
      isNative: runtime.isNative,
      source: capability.source
    });
  }

  // ========================================
  // Runtime Information
  // ========================================

  function getInfo() {
    return {
      name: 'NgBuild Mobile Device Bridge',
      platform: runtime.platform,
      isNative: runtime.isNative,
      capabilities: list()
    };
  }

  // ========================================
  // Public Device Bridge API
  // ========================================

  return {
    name: 'device',
    version: '1.0.0',
    runtime,

    register,
    has,
    list,
    resolve,
    isAvailable,
    call,
    getInfo
  };
}
