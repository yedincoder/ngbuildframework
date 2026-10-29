
// ========================================
// NgBuild Framework
// Unified Entry Point
// ========================================

// ========================================
// Core Framework
// Existing exports - preserved
// ========================================

export {
  element,
  component,
  render
} from './core/renderer.js';

export {
  ModuleManager
} from './core/module.js';

export {
  PluginManager
} from './core/plugin.js';

export {
  createFramework
} from './core/framework.js';

export type {
  Child,
  Props,
  VNode,
  Component
} from './core/renderer.js';

export type {
  NgModule,
  ModuleConfig,
  ModuleStatus,
  ModuleDependencyStatus
} from './core/module.js';

export type {
  NgPlugin
} from './core/plugin.js';

export type {
  FrameworkOptions,
  NgFramework
} from './core/framework.js';

// ========================================
// Web Foundation
// ========================================

// Access Web through the Web namespace.
// Existing Core exports remain unchanged.

export * as Web from './web/index.js';

// ========================================
// API Foundation
// ========================================

// API is loaded only when requested.
// This avoids loading Node.js HTTP modules
// automatically in browser applications.

export async function loadApi() {
  const [
    server,
    apiModule,
    response,
    validation
  ] = await Promise.all([
    import('./api/server.js'),
    import('./api/module.js'),
    import('./api/response.js'),
    import('./api/validation.js')
  ]);

  return {
    createApiServer: server.createApiServer,
    createApiModule: apiModule.createApiModule,
    sendJson: response.sendJson,
    sendSuccess: response.sendSuccess,
    sendError: response.sendError,
    validateBody: validation.validateBody
  };
}

// ========================================
// Mobile Foundation
// ========================================

// Mobile modules are loaded only
// when requested by the application.

export async function loadMobile() {
  const [
    runtime,
    app,
    navigation,
    screen,
    state,
    storage,
    device,
    ui,
    mobileModule
  ] = await Promise.all([
    import('./mobile/runtime.js'),
    import('./mobile/app.js'),
    import('./mobile/navigation.js'),
    import('./mobile/screen.js'),
    import('./mobile/state.js'),
    import('./mobile/storage.js'),
    import('./mobile/device.js'),
    import('./mobile/ui.js'),
    import('./mobile/module.js')
  ]);

  return {
    createMobileRuntime: runtime.createMobileRuntime,
    createMobileApp: app.createMobileApp,
    createMobileNavigation: navigation.createMobileNavigation,
    createMobileScreenManager:
      screen.createMobileScreenManager,
    createMobileState: state.createMobileState,
    createMobileStorage: storage.createMobileStorage,
    createMemoryStorageAdapter:
      storage.createMemoryStorageAdapter,
    createMobileDeviceBridge:
      device.createMobileDeviceBridge,
    createMobileUI: ui.createMobileUI,
    createMobileModule:
      mobileModule.createMobileModule
  };
}
