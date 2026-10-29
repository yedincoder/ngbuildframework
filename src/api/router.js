
export class ApiRouter {
  constructor() {
    this.routes = new Map();
  }

  register(method, path, handler) {
    const normalizedMethod = method.toUpperCase();

    if (
      !path.startsWith('/') ||
      path.startsWith('//') ||
      path.includes('?') ||
      path.includes('#')
    ) {
      throw new Error(`Invalid API route: ${path}`);
    }

    if (typeof handler !== 'function') {
      throw new Error(`Invalid API handler: ${path}`);
    }

    const key = `${normalizedMethod}:${path}`;

    if (this.routes.has(key)) {
      throw new Error(
        `API route already registered: ${key}`
      );
    }

    const segments = path.split('/').slice(1);

    for (const segment of segments) {
      if (
        segment.startsWith(':') &&
        !/^:[a-zA-Z_][a-zA-Z0-9_]*$/.test(segment)
      ) {
        throw new Error(
          `Invalid API route parameter: ${segment}`
        );
      }
    }

    this.routes.set(key, {
      method: normalizedMethod,
      path,
      segments,
      handler
    });
  }

  match(method, path) {
    const normalizedMethod = method.toUpperCase();
    const exactKey = `${normalizedMethod}:${path}`;

    // Static route has priority.
    const exactRoute = this.routes.get(exactKey);

    if (exactRoute) {
      return {
        handler: exactRoute.handler,
        params: {}
      };
    }

    const pathSegments = path.split('/').slice(1);

    for (const route of this.routes.values()) {
      if (route.method !== normalizedMethod) {
        continue;
      }

      if (route.segments.length !== pathSegments.length) {
        continue;
      }

      const params = Object.create(null);
      let matched = true;

      for (let i = 0; i < route.segments.length; i++) {
        const routeSegment = route.segments[i];
        const pathSegment = pathSegments[i];

        if (routeSegment.startsWith(':')) {
          if (!pathSegment) {
            matched = false;
            break;
          }

          try {
            params[routeSegment.slice(1)] =
              decodeURIComponent(pathSegment);
          } catch {
            matched = false;
            break;
          }
        } else if (routeSegment !== pathSegment) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return {
          handler: route.handler,
          params
        };
      }
    }

    return null;
  }

  resolve(method, path) {
    return this.match(method, path)?.handler ?? null;
  }

  has(method, path) {
    return this.match(method, path) !== null;
  }

  list() {
    return [...this.routes.keys()];
  }
}
