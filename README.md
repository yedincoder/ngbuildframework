# NgBuild Framework

**One Framework. Web, API & Mobile.**

NgBuild Framework adalah framework JavaScript dan TypeScript modular yang dirancang untuk membangun aplikasi Web, REST API, dan Mobile dalam satu ekosistem.

Framework ini dikembangkan oleh **YedinCoder** sebagai bagian dari ekosistem NgBuild.

NgBuild Framework menggunakan pendekatan modular, sehingga setiap komponen dapat dikembangkan dan digunakan sesuai kebutuhan aplikasi.

## Project Information

- Project: NgBuild Framework
- Package: `@yedincoder/ngbuildframework` (v1.0.0, lokal/belum dipublikasikan ke npm)
- Build Tool / CLI: `@yedincoder/ngbuild` v1.0.2
- Author: YedinCoder
- Repository: https://github.com/yedincoder/ngbuildframework
- Framework: JavaScript / TypeScript
- Architecture: Modular
- Platforms: Web, API, Mobile
- Tagline: One Framework. Web, API & Mobile.

## Features

### Core Framework

Fondasi utama NgBuild Framework.

- Module Manager
- Plugin Manager
- Module Lifecycle
- Module Dependencies
- Dependency Resolution
- Module Configuration
- Module Status
- Module Rollback
- Framework Initialization
- Framework Shutdown
- HTML Renderer

### Web Foundation

Fondasi pengembangan aplikasi berbasis browser.

- DOM Mount
- DOM Update
- DOM Unmount
- Reactive State
- Reactive Rendering
- Router
- Navigation
- Browser History Integration
- Lifecycle Hooks
- Error Handling

### API Foundation

Fondasi REST API menggunakan HTTP Server bawaan Node.js.

- HTTP Server
- API Router
- GET, POST, PUT, PATCH, DELETE
- JSON Request Body
- API Middleware
- Route Parameters
- Query String
- Response Helpers
- Request Validation
- Error Handling
- Core Module Integration

Tidak menggunakan Express atau dependency HTTP framework tambahan.

### Mobile Foundation

Fondasi pengembangan aplikasi mobile berbasis JavaScript.

- Mobile Runtime
- Android & iOS Detection
- Mobile Application Lifecycle
- Mobile Navigation
- Mobile Screen Manager
- Mobile State Management
- Mobile Storage
- Mobile Device Bridge
- Mobile UI Integration
- Core Module Integration

Mobile Foundation menyediakan abstraksi aplikasi, navigasi, state, UI, dan adapter perangkat.

Build APK Android dan aplikasi iOS native belum termasuk dalam fondasi saat ini.

---

## Architecture
```text
NgBuild Framework
│
├── Core Framework
│   ├── Module Manager
│   ├── Plugin Manager
│   ├── Dependency Management
│   └── Renderer
│
├── Web Foundation
│   ├── DOM
│   ├── State
│   ├── Reactive
│   └── Router
│
├── API Foundation
│   ├── HTTP Server
│   ├── Router
│   ├── Middleware
│   ├── Response
│   └── Validation
│
└── Mobile Foundation
    ├── Runtime
    ├── Application
    ├── Navigation
    ├── Screen Manager
    ├── State
    ├── Storage
    ├── Device Bridge
    └── UI
```

## Project Structure
```text
ngbuildframework/
├── src/
│   ├── core/
│   │   ├── framework.ts
│   │   ├── module.ts
│   │   ├── plugin.ts
│   │   ├── renderer.ts
│   │   └── index.ts
│   ├── web/
│   │   ├── dom.ts
│   │   ├── state.ts
│   │   ├── reactive.ts
│   │   ├── router.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── server.js
│   │   ├── router.js
│   │   ├── middleware.js
│   │   ├── response.js
│   │   ├── validation.js
│   │   ├── module.js
│   │   ├── index.js
│   │   ├── integration-test.ts
│   │   └── final-test.ts
│   ├── mobile/
│   │   ├── runtime.js
│   │   ├── app.js
│   │   ├── navigation.js
│   │   ├── screen.js
│   │   ├── state.js
│   │   ├── storage.js
│   │   ├── device.js
│   │   ├── ui.js
│   │   ├── module.js
│   │   ├── integration-test.ts
│   │   └── final-test.ts
│   ├── index.ts
│   ├── core-entry.ts
│   ├── api-entry.ts
│   ├── mobile-entry.ts
│   ├── unified-test.ts
│   ├── package-test.mjs
│   ├── cli-test.mjs
│   ├── starter-test.mjs
│   └── build-integration-test.mjs
├── starters/
│   ├── web/
│   │   ├── package.json
│   │   ├── index.html
│   │   └── src/main.js
│   ├── api/
│   │   ├── package.json
│   │   └── src/server.js
│   └── mobile/
│       ├── package.json
│       ├── index.html
│       └── src/main.js
├── tsconfig.json
├── tsconfig.build.json
├── package.json
└── README.md
```

## Requirements

Untuk menjalankan development dan pengujian:

- Node.js dengan dukungan ECMAScript Modules (ESM)
- npm
- TypeScript
- tsx untuk menjalankan pengujian TypeScript

Pengembangan dan pengujian fondasi telah dilakukan menggunakan Node.js 26 pada Windows.

## Getting Started

Clone repository:
```bash
git clone https://github.com/yedincoder/ngbuildframework.git

cd ngbuildframework
```

Install dependencies:
```bash
npm install
```

Build dan pemeriksaan TypeScript:
```bash
npm run typecheck
npm run build
```

Paket framework sudah dikonfigurasi sebagai `@yedincoder/ngbuildframework@1.0.0`, tetapi **belum dipublikasikan ke registry npm**. Jangan gunakan `npm install @yedincoder/ngbuildframework` dari registry sebelum paket benar-benar dirilis. Pengujian instalasi starter dilakukan dengan arsip lokal dari `npm pack`.

---

## Unified Framework & Package Exports

NgBuild Framework memiliki satu entry point utama dan subpath untuk setiap fondasi:

| Import | Kegunaan |
|---|---|
| `@yedincoder/ngbuildframework` | Core, namespace Web, loader API dan Mobile |
| `@yedincoder/ngbuildframework/core` | Core Framework |
| `@yedincoder/ngbuildframework/web` | Web Foundation |
| `@yedincoder/ngbuildframework/api` | API Foundation (Node.js) |
| `@yedincoder/ngbuildframework/mobile` | Mobile Foundation |

Contoh penggunaan setelah paket terpasang secara lokal:
```javascript
import { createFramework } from '@yedincoder/ngbuildframework/core';
import { createState } from '@yedincoder/ngbuildframework/web';

const framework = createFramework();
framework.initialize();

const state = createState({ count: 0 });
```

Untuk API dan Mobile, entry point utama juga menyediakan `loadApi()` dan `loadMobile()` sebagai loader opsional. Pada aplikasi browser gunakan subpath `/core` dan `/web` sesuai kebutuhan agar kode HTTP Node.js tidak ikut masuk ke build browser.

---

## Core Framework

Core menyediakan sistem manajemen modul dan plugin.

Contoh:
```typescript
import { createFramework } from './src/core/framework';

const framework = createFramework();

framework.modules.register({

  name: 'example',

  version: '1.0.0',

  setup() {

    console.log('Module initialized');

  },

  start() {

    console.log('Module started');

  },

  stop() {

    console.log('Module stopped');

  }

});

framework.initialize();

framework.start('example');

framework.stop('example');

framework.shutdown();
```

Core menggunakan lifecycle sinkron.

---

## Web Foundation

Web menyediakan operasi DOM, reactive state, dan routing.

Komponen utamanya:
```text
src/web/dom.ts

src/web/state.ts

src/web/reactive.ts

src/web/router.ts
```

Web Foundation mendukung pengembangan aplikasi berbasis browser.

SSR, SSG, dan fitur SEO lanjutan belum menjadi bagian dari implementasi fondasi yang telah diuji.

---

## API Foundation

NgBuild API menyediakan HTTP Server dan REST API routing menggunakan Node.js.

### Running API Server
```bash
node src/api/index.js
```

Konfigurasi development yang telah digunakan:
```text
http://localhost:3001
```

Port dapat dikonfigurasi dan bukan ketentuan wajib NgBuild.

### Available Development Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Health Check |
| GET | /api/hello | Hello API |
| GET | /api/info | API Information |
| GET | /api/test | HTTP GET Test |
| POST | /api/test | HTTP POST Test |
| PUT | /api/test | HTTP PUT Test |
| PATCH | /api/test | HTTP PATCH Test |
| DELETE | /api/test | HTTP DELETE Test |
| GET | /api/users | Query String Test |
| GET | /api/users/:id | Route Parameter |
| GET | /api/users/:userId/posts/:postId | Multiple Parameters |
| POST | /api/users/:id | Parameters & JSON Body |
| POST | /api/validate | Validation Test |

Endpoint tersebut merupakan contoh dan endpoint pengujian selama pengembangan fondasi.

### Response Helper
```javascript
import {

  sendSuccess,

  sendError

} from './src/api/response.js';
```

Contoh respons sukses:
```json
{

  "success": true,

  "data": {

    "message": "Operation successful"

  }

}
```

Contoh respons error:
```json
{

  "success": false,

  "message": "Data tidak ditemukan"

}
```

### Request Validation

Validator mendukung:

- required
- type
- minLength
- maxLength
- min
- max

### API Testing
```bash
npx tsx src/api/integration-test.ts

npx tsx src/api/final-test.ts
```

Hasil final integration test yang telah dijalankan:
```text
Passed: 38

Failed: 0

Total: 38
```

---

## Mobile Foundation

NgBuild Mobile menyediakan sistem aplikasi mobile modular.

### Mobile Runtime
```javascript
import {

  createMobileRuntime

} from './src/mobile/runtime.js';

const runtime = createMobileRuntime();

console.log(runtime.getInfo());
```

Runtime dapat mendeteksi platform Web, Android, dan iOS berdasarkan informasi lingkungan.

### Mobile Application
```javascript
import {

  createMobileApp

} from './src/mobile/app.js';

const app = createMobileApp({

  name: 'My Mobile App',

  onInitialize() {

    console.log('Initialized');

  },

  onStart() {

    console.log('Started');

  },

  onStop() {

    console.log('Stopped');

  }

});

await app.start();

await app.stop();
```

### Mobile Navigation
```javascript
import {

  createMobileNavigation

} from './src/mobile/navigation.js';

const navigation = createMobileNavigation({

  initialRoute: '/home'

});

navigation.push('/profile');

console.log(navigation.getCurrent());

navigation.back();
```

### Mobile State
```javascript
import {

  createMobileState

} from './src/mobile/state.js';

const state = createMobileState({

  count: 0

});

state.subscribe(current => {

  console.log(current);

});

state.setState({

  count: 1

});
```

### Mobile Storage
```javascript
import {

  createMobileStorage

} from './src/mobile/storage.js';

const storage = createMobileStorage({

  namespace: 'my-app'

});

storage.setItem('user', {

  name: 'NgBuild'

});

console.log(storage.getItem('user'));
```

Storage menggunakan browser localStorage jika tersedia, atau adapter memori sebagai fallback.

### Mobile Device Bridge
```javascript
import {

  createMobileDeviceBridge

} from './src/mobile/device.js';

const bridge = createMobileDeviceBridge();

bridge.register('deviceInfo', {

  web: () => ({

    platform: 'web'

  })

});

const result = await bridge.call('deviceInfo');

console.log(result);
```

Device Bridge menggunakan adapter dan tidak secara otomatis menyediakan implementasi native untuk kamera, GPS, atau kemampuan perangkat lainnya.

### Mobile Testing
```bash
node src/mobile/runtime-test.mjs

node src/mobile/app-test.mjs

node src/mobile/navigation-test.mjs

node src/mobile/screen-test.mjs

node src/mobile/state-test.mjs

node src/mobile/storage-test.mjs

node src/mobile/device-test.mjs

node src/mobile/ui-test.mjs

npx tsx src/mobile/integration-test.ts

npx tsx src/mobile/final-test.ts
```

Final Integration Test:
```text
Passed: 41

Failed: 0

Total: 41
```

---

## NgBuild CLI & Starter Projects

NgBuild Framework terintegrasi dengan build tool dan CLI terpisah `@yedincoder/ngbuild` v1.0.2. Perintah yang diuji:
```bash
ngbuild --help
ngbuild --version
ngbuild dev .
ngbuild build .
```

Pada root repository framework, jalankan development server CLI dengan:
```bash
npm run dev:framework
```

Alamat development default yang teruji adalah `http://localhost:4178/`. Perintah `npm run build` di root repository **berbeda** dari `ngbuild build .`: perintah tersebut mengompilasi package framework menggunakan TypeScript.

Tersedia tiga template awal:

| Template | Lokasi | Tujuan |
|---|---|---|
| Web | `starters/web` | Aplikasi berbasis browser |
| API | `starters/api` | HTTP Server Node.js |
| Mobile | `starters/mobile` | Aplikasi browser/WebView dengan runtime mobile |

Template telah diuji sebagai proyek sementara terpisah melalui instalasi paket lokal. Web dan Mobile berhasil menjalankan development server serta production build, sementara API berhasil merespons pengujian HTTP. Starter bukan bukti tersedianya output APK/iOS native.

---

## Unified Integration Testing

Perintah uji utama:
```bash
npm run typecheck
npm run build
npx tsx src/api/final-test.ts
npx tsx src/mobile/final-test.ts
npx tsx src/unified-test.ts
npm run test:package
npm run test:cli
node src/starter-test.mjs
node src/build-integration-test.mjs
```

Hasil final regression testing:

| Pengujian | Lulus | Gagal |
|---|---:|---:|
| API Final | 38 | 0 |
| Mobile Final | 41 | 0 |
| Unified Entry Point | 6 | 0 |
| Package Integration | 9 | 0 |
| CLI Integration | 7 | 0 |
| Starter Templates | 9 | 0 |
| Build Integration | 11 | 0 |
| **Total** | **121** | **0** |

TypeScript typecheck dan framework build juga berhasil. Pengujian ini tidak menggantikan pemeriksaan interaksi manual di browser, pengujian native Android/iOS, atau audit kesiapan rilis. Masih terdapat peringatan Node.js `[DEP0190]` pada script build integration test yang tidak menyebabkan tes gagal.

Sebelum rilis, periksa ulang isi paket setelah clean build dengan `npm pack --dry-run --json`.

---

## Foundation Development Status

| Component | Completed |
|---|---|
| NgBuild Core | 20/20 |
| NgBuild Web | 15/15 |
| NgBuild API | 10/10 |
| NgBuild Mobile | 10/10 |
| **Total** | **55/55** |

Seluruh tahap pengembangan fondasi telah diselesaikan berdasarkan pengujian yang dilakukan selama development.

Status ini tidak berarti seluruh fitur production-ready telah tersedia.

## Unified Integration Status & Roadmap

| Tahap | Status |
|---|---|
| 1. Unified Framework Entry Point | Selesai |
| 2. Package Configuration & Exports | Selesai |
| 3. NgBuild CLI Integration | Selesai |
| 4. Starter Project Templates | Selesai |
| 5. Development & Production Build Integration | Selesai |
| 6. Final End-to-End Testing | Selesai (cakupan otomatis) |

Tahap pengembangan selanjutnya, di luar fondasi yang telah diuji, mencakup verifikasi interaksi browser, distribusi npm, dan dukungan build aplikasi native jika diperlukan.

## NgBuild Ecosystem

NgBuild memiliki dua komponen yang berbeda:

- **NgBuild Framework** — package `@yedincoder/ngbuildframework`, framework modular untuk Web, API, dan Mobile. Versi lokal yang diuji: `1.0.0`. Belum dipublikasikan ke npm.
- **NgBuild Build Tool & CLI** — package `@yedincoder/ngbuild`, build tool terpisah. Versi yang diuji: `1.0.2`.

Integrasi CLI, package exports, dan starter templates sudah melalui pengujian otomatis. Publikasi dan release terpisah dari penyelesaian fondasi.

## Author

**YedinCoder**

NgBuild Framework Project

## License

NgBuild Framework is open-source software licensed under the
Apache License, Version 2.0.

Copyright © 2026 YedinCoder.

See [LICENSE](LICENSE) for the full license terms.

---

**NgBuild Framework**

**One Framework. Web, API & Mobile.**

Built by YedinCoder.
