
import assert from 'node:assert/strict';
import { once } from 'node:events';

import { createFramework } from '../core/framework';
import { createApiModule } from './module.js';

// ========================================
// NgBuild API - Final Integration Test
// ========================================

async function main() {
  const framework = createFramework();

  const apiModule = createApiModule({
    name: 'api',
    host: 'localhost',
    port: 0
  });

  let passed = 0;
  let failed = 0;

  // ========================================
  // Test Runner
  // ========================================

  async function test(
    name: string,
    callback: () => Promise<void> | void
  ) {
    try {
      await callback();

      passed++;
      console.log(`[PASS] ${name}`);
    } catch (error) {
      failed++;
      console.error(`[FAIL] ${name}`, error);
    }
  }

  async function request(
    base: string,
    path: string,
    options: RequestInit = {}
  ) {
    const response = await fetch(
      `${base}${path}`,
      options
    );

    const data = await response.json();

    return {
      response,
      data
    };
  }

  function jsonBody(data: unknown): RequestInit {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  }

  // ========================================
  // 1. Core Registration
  // ========================================

  framework.modules.register(apiModule);

  await test('Core Module Registration', () => {
    assert.equal(
      framework.modules.has('api'),
      true
    );
  });

  // ========================================
  // 2. Core Initialization
  // ========================================

  framework.initialize();

  await test('Core Module Initialization', () => {
    assert.equal(
      framework.modules.getStatus('api').initialized,
      true
    );
  });

  let base = '';

  try {
    // ========================================
    // 3. Core Start
    // ========================================

    const listening = once(
      apiModule.server,
      'listening'
    );

    framework.start('api');

    await listening;

    const address = apiModule.server.address();

    assert.ok(
      address &&
      typeof address !== 'string'
    );

    base = `http://localhost:${address.port}`;

    await test('Core Module Start', () => {
      assert.equal(
        framework.modules.isActive('api'),
        true
      );

      assert.equal(
        apiModule.server.listening,
        true
      );
    });

    // ========================================
    // 4. HTTP Server & Existing Routes
    // ========================================

    await test('HTTP Health Check', async () => {
      const { response, data } = await request(
        base,
        '/api/health'
      );

      assert.equal(response.status, 200);
      assert.equal(data.success, true);
      assert.equal(data.message, 'NgBuild API running');
    });

    await test('GET Hello Route', async () => {
      const { response, data } = await request(
        base,
        '/api/hello'
      );

      assert.equal(response.status, 200);
      assert.equal(data.success, true);
    });

    await test('GET Info Route', async () => {
      const { response, data } = await request(
        base,
        '/api/info'
      );

      assert.equal(response.status, 200);
      assert.equal(data.framework, 'NgBuild Framework');
    });

    // ========================================
    // 5. HTTP Methods & JSON Body
    // ========================================

    for (const method of [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE'
    ]) {
      await test(`HTTP Method ${method}`, async () => {
        const options: RequestInit = {
          method
        };

        if (method !== 'GET') {
          options.headers = {
            'Content-Type': 'application/json'
          };

          options.body = JSON.stringify({
            name: 'NgBuild'
          });
        }

        const { response, data } = await request(
          base,
          '/api/test',
          options
        );

        assert.equal(
          response.status,
          method === 'POST' ? 201 : 200
        );

        assert.equal(data.method, method);

        if (method !== 'GET') {
          assert.equal(data.data.name, 'NgBuild');
        }
      });
    }

    // ========================================
    // 6. Middleware
    // ========================================

    await test('Middleware Response Header', async () => {
      const { response } = await request(
        base,
        '/api/health'
      );

      assert.equal(
        response.headers.get('X-NgBuild-API'),
        'true'
      );
    });

    await test('Middleware Blocking 403', async () => {
      const { response, data } = await request(
        base,
        '/api/blocked'
      );

      assert.equal(response.status, 403);
      assert.equal(data.success, false);
    });

    // ========================================
    // 7. Route Parameters & Query
    // ========================================

    await test('Route Parameter', async () => {
      const { data } = await request(
        base,
        '/api/users/123'
      );

      assert.equal(data.params.id, '123');
    });

    await test('Multiple Route Parameters', async () => {
      const { data } = await request(
        base,
        '/api/users/123/posts/456'
      );

      assert.equal(data.params.userId, '123');
      assert.equal(data.params.postId, '456');
    });

    await test('Query String', async () => {
      const { data } = await request(
        base,
        '/api/users?page=1&limit=10'
      );

      assert.equal(data.query.page, '1');
      assert.equal(data.query.limit, '10');
    });

    await test('POST Params Query and Body', async () => {
      const { response, data } = await request(
        base,
        '/api/users/123?source=web',
        jsonBody({
          name: 'NgBuild'
        })
      );

      assert.equal(response.status, 201);
      assert.equal(data.params.id, '123');
      assert.equal(data.query.source, 'web');
      assert.equal(data.data.name, 'NgBuild');
    });

    // ========================================
    // 8. Response Helpers
    // ========================================

    await test('Response Success Helper', async () => {
      const { response, data } = await request(
        base,
        '/api/response/success'
      );

      assert.equal(response.status, 200);
      assert.equal(data.success, true);
      assert.equal(
        data.data.message,
        'Response Helper berhasil'
      );
    });

    await test('Response Created Helper', async () => {
      const { response, data } = await request(
        base,
        '/api/response/created',
        jsonBody({
          name: 'NgBuild'
        })
      );

      assert.equal(response.status, 201);
      assert.equal(data.data.name, 'NgBuild');
    });

    await test('Response Error Helper', async () => {
      const { response, data } = await request(
        base,
        '/api/response/error'
      );

      assert.equal(response.status, 404);
      assert.equal(data.success, false);
      assert.equal(
        data.message,
        'Data tidak ditemukan'
      );
    });

    // ========================================
    // 9. API Validation
    // ========================================

    await test('Validation Success', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody({
          name: 'NgBuild',
          age: 25,
          email: 'admin@ngbuild.dev'
        })
      );

      assert.equal(response.status, 200);
      assert.equal(data.success, true);
    });

    await test('Validation Required', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody({
          age: 25,
          email: 'admin@ngbuild.dev'
        })
      );

      assert.equal(response.status, 422);
      assert.equal(
        data.errors.name,
        'name is required'
      );
    });

    await test('Validation Type', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody({
          name: 'NgBuild',
          age: '25',
          email: 'admin@ngbuild.dev'
        })
      );

      assert.equal(response.status, 422);
      assert.equal(
        data.errors.age,
        'age must be number'
      );
    });

    await test('Validation Min Length', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody({
          name: 'Ng',
          age: 25,
          email: 'admin@ngbuild.dev'
        })
      );

      assert.equal(response.status, 422);
      assert.match(
        data.errors.name,
        /at least 3 characters/
      );
    });

    await test('Validation Max Length', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody({
          name: 'a'.repeat(51),
          age: 25,
          email: 'admin@ngbuild.dev'
        })
      );

      assert.equal(response.status, 422);
      assert.match(
        data.errors.name,
        /at most 50 characters/
      );
    });

    await test('Validation Min Number', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody({
          name: 'NgBuild',
          age: 0,
          email: 'admin@ngbuild.dev'
        })
      );

      assert.equal(response.status, 422);
      assert.match(
        data.errors.age,
        /at least 1/
      );
    });

    await test('Validation Max Number', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody({
          name: 'NgBuild',
          age: 121,
          email: 'admin@ngbuild.dev'
        })
      );

      assert.equal(response.status, 422);
      assert.match(
        data.errors.age,
        /at most 120/
      );
    });

    await test('Validation Invalid Body', async () => {
      const { response, data } = await request(
        base,
        '/api/validate',
        jsonBody([1, 2, 3])
      );

      assert.equal(response.status, 422);
      assert.equal(
        data.errors.body,
        'Request body must be a JSON object'
      );
    });

    // ========================================
    // 10. Error Handling
    // ========================================

    await test('Unknown Route 404', async () => {
      const { response, data } = await request(
        base,
        '/api/unknown'
      );

      assert.equal(response.status, 404);
      assert.equal(data.success, false);
    });

    await test('Invalid JSON 400', async () => {
      const { response, data } = await request(
        base,
        '/api/test',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{"name":'
        }
      );

      assert.equal(response.status, 400);
      assert.equal(data.success, false);
    });

    await test('Unsupported Media Type 415', async () => {
      const { response, data } = await request(
        base,
        '/api/test',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: 'hello'
        }
      );

      assert.equal(response.status, 415);
      assert.equal(data.success, false);
    });

    await test('Request Body Too Large 413', async () => {
      const { response, data } = await request(
        base,
        '/api/test',
        jsonBody({
          data: 'a'.repeat(1048576)
        })
      );

      assert.equal(response.status, 413);
      assert.equal(data.success, false);
    });

    await test('Middleware Error 500', async () => {
      const { response, data } = await request(
        base,
        '/api/error-middleware'
      );

      assert.equal(response.status, 500);
      assert.equal(data.success, false);
      assert.equal(
        data.message,
        'Internal Server Error'
      );
    });

    await test('Route Handler Error 500', async () => {
      const { response, data } = await request(
        base,
        '/api/error-route'
      );

      assert.equal(response.status, 500);
      assert.equal(
        data.message,
        'Internal Server Error'
      );
    });

    await test('Async Handler Error 500', async () => {
      const { response, data } = await request(
        base,
        '/api/error-async'
      );

      assert.equal(response.status, 500);
      assert.equal(
        data.message,
        'Internal Server Error'
      );
    });

    await test('Health Check After Errors', async () => {
      const { response, data } = await request(
        base,
        '/api/health'
      );

      assert.equal(response.status, 200);
      assert.equal(data.success, true);
    });

  } finally {
    // ========================================
    // 11. Core Lifecycle Cleanup
    // ========================================

    if (framework.modules.isActive('api')) {
      const closed = apiModule.server.listening
        ? once(apiModule.server, 'close')
        : null;

      framework.stop('api');

      if (closed) {
        await closed;
      }
    }

    await test('Core Module Stop', () => {
      assert.equal(
        framework.modules.isActive('api'),
        false
      );

      assert.equal(
        apiModule.server.listening,
        false
      );
    });

    framework.shutdown();

    await test('Core Framework Shutdown', () => {
      assert.equal(
        framework.modules.isActive('api'),
        false
      );
    });
  }

  // ========================================
  // Final Result
  // ========================================

  console.log('');
  console.log('=== NGBUILD API FINAL TEST ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error('[FAIL] Final Integration:', error);
  process.exitCode = 1;
});
