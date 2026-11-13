# NgBuild Framework Roadmap
... 
# NgBuild Framework Roadmap

Current stable: **v1.0.1** (published on npm)
Next: **v1.0.2 → v1.0.9** (incremental patches)
Future: **v1.1.0** (framework enhancement)

---

## v1.0.2 → v1.0.9 — Incremental Patches

Fokus: perbaikan bertahap, backward-compatible, rilis rutin.

### v1.0.2 — Fix `test:build` (npm 10+ Compatibility)

- Fix BOM handling in `build-integration-test.mjs` (~line 265)
- Fix `EALLOWSCRIPTS` — add `.npmrc` in temp folder
- Fix starter build resolving framework
- Re-enable `test:build` in `test:all`
- Update README: 110 → 121 passed
- Remove Known Limitations note about `test:build`

### v1.0.3 — README Version Sync

- Fix `Package: (v1.0.0)` in Project Information
- Remove version from README (avoid per-release update)

### v1.0.4 — Node Version Consistency

- Align framework README ("Node.js 26") with CLI ("Node.js 20+")
- Update `package.json` `engines.node`
- Test on Node 20 LTS

### v1.0.5 — API Documentation Enhancement

- Add `sendSuccess` / `sendError` examples with full parameters
- Add validation schema examples
- Add middleware examples
- Add error handling patterns

### v1.0.6 — Mobile Documentation Enhancement

- Clarify why native APK/iOS builds are not included
- Add native build roadmap (if applicable)
- Add custom device bridge adapter examples
- Add custom storage adapter examples

### v1.0.7 — Error Messages & DX Improvement

- Improve module registration error messages (add context)
- Improve dependency resolution errors (add module name)
- Improve API validation errors (add field name)
- Add `Error.cause` for stack traces

### v1.0.8 — TypeScript Declaration Improvement

- Add JSDoc comments to public APIs
- Add generics to `createState<T>`
- Add discriminated unions for module status
- Replace `any` with specific types

### v1.0.9 — Pre-v1.1.0 Cleanup

- Resolve all TODO comments in source
- Fix all `npm pack` warnings
- Fix all deprecation warnings
- Add `CONTRIBUTING.md` (if missing)
- Add `CODE_OF_CONDUCT.md` (optional)
- Add GitHub issue templates
- Full regression: 121+ passed

---

## v1.1.0 — Framework Enhancement

Fondasi Core, Web, API, Mobile, dan integrasi CLI sudah selesai.
v1.1.0 fokus ke enhancement, bukan rebuild.

| Tahap | Pengembangan | Tujuan |
|-------|--------------|--------|
| 1 | Web Component System | Komponen UI yang bisa digunakan kembali |
| 2 | Web Layout System | Layout aplikasi, halaman, dan nested layout |
| 3 | Router Enhancement | Dynamic route, nested route, dan route guard |
| 4 | API Controller System | Pengelompokan endpoint berdasarkan controller |
| 5 | API Error & Validation Enhancement | Penanganan error dan validasi lebih terstruktur |
| 6 | Mobile UI Components | Komponen dasar untuk aplikasi mobile |
| 7 | Mobile Navigation Enhancement | Pengelolaan navigasi dan lifecycle screen |
| 8 | Framework Configuration | Konfigurasi terpadu untuk modul opsional |
| 9 | Starter Templates Update | Menyesuaikan starter dengan fitur v1.1.0 |
| 10 | Final Integration Testing | Regresi seluruh fitur dan pengujian versi baru |

### Catatan v1.1.0

- Backward-compatible: semua API lama tetap jalan
- Breaking change disimpan untuk v2.0.0
- Dokumentasi update per tahap (jangan numpuk di akhir)
- Test per tahap (Tahap 10 hanya regresi)

---

## Prinsip Rilis

- **Patch (v1.0.x):** bug fix, docs, DX — backward-compatible
- **Minor (v1.1.0):** fitur baru — backward-compatible
- **Major (v2.0.0):** breaking change
- **Rilis rutin:** tiap patch selesai + test passed → publish
- **CHANGELOG per patch:** jangan numpuk
- **Test per patch:** tambah test regresi
...
