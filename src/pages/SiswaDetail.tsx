import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Compass,
  Award,
  Loader2,
  RefreshCw,
  UserCheck,
} from 'lucide-react'
import {
  useSiswaList,
  useNilaiList,
  useMataPelajaranList,
  useAbsensiList,
  useCatatanList,
  useAnalisisPsikologis,
  updateSiswa,
  deleteSiswaCascade,
  saveAnalisisPsikologis,
  addCatatan,
  updateCatatan,
  deleteCatatan,
  updateAbsensiRecord,
  addAbsensiRecord,
  generateId,
  KATEGORI_POTENSI,
} from '../db/firestore'
import { deleteDoc, doc } from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { Avatar, StudentForm, ConfirmDeleteModal } from './SiswaList'
import { synthesizePsychologicalProfile } from '../utils/psychologyEngine'
import { generateStudentPsychologicalProfileAI } from '../utils/aiService'
import { formatTTL } from '../utils/formatters'

const tabs = [
  { id: 'akademis', label: 'Akademis', icon: BookOpen },
  { id: 'absensi', label: 'Absensi', icon: CalendarDays },
  { id: 'psikologis', label: 'Karakter', icon: Compass },
  { id: 'potensi', label: 'Potensi', icon: Award },
  { id: 'catatan', label: 'Catatan', icon: MessageSquare },
] as const

type TabId = (typeof tabs)[number]['id']

export function SiswaDetail() {
  const { selectedSiswaId, navigate, notify } = useStore()
  const { activeKelasId } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('akademis')
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [note, setNote] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Absensi Editing States
  const [editingAbsensiId, setEditingAbsensiId] = useState<string | null>(null)
  const [editingAbsensiJawaban, setEditingAbsensiJawaban] = useState('')
  const [isAddingAbsensi, setIsAddingAbsensi] = useState(false)
  const [newAbsensiDate, setNewAbsensiDate] = useState(new Date().toISOString().slice(0, 10))
  const [newAbsensiStatus, setNewAbsensiStatus] = useState<'H' | 'I' | 'S' | 'A'>('H')
  const [newAbsensiJawaban, setNewAbsensiJawaban] = useState('')

  const { siswa: allSiswa } = useSiswaList(activeKelasId)
  const siswa = allSiswa.find((s) => s.id === selectedSiswaId)
  const { nilai } = useNilaiList(activeKelasId, selectedSiswaId || undefined)
  const { mapel } = useMataPelajaranList(activeKelasId)
  const { records: allAbsensi } = useAbsensiList(activeKelasId)
  const absensi = useMemo(
    () => allAbsensi.filter((a) => a.siswaId === selectedSiswaId),
    [allAbsensi, selectedSiswaId]
  )
  const { catatan } = useCatatanList(activeKelasId, selectedSiswaId || undefined)
  const savedAI = useAnalisisPsikologis(activeKelasId, selectedSiswaId || undefined)

  // Synthesize Psychological Profile
  const profileAI = useMemo(() => {
    if (!siswa) return null
    if (savedAI) {
      return {
        karakterUtama: savedAI.karakterUtama,
        narasiKarakter: savedAI.narasiKarakter,
        saranPendekatan: savedAI.saranPendekatan,
        rekomendasiBakat: savedAI.rekomendasiBakat,
        totalRespon: absensi.filter((a) => a.jawabanSiswa).length,
        updatedAt: savedAI.updatedAt,
      }
    }
    return synthesizePsychologicalProfile(siswa.nama, absensi, nilai, catatan)
  }, [siswa, absensi, nilai, catatan, savedAI])

  async function handleGenerateAI() {
    if (!siswa) return
    setIsGeneratingAI(true)
    notify('Menganalisis data karakteristik siswa...', 'info')
    try {
      const generated = await generateStudentPsychologicalProfileAI(siswa.nama, absensi, nilai, catatan)
      await saveAnalisisPsikologis({
        ...generated,
        id: savedAI?.id || generateId(),
        kelasId: activeKelasId,
        siswaId: siswa.id,
        updatedAt: new Date().toISOString().slice(0, 10),
      })
      notify(`Analisis karakteristik ${siswa.nama} berhasil diperbarui.`, 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal memproses analisis karakteristik.', 'error')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  if (!siswa) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-6 text-sm text-[var(--text-muted)]">
        Siswa tidak ditemukan.
      </div>
    )
  }

  async function handleDelete() {
    try {
      await deleteSiswaCascade(siswa!.id, activeKelasId)
      notify('Data siswa berhasil dihapus.', 'info')
      navigate('siswa')
    } catch (err: any) {
      notify(err.message || 'Gagal menghapus siswa.', 'error')
    }
  }

  async function togglePotensi(id: string) {
    const isRemove = siswa!.potensi.includes(id)
    const next = isRemove ? siswa!.potensi.filter((item) => item !== id) : [...siswa!.potensi, id]
    await updateSiswa(siswa!.id, { potensi: next })
    const label = KATEGORI_POTENSI.find((k) => k.id === id)?.label
    notify(isRemove ? `Potensi "${label}" dicabut.` : `Potensi "${label}" ditambahkan.`, 'info')
  }

  async function addNote() {
    if (!note.trim()) return
    await addCatatan({
      id: generateId(),
      kelasId: activeKelasId,
      siswaId: siswa!.id,
      tanggal: new Date().toISOString().slice(0, 10),
      isi: note.trim(),
    })
    notify('Catatan perkembangan berhasil ditambahkan.')
    setNote('')
  }

  async function saveEditedNote(id: string) {
    if (!editingNoteText.trim()) return
    await updateCatatan(id, editingNoteText.trim())
    notify('Catatan perkembangan diperbarui.')
    setEditingNoteId(null)
    setEditingNoteText('')
  }

  async function deleteNote(id: string) {
    if (!confirm('Hapus catatan perkembangan ini?')) return
    await deleteCatatan(id)
    notify('Catatan berhasil dihapus.', 'info')
  }

  async function updateAbsensiStatus(id: string, newStatus: 'H' | 'I' | 'S' | 'A') {
    await updateAbsensiRecord(id, { status: newStatus })
    notify(`Status presensi diubah ke ${newStatus}.`, 'success')
  }

  async function saveEditedAbsensiJawaban(id: string) {
    await updateAbsensiRecord(id, { jawabanSiswa: editingAbsensiJawaban.trim() || undefined })
    notify('Respon presensi diperbarui.', 'success')
    setEditingAbsensiId(null)
    setEditingAbsensiJawaban('')
  }

  async function deleteAbsensiRecord(id: string) {
    if (!confirm('Hapus presensi pada tanggal ini?')) return
    await deleteDoc(doc(firestore, 'absensi', id))
    notify('Presensi tanggal ini dihapus.', 'info')
  }

  async function handleAddOrUpdateAbsensiDate() {
    if (!newAbsensiDate) return
    const existing = absensi.find((a) => a.tanggal === newAbsensiDate)
    if (existing) {
      await updateAbsensiRecord(existing.id, {
        status: newAbsensiStatus,
        jawabanSiswa: newAbsensiJawaban.trim() || undefined,
      })
      notify(`Presensi tanggal ${newAbsensiDate} diperbarui.`, 'success')
    } else {
      await addAbsensiRecord({
        id: generateId(),
        kelasId: activeKelasId,
        siswaId: siswa!.id,
        tanggal: newAbsensiDate,
        status: newAbsensiStatus,
        jawabanSiswa: newAbsensiJawaban.trim() || undefined,
        pertanyaanHariIni: 'Presensi Harian',
      })
      notify(`Presensi tanggal ${newAbsensiDate} dicatat.`, 'success')
    }
    setIsAddingAbsensi(false)
    setNewAbsensiJawaban('')
  }

  return (
    <section className="space-y-5">
      {/* Back Button */}
      <button
        onClick={() => navigate('siswa')}
        className="flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Daftar Siswa</span>
      </button>

      {/* Student Profile Card */}
      <header className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={siswa.nama} />
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {siswa.nama}
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Absen #{siswa.nomorAbsen} &bull; {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </p>
              {(siswa.tempatLahir || siswa.tanggalLahir) && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  TTL: {formatTTL(siswa.tempatLahir, siswa.tanggalLahir)}
                </p>
              )}
              <p className="text-xs font-medium text-primary mt-0.5">
                {siswa.nisn ? `NISN: ${siswa.nisn}` : 'NISN: -'} &bull; {siswa.nis ? `NIS: ${siswa.nis}` : 'NIS: -'}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Orang tua: {siswa.namaAyah || siswa.namaIbu || '-'} &bull; {siswa.teleponOrtu || '-'}
              </p>
              {siswa.alamat && <p className="text-xs text-[var(--text-muted)] mt-0.5">Alamat: {siswa.alamat}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors"
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              className="flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100/50 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 transition-colors"
            >
              <Trash2 size={14} />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </header>

      {/* Edit & Delete Modals */}
      <AnimatePresence>
        {isEditing && (
          <StudentForm
            kelasId={activeKelasId}
            initialData={siswa}
            onClose={() => setIsEditing(false)}
            nextAbsenNumber={siswa.nomorAbsen}
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

      {/* Segmented Tabs Navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab: Akademis */}
      {activeTab === 'akademis' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {mapel.map((m) => {
            const list = nilai.filter((n) => n.mapelId === m.id)
            const avg = list.length
              ? Math.round(list.reduce((sum, n) => sum + n.nilai, 0) / list.length)
              : 0
            return (
              <div
                key={m.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <p className="font-heading text-sm font-bold text-[var(--text-primary)]">{m.nama}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Rata-rata: <span className="font-semibold text-primary">{avg || '-'}</span> &bull; {list.length} nilai tercatat
                </p>
              </div>
            )
          })}
          {!mapel.length && <Empty text="Belum ada data mata pelajaran." />}
        </div>
      )}

      {/* Tab: Absensi */}
      {activeTab === 'absensi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {(['H', 'I', 'S', 'A'] as const).map((status) => {
              const count = absensi.filter((a) => a.status === status).length
              return (
                <div
                  key={status}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-center"
                >
                  <p className="font-heading text-xl font-bold text-[var(--text-primary)]">{count}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    {status === 'H' ? 'Hadir' : status === 'I' ? 'Izin' : status === 'S' ? 'Sakit' : 'Alpa'}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-[var(--text-primary)]">
                  Riwayat Presensi Siswa
                </h3>
              </div>
              <button
                onClick={() => setIsAddingAbsensi(!isAddingAbsensi)}
                className="flex min-h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
              >
                <Plus size={14} />
                <span>{isAddingAbsensi ? 'Batal' : 'Catat Presensi Tanggal Lain'}</span>
              </button>
            </div>

            {/* Add/Edit Attendance Form */}
            {isAddingAbsensi && (
              <div className="rounded-lg border border-primary/20 bg-primary-50/40 dark:bg-primary-950/20 p-3.5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                      Pilih Tanggal:
                    </label>
                    <input
                      type="date"
                      value={newAbsensiDate}
                      onChange={(e) => setNewAbsensiDate(e.target.value)}
                      className="w-full min-h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                      Status:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['H', 'I', 'S', 'A'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewAbsensiStatus(st)}
                          className={`min-h-9 rounded-md text-xs font-bold transition-colors ${
                            newAbsensiStatus === st
                              ? st === 'H'
                                ? 'bg-emerald-600 text-white'
                                : st === 'I'
                                ? 'bg-blue-600 text-white'
                                : st === 'S'
                                ? 'bg-amber-600 text-white'
                                : 'bg-red-600 text-white'
                              : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  value={newAbsensiJawaban}
                  onChange={(e) => setNewAbsensiJawaban(e.target.value)}
                  placeholder="Respon siswa (opsional)..."
                  className="min-h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
                />

                <button
                  type="button"
                  onClick={handleAddOrUpdateAbsensiDate}
                  className="px-4 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                >
                  Simpan Presensi
                </button>
              </div>
            )}

            {/* Attendance Logs List */}
            <div className="divide-y divide-[var(--border)]">
              {absensi.map((a) => (
                <div key={a.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{a.tanggal}</p>
                    <div className="flex items-center gap-1">
                      {(['H', 'I', 'S', 'A'] as const).map((st) => {
                        const isActive = a.status === st
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateAbsensiStatus(a.id, st)}
                            className={`h-6 w-6 rounded text-[10px] font-bold transition-colors ${
                              isActive
                                ? st === 'H'
                                  ? 'bg-emerald-600 text-white'
                                  : st === 'I'
                                  ? 'bg-blue-600 text-white'
                                  : st === 'S'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-red-600 text-white'
                                : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-primary/40'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => deleteAbsensiRecord(a.id)}
                        className="ml-1 p-1 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Student Answer */}
                  {editingAbsensiId === a.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editingAbsensiJawaban}
                        onChange={(e) => setEditingAbsensiJawaban(e.target.value)}
                        className="min-h-8 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
                        placeholder="Sunting respon..."
                      />
                      <button
                        type="button"
                        onClick={() => saveEditedAbsensiJawaban(a.id)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAbsensiId(null)}
                        className="px-2.5 py-1 rounded-md border border-[var(--border)] text-xs text-[var(--text-muted)]"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] truncate">
                        Respon: "{a.jawabanSiswa || 'Tidak ada respon tersimpan'}"
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAbsensiId(a.id)
                          setEditingAbsensiJawaban(a.jawabanSiswa || '')
                        }}
                        className="text-[11px] font-medium text-primary hover:underline ml-2 shrink-0"
                      >
                        Sunting
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!absensi.length && <p className="text-xs text-[var(--text-muted)] py-2">Belum ada riwayat presensi.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Karakter / Profil Psikologis */}
      {activeTab === 'psikologis' && profileAI && (
        <div className="space-y-4">
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Compass size={18} />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">
                    Catatan Perkembangan Karakter Siswa
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Observasi harian dan {profileAI.totalRespon} respon presensi
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>{isGeneratingAI ? 'Menyusun Catatan...' : 'Analisis Ulang Karakter'}</span>
              </button>
            </div>

            {/* Dominant Traits */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Karakter Dominan:</p>
              <div className="flex flex-wrap gap-1.5">
                {profileAI.karakterUtama.map((trait) => (
                  <span
                    key={trait}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 text-primary px-2.5 py-1 text-xs font-semibold dark:bg-primary-950/60 dark:text-primary-300"
                  >
                    <UserCheck size={13} />
                    <span>{trait}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Narrative Story */}
            <div className="rounded-lg bg-[var(--surface)] p-4 border border-[var(--border)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Ulasan Karakter & Keseharian Siswa:
              </h3>
              <p className="text-xs leading-relaxed text-[var(--text-primary)] whitespace-pre-line">
                {profileAI.narasiKarakter}
              </p>
            </div>

            {/* Recommendations */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[var(--surface)] p-3.5 border border-[var(--border)]">
                <div className="flex items-center gap-1.5 text-primary font-bold text-xs mb-1.5">
                  <Compass size={15} />
                  <span>Saran Pendekatan:</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {profileAI.saranPendekatan}
                </p>
              </div>

              <div className="rounded-lg bg-[var(--surface)] p-3.5 border border-[var(--border)]">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs mb-1.5">
                  <Award size={15} />
                  <span>Rekomendasi Bakat:</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {profileAI.rekomendasiBakat}
                </p>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Tab: Potensi */}
      {activeTab === 'potensi' && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {KATEGORI_POTENSI.map((item) => {
            const isSelected = siswa.potensi.includes(item.id)
            return (
              <button
                key={item.id}
                onClick={() => togglePotensi(item.id)}
                className={`min-h-11 rounded-lg border p-3 text-left text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary-50 text-primary shadow-sm dark:bg-primary-950/50 dark:text-primary-300'
                    : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-primary/40'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Tab: Catatan Guru */}
      {activeTab === 'catatan' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tulis catatan perkembangan atau observasi siswa..."
              className="min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
            />
            <button
              onClick={addNote}
              className="mt-2.5 flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
            >
              <Plus size={15} />
              <span>Tambah Catatan</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {catatan.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm"
              >
                {editingNoteId === c.id ? (
                  <div className="space-y-2.5">
                    <textarea
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      className="min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEditedNote(c.id)}
                        className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-600 transition-colors"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="rounded-md border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--surface)] transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-[var(--text-muted)]">{c.tanggal}</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingNoteId(c.id)
                            setEditingNoteText(c.isi)
                          }}
                          className="rounded p-1 text-[var(--text-muted)] hover:text-primary transition-colors"
                          title="Sunting"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteNote(c.id)}
                          className="rounded p-1 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-primary)]">{c.isi}</p>
                  </div>
                )}
              </div>
            ))}
            {!catatan.length && <Empty text="Belum ada catatan perkembangan siswa." />}
          </div>
        </div>
      )}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-6 text-center text-xs text-[var(--text-muted)]">
      {text}
    </div>
  )
}
