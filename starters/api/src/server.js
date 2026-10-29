
import {
  createApiServer,
  sendSuccess
} from '@yedincoder/ngbuildframework/api';

// ========================================
// NgBuild API Starter
// ========================================

const api = createApiServer({
  host: '127.0.0.1',
  port: Number(process.env.PORT ?? 3001)
});

// ========================================
// API Routes
// ========================================

api.router.register('GET', '/api/hello', (req, res) => {
  sendSuccess(res, {
    message: 'Hello from NgBuild API Starter'
  });
});

api.router.register('GET', '/api/info', () => ({
  success: true,
  name: 'NgBuild API Starter',
  framework: 'NgBuild Framework'
}));

// ========================================
// Start Server
// ========================================

try {
  const address = await api.start();

  console.log('[NgBuild API Starter] Running');
  console.log(`http://${address.host}:${address.port}`);
} catch (error) {
  console.error('[NgBuild API Starter] Start failed:', error);
  process.exitCode = 1;
}

// ========================================
// Graceful Shutdown
// ========================================

async function shutdown() {
  if (!api.server.listening) {
    return;
  }

  try {
    await api.stop();
    console.log('[NgBuild API Starter] Stopped');
  } catch (error) {
    console.error('[NgBuild API Starter] Stop failed:', error);
    process.exitCode = 1;
  }
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
