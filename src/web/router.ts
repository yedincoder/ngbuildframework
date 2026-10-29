
import {
  mount
} from './dom.js';

import type {
  Child
} from '../core/renderer.js';

export type RouteComponent = () => Child;

export interface Route {
  path: string;
  component: RouteComponent;
}

export class Router {
  private routes = new Map<string, RouteComponent>();
  private notFound: RouteComponent | null = null;

  register(route: Route): void {
    if (
      !route.path.startsWith('/') ||
      route.path.startsWith('//')
    ) {
      throw new Error(
        `Invalid route path: ${route.path}`
      );
    }

    if (this.routes.has(route.path)) {
      throw new Error(
        `Route already registered: ${route.path}`
      );
    }

    this.routes.set(route.path, route.component);
  }

  setNotFound(component: RouteComponent): void {
    this.notFound = component;
  }

  has(path: string): boolean {
    return this.routes.has(path);
  }

  resolve(path: string): RouteComponent | null {
    return this.routes.get(path) ?? this.notFound;
  }

  render(path: string, target: Element): void {
    const component = this.resolve(path);

    if (!component) {
      throw new Error(`Route not found: ${path}`);
    }

    mount(component(), target);
  }

  navigate(path: string, target: Element): void {
    if (
      !path.startsWith('/') ||
      path.startsWith('//') ||
      path.includes('?') ||
      path.includes('#')
    ) {
      throw new Error(`Invalid navigation path: ${path}`);
    }

    if (window.location.pathname === path) {
      return;
    }

    // Pastikan komponen bisa dirender sebelum
    // URL browser diubah.
    this.render(path, target);

    window.history.pushState(null, '', path);
  }

  listen(target: Element): () => void {
    const handlePopState = (): void => {
      this.render(window.location.pathname, target);
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }

  list(): string[] {
    return [...this.routes.keys()];
  }
}
