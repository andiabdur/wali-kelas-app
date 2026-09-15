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
      {/* Header */}
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Data Siswa</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            Daftar Siswa
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingSiswa(null)
            setShowForm(true)
          }}
          className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          <span>Tambah Siswa</span>
        </button>
      </header>

      {/* Search Input */}
      <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
        <Search size={18} className="text-[var(--text-muted)] shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama siswa..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)] text-[var(--text-primary)]"
        />
      </label>

      {/* Students Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm transition-colors hover:border-primary/30"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={item.nama} />
                  <div>
                    <h2
                      onClick={() => navigate('siswa-detail', item.id)}
                      className="font-heading text-base font-bold text-[var(--text-primary)] hover:text-primary cursor-pointer transition-colors line-clamp-1"
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
                    onClick={() => {
                      setEditingSiswa(item)
                      setShowForm(true)
                    }}
                    className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-colors"
                    title="Edit Siswa"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeletingSiswa(item)}
                    className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
                    title="Hapus Siswa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-3.5 space-y-1 border-t border-[var(--border)] pt-2.5 text-xs text-[var(--text-muted)]">
                {item.tanggalLahir && (
                  <p>
                    <span className="font-semibold text-[var(--text-primary)]">TTL:</span>{' '}
                    {formatTTL(item.tempatLahir, item.tanggalLahir)}
                  </p>
                )}
                {item.nisn && (
                  <p>
                    <span className="font-semibold text-[var(--text-primary)]">NISN:</span> {item.nisn}
                    {item.nis ? ` (${item.nis})` : ''}
                  </p>
                )}
                {item.teleponOrtu && (
                  <p>
                    <span className="font-semibold text-[var(--text-primary)]">Kontak Ortu:</span> {item.teleponOrtu}
                  </p>
                )}
              </div>

              {item.potensi && item.potensi.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.potensi.slice(0, 3).map((pId) => {
                    const cat = KATEGORI_POTENSI.find((k) => k.id === pId)
                    return (
                      <span
                        key={pId}
                        className="rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-primary-950/60 dark:text-primary-300"
                      >
                        {cat?.label || pId}
                      </span>
                    )
                  })}
                  {item.potensi.length > 3 && (
                    <span className="rounded-md bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                      +{item.potensi.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('siswa-detail', item.id)}
              className="mt-4 flex min-h-9 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors"
            >
              Lihat Profil & Riwayat
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-8 text-center text-xs text-[var(--text-muted)]">
          {query ? `Tidak ada siswa yang cocok dengan pencarian "${query}".` : 'Belum ada data siswa di kelas ini.'}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <StudentForm
            kelasId={activeKelasId}
            initialData={editingSiswa}
            nextAbsenNumber={siswa.length + 1}
            onClose={() => {
              setShowForm(false)
              setEditingSiswa(null)
            }}
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
    <div className="fixed inset-0 z-[60] flex items-end bg-black/50 backdrop-blur-sm p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-xl bg-[var(--surface)] p-6 shadow-xl max-h-[90vh] overflow-y-auto border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            {initialData ? 'Edit Data Siswa' : 'Tambah Siswa'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <Input label="Nama Lengkap *" value={form.nama} onChange={(nama) => setForm({ ...form, nama })} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nomor Absen *"
              type="number"
              value={String(form.nomorAbsen)}
              onChange={(nomorAbsen) => setForm({ ...form, nomorAbsen: Number(nomorAbsen) })}
            />
            <label className="block">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Jenis Kelamin</span>
              <select
                value={form.jenisKelamin}
                onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as 'L' | 'P' })}
                className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tempat Lahir"
              value={form.tempatLahir}
              onChange={(tempatLahir) => setForm({ ...form, tempatLahir })}
              placeholder="Majalengka"
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              value={form.tanggalLahir}
              onChange={(tanggalLahir) => setForm({ ...form, tanggalLahir })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="NISN" value={form.nisn} onChange={(nisn) => setForm({ ...form, nisn })} />
            <Input label="NIS" value={form.nis} onChange={(nis) => setForm({ ...form, nis })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Nama Ayah" value={form.namaAyah} onChange={(namaAyah) => setForm({ ...form, namaAyah })} />
            <Input label="Nama Ibu" value={form.namaIbu} onChange={(namaIbu) => setForm({ ...form, namaIbu })} />
          </div>

          <Input
            label="Telepon Orang Tua"
            value={form.teleponOrtu}
            onChange={(teleponOrtu) => setForm({ ...form, teleponOrtu })}
          />
          <Input label="Alamat Rumah" value={form.alamat} onChange={(alamat) => setForm({ ...form, alamat })} />
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="min-h-10 flex-1 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={save}
            className="min-h-10 flex-1 rounded-lg bg-primary text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
          >
            {initialData ? 'Simpan Perubahan' : 'Tambah Siswa'}
          </button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-[70] flex items-end bg-black/50 backdrop-blur-sm p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-xl border border-[var(--border)] text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle size={24} />
        </div>
        <h3 className="mt-3 font-heading text-lg font-bold text-[var(--text-primary)]">Hapus Data Siswa</h3>
        <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
          Apakah Anda yakin ingin menghapus <span className="font-semibold text-[var(--text-primary)]">"{studentName}"</span>?
          Seluruh data nilai, absensi, dan catatan siswa ini akan dibersihkan secara permanen.
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="min-h-10 flex-1 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="min-h-10 flex-1 rounded-lg bg-red-600 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Hapus Siswa
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
      />
    </label>
  )
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
      {initials || '?'}
    </div>
  )
}
