# Aplikasi Wali Kelas SD — Design Spec

**Tanggal:** 2026-08-06
**Status:** Approved

---

## 1. Konteks & Tujuan

Aplikasi browser-based untuk wali kelas SD dalam mendokumentasikan dan memantau perkembangan siswa. Data tersimpan 100% lokal di browser via IndexedDB. Tidak ada server, tidak ada login, tidak ada biaya hosting.

**Pengguna utama:** Wali kelas SD (1 guru per kelas, ~20 siswa)
**Target perangkat:** Responsif — desktop/laptop (input lengkap) dan HP/tablet (input cepat di kelas)

---

## 2. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, ekosistem luas |
| Styling | Tailwind CSS v4 | Utility-first, konsisten |
| Database | Dexie.js (wrapper IndexedDB) | API bersih, support query kompleks |
| Routing | TanStack Router | Type-safe, file-based routing |
| State Global | Zustand | Ringan, tanpa boilerplate |
| Charts | Recharts | Komposisi SVG, akses penuh ke mark |
| PDF | jsPDF + html2canvas | Generate PDF tanpa server |
| Icons | Lucide React | Konsisten, clean, tree-shakable |
| Font | Plus Jakarta Sans + Inter | Professional, tidak generik |
| Animasi | Framer Motion | Transisi halus purposeful |

---

## 3. Aesthetic Direction: Scandinavian + Editorial Hybrid

**Filosofi:** Dieter Rams-adjacent — setiap elemen punya fungsi. Hangat dan approachable untuk guru yang bukan tech-savvy, namun terstruktur seperti dokumen editorial agar data mudah di-scan.

**Yang dihindari:** Purple gradient, Inter-only, generic card grid, "AI slop" aesthetics.

### Design Tokens

```css
/* Warna utama */
--primary:      #2D6A4F;   /* Hijau tua — calming, profesional */
--primary-50:   #EAF4EE;
--primary-100:  #D5EAE0;
--accent:       #F4A261;   /* Oranye hangat — highlight penting */
--accent-50:    #FEF3EA;

/* Surface */
--surface:      #FAFAF8;   /* Warm white, bukan pure white */
--surface-2:    #F2F2EE;
--surface-3:    #E8E8E4;
--border:       #E2E2DE;

/* Text */
--text-primary: #1C1C1E;
--text-muted:   #6B7280;
--text-subtle:  #9CA3AF;

/* Status */
--success:      #059669;
--warning:      #D97706;
--danger:       #DC2626;
--info:         #2563EB;

/* Dark mode */
--dark-surface:   #1A1A18;
--dark-surface-2: #242422;
--dark-surface-3: #2E2E2C;
--dark-border:    #3A3A38;
--dark-text:      #E5E5E3;
--dark-muted:     #9CA3AF;

/* Radius */
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;

/* Shadow */
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08);
--shadow-md:  0 4px 16px rgba(0,0,0,0.06);
--shadow-lg:  0 8px 32px rgba(0,0,0,0.10);
```

### Tipografi

```
Heading: Plus Jakarta Sans, weight 600–700
Body:    Inter, weight 400–500
Mono:    JetBrains Mono (untuk data angka)

Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48px
Line height: 1.5 (body), 1.2 (heading)
```

---

## 4. Struktur Halaman & Routing

```
/                     → Dashboard
/siswa                → Daftar semua siswa
/siswa/:id            → Profil lengkap siswa
/absensi              → Input absensi harian
/absensi/rekap        → Rekap absensi per siswa / bulan
/akademis             → Manajemen mata pelajaran & input nilai
/laporan              → Generate & preview laporan PDF bulanan
/pengaturan           → Kelola data kelas, backup/restore
```

---

## 5. Data Model (Dexie.js / IndexedDB)

```typescript
// Kelas — konfigurasi global
interface Kelas {
  id: number;
  nama: string;          // e.g. "Kelas 3A"
  tahunAjaran: string;   // e.g. "2025/2026"
  namaWaliKelas: string;
  namaSekolah: string;
}

// Siswa
interface Siswa {
  id: string;            // UUID
  nama: string;
  nisn?: string;
  nomorAbsen: number;
  jenisKelamin: 'L' | 'P';
  tanggalLahir?: string; // ISO date
  alamat?: string;
  namaAyah?: string;
  namaIbu?: string;
  teleponOrtu?: string;
  foto?: string;         // base64 atau URL blob
  potensi: string[];     // array dari kategori preset
  aktif: boolean;        // untuk arsip siswa pindah/keluar
  createdAt: string;
}

// Absensi
interface Absensi {
  id: string;            // UUID
  siswaId: string;
  tanggal: string;       // ISO date "YYYY-MM-DD"
  status: 'H' | 'I' | 'S' | 'A'; // Hadir/Izin/Sakit/Alfa
  keterangan?: string;
}

// Mata Pelajaran
interface MataPelajaran {
  id: string;
  nama: string;
  urutan: number;        // untuk sorting
  warna?: string;        // warna accent opsional
}

// Nilai
interface Nilai {
  id: string;
  siswaId: string;
  mapelId: string;
  jenis: 'kuis' | 'latihan' | 'ulangan' | 'tugas';
  tanggal: string;       // ISO date
  nilai: number;         // 0–100
  keterangan?: string;
}

// Catatan Wali Kelas
interface Catatan {
  id: string;
  siswaId: string;
  tanggal: string;
  isi: string;
}
```

### Kategori Potensi Preset
```
seni_budaya | olahraga | matematika | bahasa | sains |
kepemimpinan | sosial | teknologi | musik | literasi
```

---

## 6. Fitur Per Halaman

### 6.1 Dashboard `/`

**Layout desktop:** 2-column grid
**Layout mobile:** Single column, scroll

**Komponen:**
- **Hero row** (4 stat tiles): Total Siswa Aktif, Hadir Hari Ini, Rata-rata Nilai Bulan Ini, Total Alfa Minggu Ini
- **Panel Absensi Hari Ini:** Jika belum diisi → CTA besar "Isi Absensi Sekarang"; jika sudah → ringkasan hadir/tidak
- **Chart Kehadiran 30 Hari:** Bar chart harian, satu warna (--primary), no rainbow
- **Siswa Perlu Perhatian:** List otomatis — siswa dengan absensi <80% bulan ini atau nilai rata-rata turun >10 poin
- **Distribusi Potensi:** Horizontal bar chart kategori potensi

### 6.2 Daftar Siswa `/siswa`

- Search bar + filter jenis kelamin
- Grid kartu siswa (3 kolom desktop, 2 kolom tablet, 1 kolom mobile)
- Setiap kartu: avatar inisial / foto, nama, nomor absen, badge potensi utama, persentase kehadiran
- FAB (floating action button) tambah siswa baru
- Tap kartu = navigasi ke profil

### 6.3 Profil Siswa `/siswa/:id`

**Header:** Foto/avatar, nama besar, info singkat (NISN, kelas, ortu)
**Tab navigation:** Akademis | Absensi | Potensi | Catatan

**Tab Akademis:**
- Daftar mapel dengan rata-rata nilai, sparkline mini 3 nilai terakhir
- Tombol "Tambah Nilai" per mapel → modal input

**Tab Absensi:**
- Kalender mini bulan ini dengan warna status per hari
- Statistik: % Hadir, total H/I/S/A semester ini

**Tab Potensi:**
- Grid badge kategori (bisa pilih/hapus)
- Visual yang menarik, bukan plain checkbox

**Tab Catatan:**
- Timeline catatan wali kelas
- Tombol tambah catatan baru

### 6.4 Absensi `/absensi`

**Mode Input Harian (default):**
- Date picker (default hari ini)
- Grid semua siswa: avatar + nama + 4 tombol status (H/I/S/A)
- Status aktif di-highlight dengan warna berbeda
- Tombol "Tandai Semua Hadir" di atas untuk efisiensi
- Tombol "Simpan Absensi" sticky di bottom
- Indicator: sudah berapa siswa yang diisi

**Mode Rekap `/absensi/rekap`:**
- Filter bulan + tahun
- Tabel: baris = siswa, kolom = tanggal, cell = status dengan warna
- Total per siswa di ujung kanan
- Export tabel ke PDF

### 6.5 Akademis `/akademis`

**Manajemen Mapel:**
- Daftar mapel dengan drag-to-reorder
- Tambah / rename / hapus mapel
- Konfirmasi sebelum hapus (data nilai terhubung akan terdampak)

**Input Nilai:**
- Pilih mapel → pilih siswa → isi detail nilai
- Atau: pilih siswa → lihat semua mapel → isi nilai per mapel
- Jenis nilai: kuis / latihan / ulangan / tugas
- Tampilan nilai terbaru per mapel per siswa dalam tabel ringkas

### 6.6 Laporan PDF `/laporan`

**Generate Laporan Bulanan Per Siswa:**
- Pilih bulan
- Pilih siswa (bisa semua atau pilih tertentu)
- Preview laporan di browser sebelum download

**Isi Laporan (per siswa, format A4):**
- Header: nama sekolah, kelas, nama wali kelas, bulan/tahun
- Identitas siswa
- Rekap absensi bulan itu (tabel H/I/S/A + persentase)
- Nilai per mata pelajaran bulan itu (semua nilai + rata-rata)
- Potensi anak (badge kategori)
- Catatan wali kelas bulan itu
- Tanda tangan area (wali kelas + ortu)

**Output:** Download PDF per siswa, atau ZIP semua siswa

### 6.7 Pengaturan `/pengaturan`

- Edit info kelas (nama kelas, tahun ajaran, nama wali kelas, nama sekolah)
- **Export Data:** Download file JSON berisi semua data (backup)
- **Import Data:** Upload file JSON untuk restore / pindah perangkat
- **Reset Data:** Hapus semua data (dengan konfirmasi 2 langkah)
- Info kapasitas IndexedDB yang terpakai

---

## 7. Navigasi

### Desktop (≥1024px)
- Sidebar kiri, lebar 240px, sticky
- Logo + nama kelas di atas
- Menu item: ikon + label, active state dengan background --primary-50 dan left border --primary
- User info di bawah

### Tablet (768px–1023px)
- Sidebar kolaps jadi icon-only (56px)
- Hover/tap untuk expand sementara

### Mobile (<768px)
- Bottom tab bar dengan 5 tab: Dashboard, Siswa, Absensi, Laporan, Pengaturan
- Semua touch target min 44×44px

---

## 8. Data Visualization Guidelines

Mengikuti dataviz skill — tidak ada rainbow chart, tidak ada dual-axis.

- **Kehadiran harian (bar chart):** Single color --primary, axis recessive, tooltip per bar
- **Stat tiles:** Hero number besar, label kecil di bawah, trend indicator (naik/turun)
- **Distribusi potensi:** Horizontal bar chart, categorical colors (fixed order, validated)
- **Sparkline nilai:** 2px line, no markers, no axis labels, embedded di tabel
- **Rekap absensi:** Color-coded cells — Hadir = hijau, Izin = biru, Sakit = kuning, Alfa = merah

---

## 9. Aksesibilitas & UX

- Semua interactive element: focus ring yang terlihat jelas
- ARIA labels pada ikon tanpa teks
- Color tidak jadi satu-satunya penanda (selalu ada label/ikon pendamping)
- Tidak ada animasi dekoratif — hanya transisi purposeful (150–300ms ease)
- `prefers-reduced-motion` dihormati
- Body text min 16px di mobile (mencegah iOS auto-zoom)

---

## 10. Offline & Data Safety

- Semua data di IndexedDB — bekerja 100% offline
- Export JSON tersedia di Pengaturan sebagai backup manual
- Import JSON untuk restore atau pindah perangkat (merge atau replace)
- Tidak ada autosync — user sadar data ada di perangkat ini
- Warning jelas saat pertama kali buka: "Data tersimpan di browser ini"

---

## 11. Out of Scope (v1)

- Multi-user / akses dari cloud
- Notifikasi push
- Integrasi dengan sistem sekolah lain
- Fitur komunikasi dengan orang tua
- Multi-kelas per guru (fokus 1 kelas)
