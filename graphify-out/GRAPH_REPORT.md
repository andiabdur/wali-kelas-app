# Graph Report - Aplikasi-wali-kelas  (2026-08-06)

## Corpus Check
- 28 files · ~15,705 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 211 nodes · 293 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- Aplikasi Wali Kelas SD — Design Spec
- database.ts
- devDependencies
- compilerOptions
- dependencies
- Aplikasi Wali Kelas SD Implementation Plan
- package.json
- compilerOptions
- Dashboard.tsx
- Absensi.tsx
- verify-core.mjs
- smoke.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `useStore` - 16 edges
3. `Aplikasi Wali Kelas SD — Design Spec` - 12 edges
4. `Aplikasi Wali Kelas SD Implementation Plan` - 11 edges
5. `getActiveStudents()` - 10 edges
6. `db` - 8 edges
7. `6. Fitur Per Halaman` - 8 edges
8. `KATEGORI_POTENSI` - 7 edges
9. `compilerOptions` - 7 edges
10. `Dashboard()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `downloadElementAsPdf()` --references--> `jspdf`  [EXTRACTED]
  src/utils/pdfGenerator.ts → package.json
- `Akademis()` --calls--> `getActiveStudents()`  [EXTRACTED]
  src/pages/Akademis.tsx → src/db/queries.ts
- `Dashboard()` --calls--> `getActiveStudents()`  [EXTRACTED]
  src/pages/Dashboard.tsx → src/db/queries.ts
- `Dashboard()` --calls--> `useStore`  [EXTRACTED]
  src/pages/Dashboard.tsx → src/store/useStore.ts
- `Laporan()` --calls--> `useStore`  [EXTRACTED]
  src/pages/Laporan.tsx → src/store/useStore.ts

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.13
Nodes (17): App(), Layout(), DesktopNavigation(), mobileItems, MobileNavigation(), primaryItems, exportAllData(), Kelas (+9 more)

### Community 1 - "Aplikasi Wali Kelas SD — Design Spec"
Cohesion: 0.08
Nodes (25): 10. Offline & Data Safety, 11. Out of Scope (v1), 1. Konteks & Tujuan, 2. Tech Stack, 3. Aesthetic Direction: Scandinavian + Editorial Hybrid, 4. Struktur Halaman & Routing, 5. Data Model (Dexie.js / IndexedDB), 6.1 Dashboard `/` (+17 more)

### Community 2 - "database.ts"
Cohesion: 0.15
Nodes (14): Catatan, db, generateId(), importAllData(), KATEGORI_POTENSI, MataPelajaran, Nilai, resetAllData() (+6 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, jsdom, devDependencies, autoprefixer, jsdom, @playwright/test, postcss, tailwindcss (+17 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules (+16 more)

### Community 5 - "dependencies"
Cohesion: 0.09
Nodes (22): dexie, dexie-react-hooks, framer-motion, html2canvas, jspdf, lucide-react, dependencies, dexie (+14 more)

### Community 6 - "Aplikasi Wali Kelas SD Implementation Plan"
Cohesion: 0.17
Nodes (11): Aplikasi Wali Kelas SD Implementation Plan, Task 10: Settings, Backup / Restore (JSON), Reset Data, Task 1: Project Scaffolding, Package Setup, and Testing Framework, Task 2: Database Schema Setup (Dexie.js), Task 3: Global State Management (Zustand & Settings), Task 4: Layout and Navigation Framework (Desktop & Mobile-First), Task 5: Dashboard and Data Visualizations, Task 6: Student Management (Daftar Siswa & Profil Detail) (+3 more)

### Community 7 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, preview, test, type (+1 more)

### Community 8 - "compilerOptions"
Cohesion: 0.20
Nodes (9): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict (+1 more)

### Community 9 - "Dashboard.tsx"
Cohesion: 0.33
Nodes (5): AttendanceBarChart(), PotentialBars(), Dashboard(), lastDays(), todayISO()

### Community 10 - "Absensi.tsx"
Cohesion: 0.40
Nodes (5): Absensi, Absensi(), Status, statusMeta, todayISO()

### Community 11 - "verify-core.mjs"
Cohesion: 0.33
Nodes (5): backupPromise, checks, errors, pdfPromise, scoreInput

## Knowledge Gaps
- **104 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Why does `downloadElementAsPdf()` connect `dependencies` to `database.ts`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
- **Should `Aplikasi Wali Kelas SD — Design Spec` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._