# NgBuild Framework

**One Framework. Web, API & Mobile.**

NgBuild Framework adalah framework JavaScript dan TypeScript modular yang dirancang untuk membangun aplikasi Web, REST API, dan Mobile dalam satu ekosistem.

Framework ini dikembangkan oleh **YedinCoder** sebagai bagian dari ekosistem NgBuild.

NgBuild Framework menggunakan pendekatan modular, sehingga setiap komponen dapat dikembangkan dan digunakan sesuai kebutuhan aplikasi.

## Project Information

- Project: NgBuild Framework
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
│   ├── Module Manager
│   ├── Plugin Manager
│   ├── Dependency Management
│   └── Renderer
│
├── Web Foundation
│   ├── DOM
│   ├── State
│   ├── Reactive
│   └── Router
│
├── API Foundation
│   ├── HTTP Server
│   ├── Router
│   ├── Middleware
│   ├── Response
│   └── Validation
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
│
├── src/
│   │
│   ├── core/
│   │   ├── framework.ts
│   │   ├── module.ts
│   │   ├── plugin.ts
│   │   ├── renderer.ts
│   │   └── index.ts
│   │
│   ├── web/
│   │   ├── dom.ts
│   │   ├── state.ts
│   │   ├── reactive.ts
│   │   ├── router.ts
│   │   └── index.ts
│   │
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
│   │
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
│   │
│   └── index.ts
│
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

Perintah pengujian menggunakan `npx tsx` dan `node` seperti pada bagian berikut.

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

## Roadmap

Tahap pengembangan berikutnya:

1. Unified Framework Entry Point
2. Package Exports
3. NgBuild CLI Integration
4. Project Starter Templates
5. Development & Production Build Integration
6. End-to-End Testing

Targetnya adalah menyediakan pengalaman pengembangan terpadu untuk proyek Web, API, dan Mobile melalui ekosistem NgBuild.

## NgBuild Ecosystem

NgBuild terdiri dari dua komponen utama:

**NgBuild Framework**

Framework modular untuk pengembangan aplikasi Web, API, dan Mobile.

**NgBuild Build Tool**

Build tool dan CLI yang dikembangkan dalam proyek terpisah.

Package build tool:

```text
@yedincoder/ngbuild
```

Package framework yang direncanakan:

```text
@yedincoder/ngbuildframework
```

Integrasi package dan CLI merupakan bagian dari roadmap berikutnya.

## Author

**YedinCoder**

NgBuild Framework Project

## License

Lisensi proyek belum ditetapkan.

---

**NgBuild Framework**

*One Framework. Web, API & Mobile.*

Built by YedinCoder.
