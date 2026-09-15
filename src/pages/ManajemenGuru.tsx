import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  ExternalLink,
  Shield,
  BookOpen,
} from 'lucide-react'
import {
  useTeachersList,
  useAllKelas,
  useAllSiswaGlobal,
  createTeacherAccount,
  updateTeacherAccount,
  deleteTeacherAccount,
  type UserProfile,
  type Kelas,
} from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'

export function ManajemenGuru() {
  const { navigate, notify } = useStore()
  const { setActiveKelasId, role } = useAuth()
  const { teachers, loading: loadingTeachers } = useTeachersList()
  const { list: allKelas } = useAllKelas()
  const { allSiswa } = useAllSiswaGlobal()

  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null)
  const [deletingTeacher, setDeletingTeacher] = useState<UserProfile | null>(null)

  // Filter teachers by query (name, email, nip, class name)
  const filteredTeachers = teachers.filter((t) => {
    const q = query.toLowerCase()
    const matchName = t.nama.toLowerCase().includes(q)
    const matchEmail = t.email.toLowerCase().includes(q)
    const matchNip = t.nip ? t.nip.toLowerCase().includes(q) : false
    const assignedKelas = allKelas.find((k) => k.id === t.kelasId)
    const matchKelas = assignedKelas ? assignedKelas.nama.toLowerCase().includes(q) : false
    return matchName || matchEmail || matchNip || matchKelas
  })

  // Quick navigation into class
  const handleOpenClass = (kelasId?: string) => {
    if (!kelasId) return
    setActiveKelasId(kelasId)
    navigate('siswa')
    notify(`Beralih ke tampilan ${allKelas.find((k) => k.id === kelasId)?.nama || kelasId}.`, 'info')
  }

  // Delete teacher handler
  const handleDelete = async (teacher: UserProfile) => {
    try {
      await deleteTeacherAccount(teacher.uid, teacher.kelasId)
      notify(`Akun guru "${teacher.nama}" berhasil dihapus.`, 'info')
    } catch (err: any) {
      notify(err.message || 'Gagal menghapus akun guru.', 'error')
    } finally {
      setDeletingTeacher(null)
    }
  }

  if (role !== 'admin') {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-8 text-center text-xs text-[var(--text-muted)]">
        Akses dibatasi. Halaman ini hanya dapat diakses oleh Administrator Sekolah.
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Tenaga Pendidik</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            Manajemen Guru & Wali Kelas
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Tambah Guru Baru</span>
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--text-muted)]">Total Guru Terdaftar</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Shield size={16} />
            </div>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {teachers.length} Guru
          </p>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--text-muted)]">Kelas Terdaftar</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <GraduationCap size={16} />
            </div>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {allKelas.length} Kelas
          </p>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--text-muted)]">Total Siswa Terdaftar</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {allSiswa.length} Siswa
          </p>
        </article>
      </div>

      {/* Search Bar */}
      <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
        <Search size={18} className="text-[var(--text-muted)] shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama guru, email, NIP, atau kelas..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)] text-[var(--text-primary)]"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </label>

      {/* Teachers Grid */}
      {loadingTeachers ? (
        <div className="flex items-center justify-center py-12 text-xs text-[var(--text-muted)]">
          <Loader2 size={24} className="animate-spin text-primary mr-2" />
          <span>Memuat data guru...</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTeachers.map((t) => {
            const assignedKelas = allKelas.find((k) => k.id === t.kelasId)
            const classStudentCount = t.kelasId
              ? allSiswa.filter((s) => s.kelasId === t.kelasId && s.aktif).length
              : 0

            return (
              <div
                key={t.uid}
                className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-xs transition-colors hover:border-primary/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={t.nama} />
                      <div className="overflow-hidden">
                        <h2 className="font-heading text-base font-bold text-[var(--text-primary)] truncate">
                          {t.nama}
                        </h2>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {t.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setEditingTeacher(t)}
                        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        title="Edit Data Guru"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingTeacher(t)}
                        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Hapus Akun Guru"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Detail Info */}
                  <div className="mt-3.5 space-y-1.5 border-t border-[var(--border)] pt-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">NIP:</span>
                      <span className="font-medium text-[var(--text-primary)]">{t.nip || 'Belum diisi'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Kelas Binaan:</span>
                      {assignedKelas ? (
                        <span className="rounded bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary-950/50 dark:text-primary-300">
                          {assignedKelas.nama}
                        </span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          Belum Ditugaskan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Jumlah Siswa Aktif:</span>
                      <span className="font-medium text-[var(--text-primary)]">{classStudentCount} Siswa</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-2 border-t border-[var(--border)] flex gap-2">
                  {t.kelasId ? (
                    <button
                      onClick={() => handleOpenClass(t.kelasId)}
                      className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors cursor-pointer"
                    >
                      <ExternalLink size={13} className="text-primary" />
                      <span>Lihat Ruang Kelas</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingTeacher(t)}
                      className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <span>Tugaskan ke Kelas</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loadingTeachers && filteredTeachers.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-8 text-center text-xs text-[var(--text-muted)]">
          {query ? `Tidak ditemukan guru yang cocok dengan pencarian "${query}".` : 'Belum ada data guru terdaftar.'}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddTeacherModal
            allKelas={allKelas}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => setShowAddModal(false)}
          />
        )}
        {editingTeacher && (
          <EditTeacherModal
            teacher={editingTeacher}
            allKelas={allKelas}
            onClose={() => setEditingTeacher(null)}
            onSuccess={() => setEditingTeacher(null)}
          />
        )}
        {deletingTeacher && (
          <ConfirmDeleteTeacherModal
            teacher={deletingTeacher}
            onConfirm={() => handleDelete(deletingTeacher)}
            onClose={() => setDeletingTeacher(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function AddTeacherModal({
  allKelas,
  onClose,
  onSuccess,
}: {
  allKelas: Kelas[]
  onClose: () => void
  onSuccess: () => void
}) {
  const { notify } = useStore()
  const [nama, setNama] = useState('')
  const [nip, setNip] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('WaliKelas2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [kelasSelection, setKelasSelection] = useState(allKelas[0]?.id || 'new_class')
  const [namaKelasBaru, setNamaKelasBaru] = useState('')
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim() || !email.trim() || !password.trim()) {
      setError('Silakan lengkapi nama, email, dan kata sandi.')
      return
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.')
      return
    }

    if (kelasSelection === 'new_class' && !namaKelasBaru.trim()) {
      setError('Silakan isi nama kelas baru yang akan dibuat.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await createTeacherAccount({
        email: email.trim(),
        password: password.trim(),
        nama: nama.trim(),
        nip: nip.trim() || undefined,
        kelasId: kelasSelection,
        namaKelasBaru: kelasSelection === 'new_class' ? namaKelasBaru.trim() : undefined,
        tahunAjaran,
      })

      notify(`Akun guru "${nama.trim()}" berhasil dibuat dan ditugaskan.`, 'success')
      onSuccess()
    } catch (err: any) {
      console.error('Create teacher error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('Alamat email sudah terdaftar. Silakan gunakan email lain.')
      } else if (err.code === 'auth/weak-password') {
        setError('Kata sandi terlalu lemah. Gunakan minimal 6 karakter kombinasi.')
      } else {
        setError(err.message || 'Gagal membuat akun guru. Pastikan perangkat terhubung internet.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/50 backdrop-blur-xs p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-xl bg-[var(--surface)] p-6 shadow-xl max-h-[90vh] overflow-y-auto border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus size={18} />
            </div>
            <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">
              Tambah Guru & Wali Kelas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle size={16} className="shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <label className="block">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Nama Lengkap & Gelar *</span>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso, S.Pd."
              required
              className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--text-primary)]">NIP (Nomor Induk Pegawai)</span>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Contoh: 19880214 201201 1 002"
              className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Email Akun *</span>
              <div className="mt-1 flex min-h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 focus-within:border-primary">
                <Mail size={15} className="text-[var(--text-muted)] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sdncijurey1.sch.id"
                  required
                  className="w-full bg-transparent text-xs outline-none text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Kata Sandi Awal *</span>
              <div className="mt-1 flex min-h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 focus-within:border-primary">
                <Lock size={15} className="text-[var(--text-muted)] shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  required
                  className="w-full bg-transparent text-xs outline-none text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>
          </div>

          <div className="border-t border-[var(--border)] pt-3.5 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Penugasan Kelas *</span>
              <select
                value={kelasSelection}
                onChange={(e) => setKelasSelection(e.target.value)}
                className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer"
              >
                {allKelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.tahunAjaran}) {k.namaWaliKelas ? `- Wali: ${k.namaWaliKelas}` : ''}
                  </option>
                ))}
                <option value="new_class">+ Buat Kelas Baru...</option>
              </select>
            </label>

            {kelasSelection === 'new_class' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Nama Kelas Baru *</span>
                  <input
                    type="text"
                    value={namaKelasBaru}
                    onChange={(e) => setNamaKelasBaru(e.target.value)}
                    placeholder="Contoh: Kelas IV"
                    required
                    className="mt-1 min-h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Tahun Ajaran</span>
                  <input
                    type="text"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    placeholder="2026/2027"
                    className="mt-1 min-h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-10 flex-1 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-10 flex-1 rounded-lg bg-primary text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan Akun...</span>
                </>
              ) : (
                <span>Simpan Guru Baru</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditTeacherModal({
  teacher,
  allKelas,
  onClose,
  onSuccess,
}: {
  teacher: UserProfile
  allKelas: Kelas[]
  onClose: () => void
  onSuccess: () => void
}) {
  const { notify } = useStore()
  const [nama, setNama] = useState(teacher.nama)
  const [nip, setNip] = useState(teacher.nip || '')
  const [kelasId, setKelasId] = useState(teacher.kelasId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) {
      notify('Nama guru wajib diisi.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      await updateTeacherAccount({
        uid: teacher.uid,
        nama: nama.trim(),
        nip: nip.trim() || undefined,
        kelasId,
        previousKelasId: teacher.kelasId,
      })
      notify(`Data guru "${nama.trim()}" berhasil diperbarui.`, 'success')
      onSuccess()
    } catch (err: any) {
      notify(err.message || 'Gagal memperbarui data guru.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/50 backdrop-blur-xs p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-xl border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">Edit Data Guru</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <label className="block">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Nama Lengkap & Gelar</span>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--text-primary)]">NIP (Nomor Induk Pegawai)</span>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Penugasan Kelas</span>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer"
            >
              <option value="">Belum Ditugaskan</option>
              {allKelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.tahunAjaran})
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-10 flex-1 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-10 flex-1 rounded-lg bg-primary text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Simpan Perubahan</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteTeacherModal({
  teacher,
  onConfirm,
  onClose,
}: {
  teacher: UserProfile
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-black/50 backdrop-blur-xs p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-xl border border-[var(--border)] text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle size={24} />
        </div>
        <h3 className="mt-3 font-heading text-lg font-bold text-[var(--text-primary)]">Hapus Akun Guru</h3>
        <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
          Apakah Anda yakin ingin menghapus akun guru <span className="font-semibold text-[var(--text-primary)]">"{teacher.nama}"</span>?
          Tindakan ini akan melepaskan penugasan wali kelas. Seluruh data siswa pada kelas binaan tetap tersimpan aman di sistem.
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="min-h-10 flex-1 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="min-h-10 flex-1 rounded-lg bg-red-600 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
          >
            Hapus Guru
          </button>
        </div>
      </div>
    </div>
  )
}

function AvatarInitials({ name }: { name: string }) {
  const parts = name.split(' ').filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
      {initials || 'G'}
    </div>
  )
}
