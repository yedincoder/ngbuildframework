
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// ========================================
// NgBuild Starter Templates Test
// ========================================

const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..'
);

let passed = 0;
let failed = 0;

async function test(name, callback) {
  try {
    await callback();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`[FAIL] ${name}`, error);
  }
}

async function read(relativePath) {
  return readFile(
    resolve(root, relativePath),
    'utf8'
  );
}

async function readPackage(template) {
  const content = await read(
    `starters/${template}/package.json`
  );

  return JSON.parse(content);
}

// ========================================
// 1. Template Files
// ========================================

for (const [template, files] of Object.entries({
  web: [
    'package.json',
    'index.html',
    'src/main.js'
  ],
  api: [
    'package.json',
    'src/server.js'
  ],
  mobile: [
    'package.json',
    'index.html',
    'src/main.js'
  ]
})) {
  await test(`${template} Starter Files`, async () => {
    for (const file of files) {
      await access(
        resolve(root, 'starters', template, file)
      );
    }
  });
}

// ========================================
// 2. Package Names
// ========================================

await test('Starter Package Names', async () => {
  const web = await readPackage('web');
  const api = await readPackage('api');
  const mobile = await readPackage('mobile');

  assert.equal(web.name, 'ngbuild-web-starter');
  assert.equal(api.name, 'ngbuild-api-starter');
  assert.equal(mobile.name, 'ngbuild-mobile-starter');
});

// ========================================
// 3. Framework Dependencies
// ========================================

await test('Starter Framework Dependencies', async () => {
  for (const name of ['web', 'api', 'mobile']) {
    const pkg = await readPackage(name);

    assert.equal(
      pkg.dependencies['@yedincoder/ngbuildframework'],
      '^1.0.0'
    );
  }
});

// ========================================
// 4. CLI Scripts
// ========================================

await test('Starter CLI Scripts', async () => {
  for (const name of ['web', 'mobile']) {
    const pkg = await readPackage(name);

    assert.equal(pkg.scripts.dev, 'ngbuild dev .');
    assert.equal(pkg.scripts.build, 'ngbuild build .');
  }

  const api = await readPackage('api');

  assert.equal(
    api.scripts.start,
    'node src/server.js'
  );
});

// ========================================
// 5. Framework Exports
// ========================================

await test('Framework Starter Exports', async () => {
  const core = await import(
    '@yedincoder/ngbuildframework'
  );

  const web = await import(
    '@yedincoder/ngbuildframework/web'
  );

  const api = await import(
    '@yedincoder/ngbuildframework/api'
  );

  const mobile = await import(
    '@yedincoder/ngbuildframework/mobile'
  );

  assert.equal(typeof core.createFramework, 'function');
  assert.equal(typeof web.createState, 'function');
  assert.equal(typeof api.createApiServer, 'function');
  assert.equal(typeof api.sendSuccess, 'function');

  assert.equal(
    typeof mobile.createMobileNavigation,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileScreenManager,
    'function'
  );

  assert.equal(
    typeof mobile.createMobileUI,
    'function'
  );
});

// ========================================
// 6. Starter Entry Points
// ========================================

await test('Starter Entry Points', async () => {
  const web = await read('starters/web/src/main.js');
  const api = await read('starters/api/src/server.js');
  const mobile = await read('starters/mobile/src/main.js');

  assert.match(web, /createFramework/);
  assert.match(web, /createState/);

  assert.match(api, /createApiServer/);
  assert.match(api, /api\.router\.register/);

  assert.match(mobile, /createMobileNavigation/);
  assert.match(mobile, /createMobileScreenManager/);
  assert.match(mobile, /createMobileUI/);
});

// ========================================
// 7. Browser HTML Entry
// ========================================

await test('Browser HTML Entry Points', async () => {
  for (const name of ['web', 'mobile']) {
    const html = await read(
      `starters/${name}/index.html`
    );

    assert.match(html, /id="app"/);
    assert.match(html, /src="\/src\/main\.js"/);
  }
});

// ========================================
// Final Result
// ========================================

console.log('');
console.log('=== NGBUILD STARTER TEMPLATES TEST ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
