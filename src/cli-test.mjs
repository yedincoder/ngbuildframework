
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  '..'
);

const cliPackage = require.resolve(
  '@yedincoder/ngbuild/package.json'
);

const cliEntry = join(
  dirname(cliPackage),
  'bin',
  'ngbuild.js'
);

let passed = 0;
let failed = 0;

function test(name, callback) {
  try {
    callback();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`[FAIL] ${name}`, error);
  }
}

function runCli(...args) {
  const result = spawnSync(
    process.execPath,
    [cliEntry, ...args],
    {
      cwd: root,
      encoding: 'utf8',
      timeout: 15000
    }
  );

  if (result.error) {
    throw result.error;
  }

  return result;
}

// ========================================
// 1. CLI Package Resolution
// ========================================

test('NgBuild CLI Package Resolution', () => {
  assert.ok(cliPackage.endsWith('package.json'));
  assert.ok(cliEntry.endsWith('ngbuild.js'));
});

// ========================================
// 2. CLI Version
// ========================================

test('NgBuild CLI Version', () => {
  const result = runCli('--version');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /NgBuild v1\.0\.2/);
});

// ========================================
// 3. CLI Help
// ========================================

test('NgBuild CLI Help', () => {
  const result = runCli('--help');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /ngbuild dev/);
  assert.match(result.stdout, /ngbuild build/);
  assert.match(result.stdout, /ngbuild init/);
});

// ========================================
// 4. Unknown CLI Command
// ========================================

test('Unknown CLI Command', () => {
  const result = runCli('__invalid_command__');

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /Unknown command/
  );
});

// ========================================
// 5. Framework Package Identity
// ========================================

test('Framework Package Identity', () => {
  const pkg = require('../package.json');

  assert.equal(
    pkg.name,
    '@yedincoder/ngbuildframework'
  );

  assert.equal(
    pkg.devDependencies['@yedincoder/ngbuild'],
    '^1.0.2'
  );
});

// ========================================
// 6. Development Script
// ========================================

test('Framework Development Script', () => {
  const pkg = require('../package.json');

  assert.equal(
    pkg.scripts['dev:framework'],
    'ngbuild dev .'
  );
});

// ========================================
// 7. Existing Package Build
// ========================================

test('Existing Framework Build Preserved', () => {
  const pkg = require('../package.json');

  assert.equal(
    pkg.scripts.build,
    'tsc -p tsconfig.build.json'
  );
});

// ========================================
// Result
// ========================================

console.log('');
console.log('=== NGBUILD CLI INTEGRATION TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
