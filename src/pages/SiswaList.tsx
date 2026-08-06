import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search, Pencil, Trash2, AlertTriangle, X } from 'lucide-react'
import { db, generateId, KATEGORI_POTENSI, type Siswa } from '../db/database'
import { getActiveStudents } from '../db/queries'
import { useStore } from '../store/useStore'

export function SiswaList() {
  const { navigate, notify } = useStore()
  const siswa = useLiveQuery(async () => getActiveStudents(await db.siswa.toArray()), []) ?? []
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null)
  const [deletingSiswa, setDeletingSiswa] = useState<Siswa | null>(null)

  const filtered = siswa.filter((item) => item.nama.toLowerCase().includes(query.toLowerCase()))

  async function handleDelete(siswaId: string) {
    await db.transaction('rw', [db.siswa, db.absensi, db.nilai, db.catatan], async () => {
      await db.siswa.delete(siswaId)
      await db.absensi.where('siswaId').equals(siswaId).delete()
      await db.nilai.where('siswaId').equals(siswaId).delete()
      await db.catatan.where('siswaId').equals(siswaId).delete()
    })
    notify('Data siswa berhasil dihapus.', 'info')
    setDeletingSiswa(null)
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Data Siswa</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Daftar Siswa</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingSiswa(null); setShowForm(true); }}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md"
        >
          <Plus size={18} /> Tambah Siswa
        </motion.button>
      </div>

      <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/70 px-4 shadow-sm dark:bg-dark-surface-2 focus-within:ring-2 focus-within:ring-primary/20 transition">
        <Search size={20} className="text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama siswa..."
          className="w-full bg-transparent text-base outline-none placeholder:text-[var(--text-subtle)]"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -3 }}
            className="group relative rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm transition hover:shadow-md dark:bg-dark-surface-2"
          >
            <div className="flex items-start gap-4 cursor-pointer" onClick={() => navigate('siswa-detail', item.id)}>
              <Avatar name={item.nama} />
              <div className="min-w-0 flex-1 pr-14">
                <p className="font-heading text-lg font-bold group-hover:text-primary transition-colors">{item.nama}</p>
                <p className="text-sm text-[var(--text-muted)]">No. {item.nomorAbsen} • {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                {(item.nisn || item.nis) && (
                  <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.nisn ? `NISN: ${item.nisn}` : ''} {item.nisn && item.nis ? '• ' : ''} {item.nis ? `NIS: ${item.nis}` : ''}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.potensi.slice(0, 2).map((potensi) => {
                    const meta = KATEGORI_POTENSI.find((k) => k.id === potensi)
                    return <span key={potensi} className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">{meta?.label}</span>
                  })}
                  {!item.potensi.length && <span className="text-xs text-[var(--text-muted)]">Belum ada potensi</span>}
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-90 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setEditingSiswa(item); setShowForm(true); }}
                title="Edit Siswa"
                className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-primary dark:hover:bg-dark-surface-1 dark:hover:text-primary transition"
              >
                <Pencil size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setDeletingSiswa(item); }}
                title="Hapus Siswa"
                className="rounded-lg p-2 text-gray-400 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <StudentForm
            initialData={editingSiswa}
            onClose={() => { setShowForm(false); setEditingSiswa(null); }}
            nextNumber={siswa.length + 1}
            notify={notify}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingSiswa && (
          <ConfirmDeleteModal
            studentName={deletingSiswa.nama}
            onConfirm={() => handleDelete(deletingSiswa.id)}
            onClose={() => setDeletingSiswa(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

export function StudentForm({
  initialData,
  onClose,
  nextNumber,
  notify,
}: {
  initialData?: Siswa | null
  onClose: () => void
  nextNumber: number
  notify: (msg: string) => void
}) {
  const [form, setForm] = useState({
    nama: initialData?.nama || '',
    nisn: initialData?.nisn || '',
    nis: initialData?.nis || '',
    nomorAbsen: initialData?.nomorAbsen ?? nextNumber,
    jenisKelamin: (initialData?.jenisKelamin || 'L') as 'L' | 'P',
    teleponOrtu: initialData?.teleponOrtu || '',
    namaAyah: initialData?.namaAyah || '',
    namaIbu: initialData?.namaIbu || '',
    alamat: initialData?.alamat || '',
  })

  async function save() {
    if (!form.nama.trim()) return
    if (initialData) {
      await db.siswa.update(initialData.id, {
        nama: form.nama.trim(),
        nisn: form.nisn.trim() || undefined,
        nis: form.nis.trim() || undefined,
        nomorAbsen: Number(form.nomorAbsen),
        jenisKelamin: form.jenisKelamin,
        teleponOrtu: form.teleponOrtu.trim() || undefined,
        namaAyah: form.namaAyah.trim() || undefined,
        namaIbu: form.namaIbu.trim() || undefined,
        alamat: form.alamat.trim() || undefined,
      })
      notify(`Data siswa "${form.nama.trim()}" berhasil diperbarui.`)
    } else {
      const siswa: Siswa = {
        id: generateId(),
        nama: form.nama.trim(),
        nisn: form.nisn.trim() || undefined,
        nis: form.nis.trim() || undefined,
        nomorAbsen: Number(form.nomorAbsen),
        jenisKelamin: form.jenisKelamin,
        teleponOrtu: form.teleponOrtu.trim() || undefined,
        namaAyah: form.namaAyah.trim() || undefined,
        namaIbu: form.namaIbu.trim() || undefined,
        alamat: form.alamat.trim() || undefined,
        potensi: [],
        aktif: true,
        createdAt: new Date().toISOString(),
      }
      await db.siswa.add(siswa)
      notify(`Siswa "${siswa.nama}" berhasil ditambahkan.`)
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end bg-black/40 backdrop-blur-sm p-4 sm:items-center sm:justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 shadow-xl max-h-[90vh] overflow-y-auto border border-[var(--border)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">{initialData ? 'Edit Data Siswa' : 'Tambah Siswa'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-surface-1">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Input label="Nama Lengkap *" value={form.nama} onChange={(nama) => setForm({ ...form, nama })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="NISN" value={form.nisn} onChange={(nisn) => setForm({ ...form, nisn })} />
            <Input label="NIS" value={form.nis} onChange={(nis) => setForm({ ...form, nis })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nomor Absen *" type="number" value={String(form.nomorAbsen)} onChange={(nomorAbsen) => setForm({ ...form, nomorAbsen: Number(nomorAbsen) })} />
            <label className="block">
              <span className="text-sm font-semibold">Jenis Kelamin</span>
              <select value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as 'L' | 'P' })} className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-2 dark:text-gray-100">
                <option value="L" className="bg-white text-gray-900 dark:bg-dark-surface-2 dark:text-gray-100">Laki-laki</option>
                <option value="P" className="bg-white text-gray-900 dark:bg-dark-surface-2 dark:text-gray-100">Perempuan</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Nama Ayah" value={form.namaAyah} onChange={(namaAyah) => setForm({ ...form, namaAyah })} />
            <Input label="Nama Ibu" value={form.namaIbu} onChange={(namaIbu) => setForm({ ...form, namaIbu })} />
          </div>

          <Input label="Telepon Orang Tua" value={form.teleponOrtu} onChange={(teleponOrtu) => setForm({ ...form, teleponOrtu })} />
          <Input label="Alamat" value={form.alamat} onChange={(alamat) => setForm({ ...form, alamat })} />
        </div>

        <div className="mt-6 flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="min-h-11 flex-1 rounded-xl border border-[var(--border)] font-semibold hover:bg-gray-50 dark:hover:bg-dark-surface-1 dark:text-gray-100">Batal</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={save} className="min-h-11 flex-1 rounded-xl bg-primary font-semibold text-white shadow-md">{initialData ? 'Simpan Perubahan' : 'Tambah Siswa'}</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ConfirmDeleteModal({
  studentName,
  onConfirm,
  onClose,
}: {
  studentName: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end bg-black/40 backdrop-blur-sm p-4 sm:items-center sm:justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-xl border border-[var(--border)] text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertTriangle size={28} />
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold">Hapus Data Siswa?</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Apakah Anda yakin ingin menghapus siswa <span className="font-semibold text-[var(--text-primary)]">"{studentName}"</span>? Seluruh data nilai, absensi, dan catatan siswa ini akan terhapus.
        </p>

        <div className="mt-6 flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="min-h-11 flex-1 rounded-xl border border-[var(--border)] font-semibold hover:bg-gray-50 dark:hover:bg-dark-surface-1">Batal</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={onConfirm} className="min-h-11 flex-1 rounded-xl bg-red-600 font-semibold text-white shadow-md hover:bg-red-700">Ya, Hapus</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-2" />
    </label>
  )
}

export function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 font-heading text-lg font-bold text-primary">{initials || '?'}</div>
}
