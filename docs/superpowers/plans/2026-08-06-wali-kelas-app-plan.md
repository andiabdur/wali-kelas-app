# Aplikasi Wali Kelas SD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based, offline-first application for primary school homeroom teachers (wali kelas) to track attendance, grades, potentials, and generate student PDF reports.

**Architecture:** React 18 SPA + Vite + Tailwind CSS + Dexie.js (IndexedDB) for local data storage, and jsPDF + html2canvas for client-side PDF document generation. Everything runs offline in the user's browser, with export/import JSON functionality to transfer data between devices.

**Tech Stack:** React 18, Vite, Tailwind CSS v4, Lucide React (Icons), Dexie.js, Recharts, jsPDF, html2canvas, Vitest (Testing framework).

---

### Task 1: Project Scaffolding, Package Setup, and Testing Framework

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `index.html`

- [ ] **Step 1: Create package.json with dependencies**
Create `package.json` indicating the dependency set including Dexie, Recharts, jsPDF, Tailwind, etc.
- [ ] **Step 2: Initialize Vite config and Tailwind config**
Define Vite configuration with support for React and Vitest testing, and Tailwind stylesheet references.
- [ ] **Step 3: Setup basic entry points**
Create `index.html`, `src/main.tsx` and `src/index.css` to allow launching the application.
- [ ] **Step 4: Commit dependencies and scaffolding**

---

### Task 2: Database Schema Setup (Dexie.js)

**Files:**
- Create: `src/db/database.ts`
- Test: `src/db/__tests__/database.test.ts`

- [ ] **Step 1: Define TypeScript models and Dexie DB subclass**
Write Dexie database schema and helper functions for initialization.
- [ ] **Step 2: Write tests for CRUD operations on Siswa, Absensi, Nilai, Mapel**
Ensure data logic stores correctly and relationships hold (e.g. deleting Mapel deletes associated Nilai).
- [ ] **Step 3: Commit database layer**

---

### Task 3: Global State Management (Zustand & Settings)

**Files:**
- Create: `src/store/useStore.ts`
- Test: `src/store/__tests__/useStore.test.ts`

- [ ] **Step 1: Write Zustand store**
Implement global triggers for current class information, active school year, active teacher name.
- [ ] **Step 2: Add functions for DB synchronization & Import/Export JSON**
Expose JSON file parsing and serializing features in the store actions.
- [ ] **Step 3: Commit store layer**

---

### Task 4: Layout and Navigation Framework (Desktop & Mobile-First)

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/Navigation.tsx`

- [ ] **Step 1: Write Navigation UI**
Ensure responsive design (Desktop Sidebar vs Mobile Bottom Tab Bar). Text sizes should comply to >16px.
- [ ] **Step 2: Implement basic routing/view switching state**
Toggle views: Dashboard, Siswa, Absensi, Laporan, Pengaturan.
- [ ] **Step 3: Commit navigation components**

---

### Task 5: Dashboard and Data Visualizations

**Files:**
- Create: `src/pages/Dashboard.tsx`
- Create: `src/components/DashboardCharts.tsx`

- [ ] **Step 1: Create Stat Tiles row**
Display: Total Siswa, Hadir Hari Ini, Rata-rata Nilai, Alpa Minggu ini.
- [ ] **Step 2: Implement bar charts and horizontal charts using Recharts**
Apply a unified single-color `--primary` for attendance, and a clean categorical palette for student potentials.
- [ ] **Step 3: Add "Siswa Perlu Perhatian" highlight list**
Filter logic for attendance rate below 80% or grade dropdown > 10% month-over-month.
- [ ] **Step 4: Commit Dashboard page**

---

### Task 6: Student Management (Daftar Siswa & Profil Detail)

**Files:**
- Create: `src/pages/SiswaList.tsx`
- Create: `src/pages/SiswaDetail.tsx`

- [ ] **Step 1: Build SiswaList with search, filter, and Add Student Modal**
Ensure swipeable/desktop-friendly cards with student basic statistics.
- [ ] **Step 2: Build tabs on SiswaDetail (Akademis, Absensi, Potensi, Catatan)**
Provide sparklines for academic grades, badge selection for student potentials, and list of periodic notes.
- [ ] **Step 3: Commit Student page operations**

---

### Task 7: Attendance Attendance Entry & Monthly Summary

**Files:**
- Create: `src/pages/Absensi.tsx`
- Create: `src/pages/AbsensiRekap.tsx`

- [ ] **Step 1: Build daily attendance input interface**
Enable easy toggles for status H/I/S/A. Add "Set All to Hadir" button to expedite operations.
- [ ] **Step 2: Create monthly grid table summary**
Display date columns and rows of students with highlighted status codes (colored cells instead of plain text).
- [ ] **Step 3: Commit Attendance page components**

---

### Task 8: Academic Page & Grade Inserter

**Files:**
- Create: `src/pages/Akademis.tsx`

- [ ] **Step 1: Add Subject (Mapel) management interface**
Enable custom subject addition, editing and order sequences.
- [ ] **Step 2: Create a batch grade entry wizard**
Wali kelas inputs score by picking a subject, exam type (kuis, latihan, ulangan), Date, and inserting scores for everyone.
- [ ] **Step 3: Commit Academic views**

---

### Task 9: Report Generator (PDF Output & Print-ready View)

**Files:**
- Create: `src/pages/Laporan.tsx`
- Create: `src/utils/pdfGenerator.ts`

- [ ] **Step 1: Layout A4 preview structure**
Render an clean HTML preview that reflects exactly how a student's card will print out.
- [ ] **Step 2: Add jsPDF script to generate and download file**
Trigger browser downloads with custom file namings e.g., `Laporan_Bulanan_{NamaSiswa}.pdf`.
- [ ] **Step 3: Commit Report Generator module**

---

### Task 10: Settings, Backup / Restore (JSON), Reset Data

**Files:**
- Create: `src/pages/Pengaturan.tsx`

- [ ] **Step 1: Create class profile editor**
Class attributes: Class name, School year, Teacher, School name.
- [ ] **Step 2: Build Export & Import mechanisms**
Implement JSON read and write file flows with proper success notifications.
- [ ] **Step 3: Implement data reset dialog**
A safe two-step confirmation dialog before running Dexie wipe commands.
- [ ] **Step 4: Commit Settings page and perform final tests**
