
import {
  ModuleManager
} from './module.js';

import type {
  NgModule
} from './module.js';

export interface NgPlugin extends NgModule {}

export class PluginManager {
  constructor(
    private readonly manager: ModuleManager
  ) {}

  register(plugin: NgPlugin): void {
    this.manager.register(plugin);
  }

  start(name: string): void {
    this.manager.start(name);
  }

  stop(name: string): void {
    this.manager.stop(name);
  }

  has(name: string): boolean {
    return this.manager.has(name);
  }

  isActive(name: string): boolean {
    return this.manager.isActive(name);
  }
}
