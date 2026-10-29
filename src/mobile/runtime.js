
const MOBILE_PLATFORMS = [
  'android',
  'ios',
  'web'
];

// ========================================
// NgBuild Mobile Runtime
// ========================================

export function createMobileRuntime(options = {}) {
  const environment = options.environment ?? globalThis;

  const userAgent =
    options.userAgent ??
    environment.navigator?.userAgent ??
    '';

  const nativePlatform =
    options.nativePlatform ??
    environment.Capacitor?.getPlatform?.() ??
    null;

  // ========================================
  // Platform Detection
  // ========================================

  function detectPlatform() {
    if (
      nativePlatform &&
      MOBILE_PLATFORMS.includes(nativePlatform)
    ) {
      return nativePlatform;
    }

    if (/android/i.test(userAgent)) {
      return 'android';
    }

    if (/iphone|ipad|ipod/i.test(userAgent)) {
      return 'ios';
    }

    return 'web';
  }

  const platform = detectPlatform();

  const isNative =
    nativePlatform === 'android' ||
    nativePlatform === 'ios';

  const isMobile =
    platform === 'android' ||
    platform === 'ios';

  // ========================================
  // Runtime Information
  // ========================================

  function getInfo() {
    return {
      name: 'NgBuild Mobile',
      platform,
      isNative,
      isMobile,
      isWeb: !isNative,
      userAgent
    };
  }

  // ========================================
  // Public Runtime
  // ========================================

  return {
    name: 'mobile',
    version: '1.0.0',

    platform,
    isNative,
    isMobile,

    getInfo,

    isAndroid() {
      return platform === 'android';
    },

    isIOS() {
      return platform === 'ios';
    },

    isWeb() {
      return !isNative;
    }
  };
}
