
import { ModuleManager } from './module.js';
import { PluginManager } from './plugin.js';

import type { NgModule } from './module.js';
import type { NgPlugin } from './plugin.js';

export interface FrameworkOptions {
  modules?: NgModule[];
  plugins?: NgPlugin[];
}

export interface NgFramework {
  modules: ModuleManager;
  plugins: PluginManager;
  initialize(): void;
  start(name: string): void;
  stop(name: string): void;
  shutdown(): void;
}

export function createFramework(
  options: FrameworkOptions = {}
): NgFramework {
  const modules = new ModuleManager();
  const plugins = new PluginManager(modules);

  for (const module of options.modules ?? []) {
    modules.register(module);
  }

  for (const plugin of options.plugins ?? []) {
    plugins.register(plugin);
  }

  return {
    modules,
    plugins,

    initialize(): void {
      modules.initialize();
    },

    start(name: string): void {
      modules.start(name);
    },

    stop(name: string): void {
      modules.stop(name);
    },

    shutdown(): void {
      modules.stopAll();
    }
  };
}
