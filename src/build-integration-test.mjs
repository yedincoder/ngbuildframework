
import assert from 'node:assert/strict';
import {
  mkdtemp,
  cp,
  readFile,
  writeFile,
  readdir,
  rm
} from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..'
);

const cliPackagePath = require.resolve(
  '@yedincoder/ngbuild/package.json'
);

const cliRoot = dirname(cliPackagePath);
const cliEntry = join(cliRoot, 'bin', 'ngbuild.js');

let passed = 0;
let failed = 0;

const workspace = await mkdtemp(
  join(tmpdir(), 'ngbuild-integration-')
);

const projects = {};

function localFile(path) {
  return `file:${path.replaceAll('\\', '/')}`;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: true,
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `Command: ${command} ${args.join(' ')}`,
        `Exit code: ${result.status}`,
        result.stdout,
        result.stderr
      ].join('\n')
    );
  }

  return result.stdout.trim();
}

async function test(name, callback) {
  try {
    await callback();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`[FAIL] ${name}`);
    console.error(error);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32' && child.pid) {
    spawnSync(
      'taskkill',
      ['/PID', String(child.pid), '/T', '/F'],
      { stdio: 'ignore' }
    );
  } else {
    child.kill('SIGTERM');
  }

  await delay(300);
}

async function waitForHttp(url, child, timeout = 15000) {
  const started = Date.now();
  let lastError;

  while (Date.now() - started < timeout) {
    if (child.exitCode !== null) {
      throw new Error(
        `Process exited with code ${child.exitCode}`
      );
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(1000)
      });

      if (response.ok) {
        return response;
      }

      lastError = new Error(
        `HTTP ${response.status}: ${url}`
      );
    } catch (error) {
      lastError = error;
    }

    await delay(250);
  }

  throw new Error(
    `Server not ready: ${url}\n${lastError}`
  );
}

async function prepareProject(name, archive) {
  const source = join(root, 'starters', name);
  const destination = join(workspace, name);

  await cp(source, destination, {
    recursive: true
  });

  const packagePath = join(destination, 'package.json');

  const pkg = JSON.parse(
    await readFile(packagePath, 'utf8')
  );

  pkg.dependencies ??= {};
  pkg.dependencies['@yedincoder/ngbuildframework'] =
    localFile(archive);

  if (name === 'web' || name === 'mobile') {
    pkg.devDependencies ??= {};
    pkg.devDependencies['@yedincoder/ngbuild'] =
      localFile(cliRoot);
  }

  await writeFile(
    packagePath,
    JSON.stringify(pkg, null, 2) + '\n'
  );

  projects[name] = destination;

  return destination;
}

async function runDevelopmentServer(name) {
  const project = projects[name];

  // NgBuild CLI v1.0.2 uses port 4178.
  // Prevent a false positive from an existing server.
  try {
    const existing = await fetch('http://127.0.0.1:4178/', {
      signal: AbortSignal.timeout(1000)
    });

    if (existing) {
      throw new Error(
        'Port 4178 is already in use. Stop the existing ' +
        'development server before running this test.'
      );
    }
  } catch (error) {
    if (error.message.includes('already in use')) {
      throw error;
    }
  }

  const child = spawn(
    process.execPath,
    [cliEntry, 'dev', '.'],
    {
      cwd: project,
      stdio: 'ignore'
    }
  );

  try {
    const response = await waitForHttp(
      'http://127.0.0.1:4178/',
      child
    );

    const html = await response.text();

    assert.match(html, /id="app"/);

    assert.match(
      html,
      /src="\/src\/main\.js"/
    );
  } finally {
    await stopProcess(child);
  }
}

async function runApiServer() {
  const project = projects.api;

  const child = spawn(
    process.execPath,
    ['src/server.js'],
    {
      cwd: project,
      stdio: 'ignore',
      env: {
        ...process.env,
        PORT: '3001'
      }
    }
  );

  try {
    const response = await waitForHttp(
      'http://127.0.0.1:3001/api/info',
      child
    );

    const data = await response.json();

    assert.equal(
      data.name,
      'NgBuild API Starter'
    );
  } finally {
    await stopProcess(child);
  }
}

try {
  // ======================================
  // 1. Framework Package Build
  // ======================================

  await test('Framework Production Build', async () => {
    run('npm', ['run', 'build'], root);

    const manifest = JSON.parse(
      await readFile(join(root, 'package.json'), 'utf8')
    );

    assert.equal(
      manifest.name,
      '@yedincoder/ngbuildframework'
    );
  });

  // ======================================
  // 2. Local Package Archive
  // ======================================

  let archive = null;

  await test('Local Framework Package Archive', async () => {
    run(
      'npm',
      ['pack', '--pack-destination', workspace],
      root
    );

    const files = await readdir(workspace);

    const filename = files.find(file =>
      file.endsWith('.tgz')
    );

    assert.ok(filename, 'Package archive not found');

    archive = join(workspace, filename);
  });

  if (archive) {
    // ====================================
    // 3. Prepare Starter Projects
    // ====================================

    await test('Prepare Independent Starters', async () => {
      for (const name of ['web', 'api', 'mobile']) {
        await prepareProject(name, archive);
      }

      assert.ok(projects.web);
      assert.ok(projects.api);
      assert.ok(projects.mobile);
    });

    // ====================================
    // 4. Install Starter Dependencies
    // ====================================

    for (const name of ['web', 'api', 'mobile']) {
      await test(`${name} Local Package Install`, async () => {
        assert.ok(projects[name]);

        run(
          'npm',
          ['install', '--no-audit', '--no-fund'],
          projects[name]
        );

        const installedPath = join(
        projects[name],
        'node_modules',
        '@yedincoder',
        'ngbuildframework',
        'package.json'
        );

        const installed = JSON.parse(
        await readFile(installedPath, 'utf8')
        );

        assert.equal(
        installed.name,
        '@yedincoder/ngbuildframework'
        );

      });
    }

    // ====================================
    // 5. Production Builds
    // ====================================

    for (const name of ['web', 'mobile']) {
      await test(`${name} Production Build`, async () => {
        assert.ok(projects[name]);

        run(
          'npm',
          ['run', 'build'],
          projects[name]
        );
      });
    }

    // ====================================
    // 6. Development Servers
    // ====================================

    for (const name of ['web', 'mobile']) {
      await test(`${name} Development Server`, async () => {
        assert.ok(projects[name]);

        await runDevelopmentServer(name);
      });
    }

    // ====================================
    // 7. API Runtime
    // ====================================

    await test('API Starter HTTP Runtime', async () => {
      assert.ok(projects.api);

      await runApiServer();
    });
  }
} finally {
  await rm(workspace, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 300
  });
}

console.log('');
console.log('===================================');
console.log('NGBUILD BUILD INTEGRATION TEST');
console.log('===================================');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
