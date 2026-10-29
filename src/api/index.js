
import { pathToFileURL } from 'node:url';

import { createApiServer } from './server.js';

import {
  sendJson,
  sendSuccess,
  sendError
} from './response.js';

import { validateBody } from './validation.js';

export { createApiServer };

// ========================================
// API Configuration
// ========================================

export function configureApi(api) {

  // ========================================
  // Middleware
  // ========================================

  api.middleware.use(async (req, res, next) => {
    console.log(
      '[Middleware] Request:',
      req.method,
      req.url
    );

    await next();
  });

  api.middleware.use(async (req, res, next) => {
    res.setHeader('X-NgBuild-API', 'true');

    await next();
  });

  api.middleware.use(async (req, res, next) => {
    const path = new URL(
      req.url ?? '/',
      'http://localhost'
    ).pathname;

    if (path === '/api/blocked') {
      sendError(
        res,
        'Request blocked by middleware',
        403
      );
      return;
    }

    await next();
  });

  api.middleware.use(async (req, res, next) => {
    const path = new URL(
      req.url ?? '/',
      'http://localhost'
    ).pathname;

    if (path === '/api/error-middleware') {
      throw new Error('Middleware test error');
    }

    await next();
  });

  // ========================================
  // Existing API Routes
  // ========================================

  api.router.register('GET', '/api/hello', () => ({
    success: true,
    message: 'Hello from NgBuild API'
  }));

  api.router.register('GET', '/api/info', () => ({
    success: true,
    name: 'NgBuild API',
    framework: 'NgBuild Framework'
  }));

  // ========================================
  // HTTP Methods
  // ========================================

  api.router.register('GET', '/api/test', () => ({
    success: true,
    method: 'GET',
    message: 'GET request successful'
  }));

  api.router.register('POST', '/api/test', (req, res) => {
    res.statusCode = 201;

    return {
      success: true,
      method: 'POST',
      data: req.body
    };
  });

  api.router.register('PUT', '/api/test', req => ({
    success: true,
    method: 'PUT',
    data: req.body
  }));

  api.router.register('PATCH', '/api/test', req => ({
    success: true,
    method: 'PATCH',
    data: req.body
  }));

  api.router.register('DELETE', '/api/test', req => ({
    success: true,
    method: 'DELETE',
    data: req.body
  }));

  // ========================================
  // Error Test Routes
  // ========================================

  api.router.register('GET', '/api/error-route', () => {
    throw new Error('Route handler test error');
  });

  api.router.register(
    'GET',
    '/api/error-async',
    async () => {
      throw new Error('Async route handler test error');
    }
  );

  // ========================================
  // Route Parameters & Query String
  // ========================================

  api.router.register('GET', '/api/users', req => ({
    success: true,
    message: 'Users list',
    query: req.query
  }));

  api.router.register('GET', '/api/users/:id', req => ({
    success: true,
    message: 'User detail',
    params: req.params
  }));

  api.router.register(
    'GET',
    '/api/users/:userId/posts/:postId',
    req => ({
      success: true,
      message: 'User post detail',
      params: req.params
    })
  );

  api.router.register(
    'POST',
    '/api/users/:id',
    (req, res) => {
      res.statusCode = 201;

      return {
        success: true,
        message: 'User data received',
        params: req.params,
        query: req.query,
        data: req.body
      };
    }
  );

  // ========================================
  // Response Helper Routes
  // ========================================

  api.router.register(
    'GET',
    '/api/response/success',
    (req, res) => {
      sendSuccess(res, {
        message: 'Response Helper berhasil'
      });
    }
  );

  api.router.register(
    'POST',
    '/api/response/created',
    (req, res) => {
      sendSuccess(res, req.body, 201);
    }
  );

  api.router.register(
    'GET',
    '/api/response/error',
    (req, res) => {
      sendError(
        res,
        'Data tidak ditemukan',
        404
      );
    }
  );

  // ========================================
  // Validation
  // ========================================

  const userValidationSchema = {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 50
    },
    age: {
      required: true,
      type: 'number',
      min: 1,
      max: 120
    },
    email: {
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 100
    }
  };

  api.router.register(
    'POST',
    '/api/validate',
    (req, res) => {
      const validation = validateBody(
        req.body,
        userValidationSchema
      );

      if (!validation.valid) {
        sendJson(res, 422, {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });

        return;
      }

      sendSuccess(res, {
        message: 'Validation successful',
        user: req.body
      });
    }
  );

  return api;
}

// ========================================
// Standalone API Server
// ========================================

// Only start automatically when this file
// is executed directly, not when imported.

const isDirectExecution =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(
    process.argv[1]
  ).href;

if (isDirectExecution) {
  const api = createApiServer({
    host: 'localhost',
    port: 3001
  });

  configureApi(api);

  try {
    const address = await api.start();

    console.log('[NgBuild API] Server started');

    console.log(
      `[NgBuild API] http://${address.host}:${address.port}`
    );

    console.log(
      '[NgBuild API] Registered routes:',
      api.router.list()
    );

    console.log(
      '[NgBuild API] Middleware count:',
      api.middleware.list().length
    );

  } catch (error) {
    console.error(
      '[NgBuild API] Failed to start:',
      error
    );

    process.exitCode = 1;
  }
}
