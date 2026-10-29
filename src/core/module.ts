
export interface ModuleConfig {
  [key: string]: unknown;
}

export interface NgModule {
  name: string;
  version?: string;
  dependencies?: string[];
  config?: ModuleConfig;
  setup?: () => void;
  start?: () => void;
  stop?: () => void;
}

export interface ModuleDependencyStatus {
  name: string;
  registered: boolean;
  active: boolean;
}

export interface ModuleStatus {
  name: string;
  version?: string;
  registered: boolean;
  initialized: boolean;
  active: boolean;
  dependencies: ModuleDependencyStatus[];
}

export class ModuleManager {
  private modules = new Map<string, NgModule>();
  private activeModules = new Set<string>();
  private initializedModules = new Set<string>();
  private moduleConfigs = new Map<string, ModuleConfig>();

  register(module: NgModule): void {
    if (!module.name.trim()) {
      throw new Error('Module name is required.');
    }

    if (this.modules.has(module.name)) {
      throw new Error(
        `Module already registered: ${module.name}`
      );
    }

    this.modules.set(module.name, module);
    this.moduleConfigs.set(module.name, {
      ...(module.config ?? {})
    });
  }

  setConfig(name: string, config: ModuleConfig): void {
    if (!this.modules.has(name)) {
      throw new Error(`Module not found: ${name}`);
    }

    const current = this.moduleConfigs.get(name) ?? {};

    this.moduleConfigs.set(name, {
      ...current,
      ...config
    });
  }

  getConfig(name: string): ModuleConfig {
    if (!this.modules.has(name)) {
      throw new Error(`Module not found: ${name}`);
    }

    return {
      ...(this.moduleConfigs.get(name) ?? {})
    };
  }

  initialize(): void {
    for (const module of this.modules.values()) {
      if (this.initializedModules.has(module.name)) {
        continue;
      }

      module.setup?.();
      this.initializedModules.add(module.name);
    }
  }

  start(name: string): void {
    const order = this.resolveDependencies(name);
    const started: string[] = [];

    try {
      for (const moduleName of order) {
        if (this.activeModules.has(moduleName)) {
          continue;
        }

        const module = this.modules.get(moduleName)!;

        if (!this.initializedModules.has(moduleName)) {
          module.setup?.();
          this.initializedModules.add(moduleName);
        }

        module.start?.();
        this.activeModules.add(moduleName);
        started.push(moduleName);
      }
    } catch (error) {
      const rollbackErrors: Error[] = [];

      for (const moduleName of started.reverse()) {
        const module = this.modules.get(moduleName)!;

        try {
          module.stop?.();
          this.activeModules.delete(moduleName);
        } catch (rollbackError) {
          rollbackErrors.push(
            rollbackError instanceof Error
              ? rollbackError
              : new Error(String(rollbackError))
          );
        }
      }

      if (rollbackErrors.length > 0) {
        throw new AggregateError(
          [error, ...rollbackErrors],
          `Module startup failed and rollback was incomplete: ${name}`
        );
      }

      throw error;
    }
  }

  private resolveDependencies(name: string): string[] {
    const resolved = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (moduleName: string): void => {
      const module = this.modules.get(moduleName);

      if (!module) {
        throw new Error(`Module not found: ${moduleName}`);
      }

      if (visiting.has(moduleName)) {
        throw new Error(
          `Circular dependency detected: ${moduleName}`
        );
      }

      if (resolved.has(moduleName)) {
        return;
      }

      visiting.add(moduleName);

      for (const dependency of module.dependencies ?? []) {
        if (!this.modules.has(dependency)) {
          throw new Error(
            `Missing dependency: ${moduleName} requires ${dependency}`
          );
        }

        visit(dependency);
      }

      visiting.delete(moduleName);
      resolved.add(moduleName);
      order.push(moduleName);
    };

    visit(name);

    return order;
  }

  stop(name: string): void {
    const module = this.modules.get(name);

    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }

    if (!this.activeModules.has(name)) {
      return;
    }

    for (const [moduleName, registeredModule] of this.modules) {
      if (
        this.activeModules.has(moduleName) &&
        registeredModule.dependencies?.includes(name)
      ) {
        throw new Error(
          `Cannot stop ${name}: required by ${moduleName}`
        );
      }
    }

    module.stop?.();
    this.activeModules.delete(name);
  }

  stopAll(): void {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (name: string): void => {
      if (visited.has(name)) {
        return;
      }

      visited.add(name);

      const module = this.modules.get(name);

      if (!module) {
        return;
      }

      for (const dependency of module.dependencies ?? []) {
        if (this.activeModules.has(dependency)) {
          visit(dependency);
        }
      }

      order.push(name);
    };

    for (const name of this.activeModules) {
      visit(name);
    }

    const errors: unknown[] = [];

    for (const name of order.reverse()) {
      try {
        this.stop(name);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        'One or more modules failed to stop.'
      );
    }
  }

  getStatus(name: string): ModuleStatus {
    const module = this.modules.get(name);

    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }

    return {
      name: module.name,
      version: module.version,
      registered: true,
      initialized: this.initializedModules.has(name),
      active: this.activeModules.has(name),
      dependencies: (module.dependencies ?? []).map(
        dependency => ({
          name: dependency,
          registered: this.modules.has(dependency),
          active: this.activeModules.has(dependency)
        })
      )
    };
  }

  listStatuses(
    filter: 'all' | 'active' | 'inactive' = 'all'
  ): ModuleStatus[] {
    const statuses = this.list().map(
      name => this.getStatus(name)
    );

    if (filter === 'active') {
      return statuses.filter(status => status.active);
    }

    if (filter === 'inactive') {
      return statuses.filter(status => !status.active);
    }

    return statuses;
  }

  isActive(name: string): boolean {
    return this.activeModules.has(name);
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  get(name: string): NgModule | undefined {
    return this.modules.get(name);
  }

  list(): string[] {
    return [...this.modules.keys()];
  }
}
