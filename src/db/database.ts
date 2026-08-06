import Dexie, { type Table } from 'dexie'

export interface Kelas {
  id?: number
  nama: string
  tahunAjaran: string
  namaWaliKelas: string
  nipWaliKelas?: string
  namaSekolah: string
  logoDinas?: string
  logoSekolah?: string
}

export interface Siswa {
  id: string
  nama: string
  nisn?: string
  nis?: string
  nomorAbsen: number
  jenisKelamin: 'L' | 'P'
  tanggalLahir?: string
  alamat?: string
  namaAyah?: string
  namaIbu?: string
  teleponOrtu?: string
  foto?: string
  potensi: string[]
  aktif: boolean
  createdAt: string
}

export interface Absensi {
  id: string
  siswaId: string
  tanggal: string
  status: 'H' | 'I' | 'S' | 'A'
  keterangan?: string
  pertanyaanHariIni?: string
  jawabanSiswa?: string
  dimensiPsikologis?: string
}

export interface AnalisisPsikologis {
  id: string
  siswaId: string
  updatedAt: string
  karakterUtama: string[]
  narasiKarakter: string
  saranPendekatan: string
  rekomendasiBakat: string
}

export interface MataPelajaran {
  id: string
  nama: string
  urutan: number
  warna?: string
}

export interface Nilai {
  id: string
  siswaId: string
  mapelId: string
  jenis: 'kuis' | 'latihan' | 'ulangan' | 'tugas'
  tanggal: string
  nilai: number
  keterangan?: string
}

export interface Catatan {
  id: string
  siswaId: string
  tanggal: string
  isi: string
}

export const KATEGORI_POTENSI = [
  { id: 'seni_budaya', label: 'Seni Budaya', iconName: 'Palette' },
  { id: 'olahraga', label: 'Olahraga', iconName: 'Trophy' },
  { id: 'matematika', label: 'Matematika', iconName: 'Calculator' },
  { id: 'bahasa', label: 'Bahasa', iconName: 'BookOpen' },
  { id: 'sains', label: 'Sains', iconName: 'FlaskConical' },
  { id: 'kepemimpinan', label: 'Kepemimpinan', iconName: 'Crown' },
  { id: 'sosial', label: 'Sosial', iconName: 'Users' },
  { id: 'teknologi', label: 'Teknologi', iconName: 'Laptop' },
  { id: 'musik', label: 'Musik', iconName: 'Music' },
  { id: 'literasi', label: 'Literasi', iconName: 'BookMarked' },
]

export class WaliKelasDB extends Dexie {
  kelas!: Table<Kelas>
  siswa!: Table<Siswa>
  absensi!: Table<Absensi>
  mataPelajaran!: Table<MataPelajaran>
  nilai!: Table<Nilai>
  catatan!: Table<Catatan>
  analisisPsikologis!: Table<AnalisisPsikologis>

  constructor() {
    super('WaliKelasDB')
    this.version(1).stores({
      kelas: '++id',
      siswa: 'id, nama, nomorAbsen, aktif',
      absensi: 'id, siswaId, tanggal, [siswaId+tanggal]',
      mataPelajaran: 'id, urutan',
      nilai: 'id, siswaId, mapelId, tanggal, [siswaId+mapelId]',
      catatan: 'id, siswaId, tanggal',
      analisisPsikologis: 'id, siswaId, updatedAt',
    })
  }
}

export const db = new WaliKelasDB()

export function generateId(): string {
  return crypto.randomUUID()
}

export async function exportAllData() {
  const [kelas, siswa, absensi, mataPelajaran, nilai, catatan] = await Promise.all([
    db.kelas.toArray(),
    db.siswa.toArray(),
    db.absensi.toArray(),
    db.mataPelajaran.toArray(),
    db.nilai.toArray(),
    db.catatan.toArray(),
  ])
  return { kelas, siswa, absensi, mataPelajaran, nilai, catatan, exportedAt: new Date().toISOString() }
}

export async function importAllData(data: Awaited<ReturnType<typeof exportAllData>>) {
  await db.transaction('rw', [db.kelas, db.siswa, db.absensi, db.mataPelajaran, db.nilai, db.catatan], async () => {
    await db.kelas.clear()
    await db.siswa.clear()
    await db.absensi.clear()
    await db.mataPelajaran.clear()
    await db.nilai.clear()
    await db.catatan.clear()
    if (data.kelas?.length) await db.kelas.bulkAdd(data.kelas)
    if (data.siswa?.length) await db.siswa.bulkAdd(data.siswa)
    if (data.absensi?.length) await db.absensi.bulkAdd(data.absensi)
    if (data.mataPelajaran?.length) await db.mataPelajaran.bulkAdd(data.mataPelajaran)
    if (data.nilai?.length) await db.nilai.bulkAdd(data.nilai)
    if (data.catatan?.length) await db.catatan.bulkAdd(data.catatan)
  })
}

export async function resetAllData() {
  await db.transaction('rw', [db.kelas, db.siswa, db.absensi, db.mataPelajaran, db.nilai, db.catatan], async () => {
    await db.kelas.clear()
    await db.siswa.clear()
    await db.absensi.clear()
    await db.mataPelajaran.clear()
    await db.nilai.clear()
    await db.catatan.clear()
  })
}
