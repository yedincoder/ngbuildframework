
export class MiddlewareManager {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }

    this.middlewares.push(middleware);
  }

  async run(req, res, handler) {
    let lastIndex = -1;

    const dispatch = async index => {
      if (index <= lastIndex) {
        throw new Error('next() called multiple times');
      }

      lastIndex = index;

      if (res.writableEnded) {
        return;
      }

      const middleware = this.middlewares[index];

      if (!middleware) {
        return handler();
      }

      await middleware(req, res, async () => {
        await dispatch(index + 1);
      });
    };

    await dispatch(0);
  }

  list() {
    return [...this.middlewares];
  }
}
