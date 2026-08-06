import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, BookOpen, CalendarDays, Lightbulb, MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react'
import { db, generateId, KATEGORI_POTENSI } from '../db/database'
import { useStore } from '../store/useStore'
import { Avatar, StudentForm, ConfirmDeleteModal } from './SiswaList'

const tabs = [
  { id: 'akademis', label: 'Akademis', icon: BookOpen },
  { id: 'absensi', label: 'Absensi', icon: CalendarDays },
  { id: 'potensi', label: 'Potensi', icon: Lightbulb },
  { id: 'catatan', label: 'Catatan', icon: MessageSquare },
] as const

type TabId = (typeof tabs)[number]['id']

export function SiswaDetail() {
  const { selectedSiswaId, navigate, notify } = useStore()
  const [activeTab, setActiveTab] = useState<TabId>('akademis')
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const siswa = useLiveQuery(() => selectedSiswaId ? db.siswa.get(selectedSiswaId) : undefined, [selectedSiswaId])
  const nilai = useLiveQuery(() => selectedSiswaId ? db.nilai.where('siswaId').equals(selectedSiswaId).toArray() : [], [selectedSiswaId]) ?? []
  const mapel = useLiveQuery(() => db.mataPelajaran.orderBy('urutan').toArray(), []) ?? []
  const absensi = useLiveQuery(() => selectedSiswaId ? db.absensi.where('siswaId').equals(selectedSiswaId).toArray() : [], [selectedSiswaId]) ?? []
  const catatan = useLiveQuery(() => selectedSiswaId ? db.catatan.where('siswaId').equals(selectedSiswaId).reverse().sortBy('tanggal') : [], [selectedSiswaId]) ?? []
  const [note, setNote] = useState('')

  if (!siswa) {
    return <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-6 dark:bg-dark-surface-2">Siswa tidak ditemukan.</div>
  }

  async function handleDelete() {
    await db.transaction('rw', [db.siswa, db.absensi, db.nilai, db.catatan], async () => {
      await db.siswa.delete(siswa!.id)
      await db.absensi.where('siswaId').equals(siswa!.id).delete()
      await db.nilai.where('siswaId').equals(siswa!.id).delete()
      await db.catatan.where('siswaId').equals(siswa!.id).delete()
    })
    notify('Data siswa berhasil dihapus.', 'info')
    navigate('siswa')
  }

  async function togglePotensi(id: string) {
    const isRemove = siswa!.potensi.includes(id)
    const next = isRemove ? siswa!.potensi.filter((item) => item !== id) : [...siswa!.potensi, id]
    await db.siswa.update(siswa!.id, { potensi: next })
    const label = KATEGORI_POTENSI.find((k) => k.id === id)?.label
    notify(isRemove ? `Potensi "${label}" dihapus.` : `Potensi "${label}" ditandai.`, 'info')
  }

  async function addNote() {
    if (!note.trim()) return
    await db.catatan.add({ id: generateId(), siswaId: siswa!.id, tanggal: new Date().toISOString().slice(0, 10), isi: note.trim() })
    notify('Catatan perkembangan berhasil ditambahkan.')
    setNote('')
  }

  return (
    <section className="space-y-5">
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('siswa')} className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[var(--text-muted)] hover:text-primary transition">
        <ArrowLeft size={18} /> Kembali ke daftar siswa
      </motion.button>

      <header className="rounded-3xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={siswa.nama} />
            <div>
              <h1 className="font-heading text-3xl font-bold">{siswa.nama}</h1>
              <p className="mt-1 text-[var(--text-muted)]">No. absen {siswa.nomorAbsen} • {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              <p className="text-sm font-medium text-primary mt-0.5">
                {siswa.nisn ? `NISN: ${siswa.nisn}` : 'NISN: -'} &nbsp;•&nbsp; {siswa.nis ? `NIS: ${siswa.nis}` : 'NIS: -'}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Orang tua: {siswa.namaAyah || siswa.namaIbu || '-'} • {siswa.teleponOrtu || '-'}</p>
              {siswa.alamat && <p className="text-xs text-[var(--text-muted)] mt-0.5">Alamat: {siswa.alamat}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1"
            >
              <Pencil size={16} /> Edit Data
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDeleting(true)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100/50"
            >
              <Trash2 size={16} /> Hapus
            </motion.button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isEditing && (
          <StudentForm
            initialData={siswa}
            onClose={() => setIsEditing(false)}
            nextNumber={siswa.nomorAbsen}
            notify={notify}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleting && (
          <ConfirmDeleteModal
            studentName={siswa.nama}
            onConfirm={handleDelete}
            onClose={() => setIsDeleting(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white/60 p-2 dark:bg-dark-surface-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id)} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}>
              <Icon size={17} /> {tab.label}
            </motion.button>
          )
        })}
      </div>

      {activeTab === 'akademis' && (
        <div className="grid gap-3">
          {mapel.map((m) => {
            const list = nilai.filter((n) => n.mapelId === m.id)
            const avg = list.length ? Math.round(list.reduce((sum, n) => sum + n.nilai, 0) / list.length) : 0
            return <div key={m.id} className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 dark:bg-dark-surface-2"><p className="font-heading text-lg font-bold">{m.nama}</p><p className="text-sm text-[var(--text-muted)]">Rata-rata: {avg || '-'} • {list.length} nilai tercatat</p></div>
          })}
          {!mapel.length && <Empty text="Belum ada mata pelajaran. Tambahkan di halaman Akademis." />}
        </div>
      )}

      {activeTab === 'absensi' && (
        <div className="grid gap-3 sm:grid-cols-4">
          {(['H', 'I', 'S', 'A'] as const).map((status) => <Stat key={status} label={status} value={absensi.filter((a) => a.status === status).length} />)}
        </div>
      )}

      {activeTab === 'potensi' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KATEGORI_POTENSI.map((item) => (
            <motion.button key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.94 }} onClick={() => togglePotensi(item.id)} className={`min-h-14 rounded-2xl border p-4 text-left font-semibold transition ${siswa.potensi.includes(item.id) ? 'border-primary bg-primary-50 text-primary shadow-sm' : 'border-[var(--border)] bg-white/70 dark:bg-dark-surface-2 hover:border-gray-300'}`}>{item.label}</motion.button>
          ))}
        </div>
      )}

      {activeTab === 'catatan' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 dark:bg-dark-surface-2">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis catatan perkembangan siswa..." className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-base outline-none focus:ring-2 focus:ring-primary/20" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={addNote} className="mt-3 flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 font-semibold text-white shadow-md"><Plus size={18} /> Tambah Catatan</motion.button>
          </div>
          {catatan.map((c) => <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 dark:bg-dark-surface-2"><p className="text-sm text-[var(--text-muted)]">{c.tanggal}</p><p className="mt-2">{c.isi}</p></div>)}
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 text-center dark:bg-dark-surface-2"><p className="font-heading text-3xl font-bold">{value}</p><p className="text-sm text-[var(--text-muted)]">{label}</p></div>
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-6 text-center text-[var(--text-muted)] dark:bg-dark-surface-2">{text}</div>
}
