
import { createApiServer } from './server.js';
import { configureApi } from './index.js';

export function createApiModule(options = {}) {
  const name = options.name ?? 'api';
  const host = options.host ?? 'localhost';
  const port = options.port ?? 3001;

  const api = createApiServer({
    host,
    port
  });

  // Register existing middleware and API routes.
  configureApi(api);

  return {
    name,
    version: '1.0.0',

    // Expose server for lifecycle verification.
    server: api.server,

    // ========================================
    // Core Lifecycle: Setup
    // ========================================

    setup() {
      // Configuration is already prepared.
    },

    // ========================================
    // Core Lifecycle: Start
    // ========================================

    start() {
      if (api.server.listening) {
        return;
      }

      // Synchronous lifecycle call.
      // Node.js completes listening asynchronously.
      api.server.listen(port, host, () => {
        const address = api.server.address();

        const actualPort =
          typeof address === 'object' && address
            ? address.port
            : port;

        console.log(
          `[NgBuild API] Module started: http://${host}:${actualPort}`
        );
      });
    },

    // ========================================
    // Core Lifecycle: Stop
    // ========================================

    stop() {
      if (!api.server.listening) {
        return;
      }

      // Initiate shutdown synchronously.
      api.server.close(error => {
        if (error) {
          console.error(
            '[NgBuild API] Module stop error:',
            error
          );
          return;
        }

        console.log('[NgBuild API] Module stopped');
      });
    }
  };
}
