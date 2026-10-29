
import http from 'node:http';

import { ApiRouter } from './router.js';
import { MiddlewareManager } from './middleware.js';
import { sendJson, sendError } from './response.js';

const MAX_BODY_SIZE = 1024 * 1024;

// ========================================
// JSON Request Body
// ========================================

async function parseJsonBody(req) {
  const method = req.method ?? 'GET';

  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null;
  }

  const contentLength = Number(
    req.headers['content-length'] ?? 0
  );

  if (contentLength > MAX_BODY_SIZE) {
    const error = new Error('Request body too large');
    error.statusCode = 413;
    throw error;
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > MAX_BODY_SIZE) {
      const error = new Error('Request body too large');
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  if (size === 0) {
    return null;
  }

  const contentType = req.headers['content-type'] ?? '';

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    const error = new Error(
      'Content-Type must be application/json'
    );
    error.statusCode = 415;
    throw error;
  }

  try {
    return JSON.parse(
      Buffer.concat(chunks).toString('utf8')
    );
  } catch {
    const error = new Error('Invalid JSON request body');
    error.statusCode = 400;
    throw error;
  }
}

// ========================================
// API Server
// ========================================

export function createApiServer(options = {}) {
  const host = options.host ?? 'localhost';
  const port = options.port ?? 3001;

  const router = new ApiRouter();
  const middleware = new MiddlewareManager();

  // Default Health Check
  router.register('GET', '/api/health', () => ({
    success: true,
    message: 'NgBuild API running'
  }));

  const server = http.createServer(async (req, res) => {
    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );

    try {
      const url = new URL(
        req.url ?? '/',
        'http://localhost'
      );

      const method = req.method ?? 'GET';

      // ========================================
      // Query String
      // ========================================

      req.query = Object.fromEntries(
        url.searchParams.entries()
      );

      // ========================================
      // Route Parameters
      // ========================================

      const matchedRoute = router.match(
        method,
        url.pathname
      );

      req.params = matchedRoute?.params ?? {};

      const handler = matchedRoute?.handler ?? null;

      // ========================================
      // Middleware
      // ========================================

      await middleware.run(req, res, async () => {
        if (!handler) {
          sendError(
            res,
            'API endpoint not found',
            404
          );
          return;
        }

        // JSON Body
        req.body = await parseJsonBody(req);

        // Route Handler
        const result = await handler(req, res);

        if (res.writableEnded) {
          return;
        }

        // Existing route response format
        sendJson(res, res.statusCode, result);
      });

    } catch (error) {
      if (res.writableEnded || res.destroyed) {
        return;
      }

      const statusCode =
        Number.isInteger(error?.statusCode) &&
        error.statusCode >= 400 &&
        error.statusCode <= 599
          ? error.statusCode
          : 500;

      if (statusCode === 500) {
        console.error(
          '[NgBuild API] Request error:',
          error
        );
      }

      if (res.headersSent) {
        res.destroy();
        return;
      }

      sendError(
        res,
        statusCode === 500
          ? 'Internal Server Error'
          : error.message,
        statusCode
      );
    }
  });

  return {
    server,
    router,
    middleware,

    // ========================================
    // Start Server
    // ========================================

    start() {
      return new Promise((resolve, reject) => {
        server.once('error', reject);

        server.listen(port, host, () => {
          server.removeListener('error', reject);

          const address = server.address();

          const actualPort =
            typeof address === 'object' && address
              ? address.port
              : port;

          resolve({
            host,
            port: actualPort
          });
        });
      });
    },

    // ========================================
    // Stop Server
    // ========================================

    stop() {
      return new Promise((resolve, reject) => {
        server.close(error => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  };
}
