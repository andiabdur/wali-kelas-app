import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, AlertTriangle, X } from 'lucide-react'
import {
  useSiswaList,
  addSiswa,
  updateSiswa,
  deleteSiswaCascade,
  generateId,
  KATEGORI_POTENSI,
  type Siswa,
} from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { formatTTL } from '../utils/formatters'

export function SiswaList() {
  const { navigate, notify } = useStore()
  const { activeKelasId } = useAuth()
  const { siswa: allSiswa } = useSiswaList(activeKelasId)
  const siswa = allSiswa.filter((item) => item.aktif)
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null)
  const [deletingSiswa, setDeletingSiswa] = useState<Siswa | null>(null)

  const filtered = siswa.filter((item) => item.nama.toLowerCase().includes(query.toLowerCase()))

  async function handleDelete(siswaId: string) {
    try {
      await deleteSiswaCascade(siswaId, activeKelasId)
      notify('Data siswa berhasil dihapus.', 'info')
    } catch (err: any) {
      notify(err.message || 'Gagal menghapus data siswa.', 'error')
    } finally {
      setDeletingSiswa(null)
    }
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm transition hover:shadow-md dark:bg-dark-surface-2"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={item.nama} />
                  <div>
                    <h2
                      onClick={() => navigate('siswa-detail', item.id)}
                      className="font-heading text-lg font-bold hover:text-primary cursor-pointer transition line-clamp-1"
                    >
                      {item.nama}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Absen #{item.nomorAbsen} &bull; {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingSiswa(item); setShowForm(true); }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-surface-1"
                    title="Edit Siswa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingSiswa(item)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Hapus Siswa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
                {item.tanggalLahir && (
                  <p><span className="font-semibold text-[var(--text-primary)]">TTL:</span> {formatTTL(item.tempatLahir, item.tanggalLahir)}</p>
                )}
                {item.nisn && (
                  <p><span className="font-semibold text-[var(--text-primary)]">NISN/NIS:</span> {item.nisn} {item.nis ? `(${item.nis})` : ''}</p>
                )}
                {item.teleponOrtu && (
                  <p><span className="font-semibold text-[var(--text-primary)]">Kontak Ortu:</span> {item.teleponOrtu}</p>
                )}
              </div>

              {item.potensi && item.potensi.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.potensi.slice(0, 3).map((pId) => {
                    const cat = KATEGORI_POTENSI.find((k) => k.id === pId)
                    return (
                      <span key={pId} className="rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-primary-950/60 dark:text-primary-300">
                        {cat?.label || pId}
                      </span>
                    )
                  })}
                  {item.potensi.length > 3 && (
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-dark-surface-1 dark:text-gray-400">
                      +{item.potensi.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('siswa-detail', item.id)}
              className="mt-4 flex min-h-10 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] hover:border-primary/50 transition"
            >
              Lihat Profil & Rapor Lengkap
            </motion.button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-white/40 p-8 text-center text-sm text-[var(--text-muted)] dark:bg-dark-surface-2">
          {query ? `Tidak ada siswa yang cocok dengan pencarian "${query}".` : 'Belum ada data siswa di kelas ini.'}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <StudentForm
            kelasId={activeKelasId}
            initialData={editingSiswa}
            nextAbsenNumber={siswa.length + 1}
            onClose={() => { setShowForm(false); setEditingSiswa(null); }}
          />
        )}
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
  kelasId,
  initialData,
  nextAbsenNumber,
  onClose,
}: {
  kelasId: string
  initialData?: Siswa | null
  nextAbsenNumber: number
  onClose: () => void
}) {
  const { notify } = useStore()
  const [form, setForm] = useState({
    nama: initialData?.nama || '',
    nomorAbsen: initialData?.nomorAbsen || nextAbsenNumber,
    jenisKelamin: initialData?.jenisKelamin || 'L',
    tempatLahir: initialData?.tempatLahir || '',
    tanggalLahir: initialData?.tanggalLahir || '',
    nisn: initialData?.nisn || '',
    nis: initialData?.nis || '',
    namaAyah: initialData?.namaAyah || '',
    namaIbu: initialData?.namaIbu || '',
    teleponOrtu: initialData?.teleponOrtu || '',
    alamat: initialData?.alamat || '',
  })

  async function save() {
    if (!form.nama.trim()) {
      notify('Nama lengkap wajib diisi.', 'error')
      return
    }

    if (initialData) {
      await updateSiswa(initialData.id, {
        nama: form.nama.trim(),
        nomorAbsen: Number(form.nomorAbsen),
        jenisKelamin: form.jenisKelamin as 'L' | 'P',
        tempatLahir: form.tempatLahir.trim() || undefined,
        tanggalLahir: form.tanggalLahir || undefined,
        nisn: form.nisn.trim() || undefined,
        nis: form.nis.trim() || undefined,
        teleponOrtu: form.teleponOrtu.trim() || undefined,
        namaAyah: form.namaAyah.trim() || undefined,
        namaIbu: form.namaIbu.trim() || undefined,
        alamat: form.alamat.trim() || undefined,
      })
      notify(`Data siswa "${form.nama.trim()}" berhasil diperbarui.`)
    } else {
      const newSiswa: Siswa = {
        id: generateId(),
        kelasId: kelasId,
        nama: form.nama.trim(),
        nisn: form.nisn.trim() || undefined,
        nis: form.nis.trim() || undefined,
        nomorAbsen: Number(form.nomorAbsen),
        jenisKelamin: form.jenisKelamin as 'L' | 'P',
        tempatLahir: form.tempatLahir.trim() || undefined,
        tanggalLahir: form.tanggalLahir || undefined,
        teleponOrtu: form.teleponOrtu.trim() || undefined,
        namaAyah: form.namaAyah.trim() || undefined,
        namaIbu: form.namaIbu.trim() || undefined,
        alamat: form.alamat.trim() || undefined,
        potensi: [],
        aktif: true,
        createdAt: new Date().toISOString(),
      }
      await addSiswa(newSiswa)
      notify(`Siswa "${newSiswa.nama}" berhasil ditambahkan.`)
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
            <Input label="Tempat Lahir" value={form.tempatLahir} onChange={(tempatLahir) => setForm({ ...form, tempatLahir })} placeholder="Contoh: Majalengka" />
            <Input label="Tanggal Lahir" type="date" value={form.tanggalLahir} onChange={(tanggalLahir) => setForm({ ...form, tanggalLahir })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="NISN" value={form.nisn} onChange={(nisn) => setForm({ ...form, nisn })} />
            <Input label="NIS" value={form.nis} onChange={(nis) => setForm({ ...form, nis })} />
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
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="min-h-11 flex-1 rounded-xl border border-[var(--border)] font-semibold hover:bg-gray-50 dark:hover:bg-dark-surface-1 dark:text-gray-100">Batal</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={onConfirm} className="min-h-11 flex-1 rounded-xl bg-red-600 font-semibold text-white shadow-md hover:bg-red-700">Ya, Hapus</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-2 dark:text-gray-100" />
    </label>
  )
}

export function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 font-heading text-lg font-bold text-primary">{initials || '?'}</div>
}
