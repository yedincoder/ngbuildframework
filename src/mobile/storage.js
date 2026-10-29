
// ========================================
// NgBuild Mobile Storage
// ========================================

export function createMemoryStorageAdapter() {
  const data = new Map();

  return {
    get length() {
      return data.size;
    },

    key(index) {
      return [...data.keys()][index] ?? null;
    },

    getItem(key) {
      return data.has(String(key))
        ? data.get(String(key))
        : null;
    },

    setItem(key, value) {
      data.set(String(key), String(value));
    },

    removeItem(key) {
      data.delete(String(key));
    },

    clear() {
      data.clear();
    }
  };
}

// ========================================
// Browser Storage Detection
// ========================================

function getBrowserStorage() {
  try {
    const storage = globalThis.localStorage;

    if (
      storage &&
      typeof storage.getItem === 'function' &&
      typeof storage.setItem === 'function' &&
      typeof storage.removeItem === 'function' &&
      typeof storage.key === 'function'
    ) {
      return storage;
    }
  } catch {
    // localStorage may be unavailable or blocked.
  }

  return null;
}

// ========================================
// Mobile Storage Factory
// ========================================

export function createMobileStorage(options = {}) {
  const namespace = options.namespace ?? 'ngbuild-mobile';

  if (
    typeof namespace !== 'string' ||
    namespace.trim() === ''
  ) {
    throw new TypeError(
      'Mobile storage namespace must be a non-empty string'
    );
  }

  const adapter =
    options.adapter ??
    getBrowserStorage() ??
    createMemoryStorageAdapter();

  if (
    !adapter ||
    typeof adapter.getItem !== 'function' ||
    typeof adapter.setItem !== 'function' ||
    typeof adapter.removeItem !== 'function' ||
    typeof adapter.key !== 'function' ||
    typeof adapter.length !== 'number'
  ) {
    throw new TypeError('Invalid mobile storage adapter');
  }

  const prefix = `${namespace}:`;

  // ========================================
  // Key Validation
  // ========================================

  function validateKey(key) {
    if (
      typeof key !== 'string' ||
      key.length === 0
    ) {
      throw new TypeError(
        'Mobile storage key must be a non-empty string'
      );
    }

    return `${prefix}${key}`;
  }

  // ========================================
  // Set Item
  // ========================================

  function setItem(key, value) {
    const storageKey = validateKey(key);
    const serialized = JSON.stringify(value);

    if (serialized === undefined) {
      throw new TypeError(
        'Mobile storage value must be JSON serializable'
      );
    }

    adapter.setItem(storageKey, serialized);

    return value;
  }

  // ========================================
  // Get Item
  // ========================================

  function getItem(key) {
    const storageKey = validateKey(key);
    const value = adapter.getItem(storageKey);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      throw new Error(
        `Invalid stored JSON for key: ${key}`
      );
    }
  }

  // ========================================
  // Has Item
  // ========================================

  function hasItem(key) {
    const storageKey = validateKey(key);

    return adapter.getItem(storageKey) !== null;
  }

  // ========================================
  // Remove Item
  // ========================================

  function removeItem(key) {
    const storageKey = validateKey(key);

    adapter.removeItem(storageKey);
  }

  // ========================================
  // List Stored Keys
  // ========================================

  function keys() {
    const result = [];

    for (let i = 0; i < adapter.length; i++) {
      const key = adapter.key(i);

      if (
        typeof key === 'string' &&
        key.startsWith(prefix)
      ) {
        result.push(key.slice(prefix.length));
      }
    }

    return result;
  }

  // ========================================
  // Clear Current Namespace
  // ========================================

  function clear() {
    const storedKeys = keys();

    for (const key of storedKeys) {
      removeItem(key);
    }
  }

  // ========================================
  // Public Storage API
  // ========================================

  return {
    namespace,
    adapter,

    setItem,
    getItem,
    hasItem,
    removeItem,
    clear,
    keys
  };
}
