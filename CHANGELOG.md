# Changelog

All notable changes to **NgBuild Framework** are documented in this file.

Project: [NgBuild Framework](https://github.com/yedincoder/ngbuildframework)  
Package: [@yedincoder/ngbuildframework](https://www.npmjs.com/package/@yedincoder/ngbuildframework)  
License: Apache-2.0

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

---

## [1.0.1] - 2026-11-13

### Changed
- README synchronized with published npm state.
- Removed "belum dipublikasikan" notes; package is published on npm as `1.0.0`.
- `package.json` `files` field now explicitly includes `README.md` and `LICENSE`.
- `package.json` `test` script now runs the full suite via `test:all` (per-category scripts added).
- Added `tsx` to `devDependencies` for TypeScript test execution.
- Test results in README updated: 110 passed (was 121), with `test:build` excluded.

### Fixed
- `dist/` directory now contains TypeScript compiler output (`tsc -p tsconfig.build.json`).
- Package tarball no longer includes stale ngbuild output in `dist/`.
- `package.json` no longer contains BOM (byte order mark).

### Known Issues
- `test:build` (11 tests) temporarily excluded from `npm test` due to npm 10+ `EALLOWSCRIPTS` behavior change. Will be re-enabled in v1.0.2.

## [1.0.0] - 2026-10-30

**Initial Public Release**

First public release of NgBuild Framework, a modular JavaScript and TypeScript framework for Web, REST API, and Mobile development.

### Added

#### Core Framework
- Framework initialization and shutdown.
- Module Manager and Plugin Manager.
- Module lifecycle management.
- Module registration and configuration.
- Module dependencies and dependency resolution.
- Module status tracking.
- Module rollback.
- HTML renderer and component support.

#### Web Foundation
- DOM mounting, updating, and unmounting.
- State management and subscriptions.
- Reactive rendering.
- Client-side router and navigation.
- Browser History integration.
- Lifecycle hooks and error handling.

#### API Foundation
- HTTP server powered by Node.js.
- REST API router.
- Support for GET, POST, PUT, PATCH, and DELETE.
- Route parameters and query strings.
- JSON request handling.
- API middleware.
- Response helpers.
- Request validation.
- HTTP error handling.
- Core Framework module integration.

#### Mobile Foundation
- Mobile runtime and platform detection.
- Mobile application lifecycle.
- Navigation and screen management.
- State management.
- Storage abstraction.
- Device bridge.
- Mobile UI integration.
- Core Framework module integration.
- Browser and WebView-based application foundation.

#### Unified Framework Integration
- Unified Framework Entry Point.
- Dedicated Core, Web, API, and Mobile package exports.
- Optional API and Mobile module loading.
- TypeScript declaration files.
- NgBuild CLI v1.0.2 integration.
- Web, API, and Mobile starter templates.
- Development server integration.
- Production build integration.
- Local package installation and distribution testing.

### Testing
- API Final Integration: 38 passed.
- Mobile Final Integration: 41 passed.
- Unified Entry Point: 6 passed.
- Package Integration: 9 passed.
- CLI Integration: 7 passed.
- Starter Templates: 9 passed.
- Build Integration: 11 passed.

**Final regression results: 121 passed, 0 failed.**

Additional verification:
- TypeScript typecheck passed.
- Framework production build passed.
- Public npm package installation passed.
- Public package import test passed.

### Distribution
- Published `@yedincoder/ngbuildframework@1.0.0` to npm.
- Published GitHub Release `v1.0.0`.
- Added npm package `.tgz` to GitHub Release.
- Included TypeScript declarations and package exports.
- Adopted Apache License 2.0.

### Known Limitations
- Native Android APK and iOS application builds are not yet included.
- Browser interaction testing is not fully automated.
- Advanced SSR and SSG capabilities are not yet implemented.

---

## Links

- [GitHub Repository](https://github.com/yedincoder/ngbuildframework)
- [GitHub Releases](https://github.com/yedincoder/ngbuildframework/releases)
- [npm Package](https://www.npmjs.com/package/@yedincoder/ngbuildframework)

---

Copyright © 2026 YedinCoder.  
Licensed under Apache-2.0.