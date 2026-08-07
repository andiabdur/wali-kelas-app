import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, BookOpen, CalendarDays, Lightbulb, MessageSquare, Plus, Pencil, Trash2, Brain, Sparkles, UserCheck, Compass, Award, Loader2, RefreshCw } from 'lucide-react'
import { db, generateId, KATEGORI_POTENSI, type AnalisisPsikologis } from '../db/database'
import { useStore } from '../store/useStore'
import { Avatar, StudentForm, ConfirmDeleteModal } from './SiswaList'
import { synthesizePsychologicalProfile } from '../utils/psychologyEngine'
import { generateStudentPsychologicalProfileAI } from '../utils/aiService'

const tabs = [
  { id: 'akademis', label: 'Akademis', icon: BookOpen },
  { id: 'absensi', label: 'Absensi', icon: CalendarDays },
  { id: 'psikologis', label: 'Karakter', icon: Brain },
  { id: 'potensi', label: 'Potensi', icon: Lightbulb },
  { id: 'catatan', label: 'Catatan', icon: MessageSquare },
] as const

type TabId = (typeof tabs)[number]['id']

export function SiswaDetail() {
  const { selectedSiswaId, navigate, notify } = useStore()
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

  const siswa = useLiveQuery(() => selectedSiswaId ? db.siswa.get(selectedSiswaId) : undefined, [selectedSiswaId])
  const nilai = useLiveQuery(() => selectedSiswaId ? db.nilai.where('siswaId').equals(selectedSiswaId).toArray() : [], [selectedSiswaId]) ?? []
  const mapel = useLiveQuery(() => db.mataPelajaran.orderBy('urutan').toArray(), []) ?? []
  const absensi = useLiveQuery(() => selectedSiswaId ? db.absensi.where('siswaId').equals(selectedSiswaId).toArray() : [], [selectedSiswaId]) ?? []
  const catatan = useLiveQuery(() => selectedSiswaId ? db.catatan.where('siswaId').equals(selectedSiswaId).reverse().sortBy('tanggal') : [], [selectedSiswaId]) ?? []
  const savedAI = useLiveQuery(() => selectedSiswaId ? db.analisisPsikologis.where('siswaId').equals(selectedSiswaId).first() : undefined, [selectedSiswaId])

  // Synthesize AI Psychological Narrative Profile
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
      generated.siswaId = siswa.id
      
      const existing = await db.analisisPsikologis.where('siswaId').equals(siswa.id).first()
      if (existing) {
        await db.analisisPsikologis.update(existing.id, {
          karakterUtama: generated.karakterUtama,
          narasiKarakter: generated.narasiKarakter,
          saranPendekatan: generated.saranPendekatan,
          rekomendasiBakat: generated.rekomendasiBakat,
          updatedAt: generated.updatedAt,
        })
      } else {
        await db.analisisPsikologis.add(generated)
      }
      notify(`Analisis karakteristik ${siswa.nama} berhasil diproses!`, 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal memproses analisis karakteristik.', 'error')
    } finally {
      setIsGeneratingAI(false)
    }
  }

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

  async function saveEditedNote(id: string) {
    if (!editingNoteText.trim()) return
    await db.catatan.update(id, { isi: editingNoteText.trim() })
    notify('Catatan perkembangan berhasil diperbarui.')
    setEditingNoteId(null)
    setEditingNoteText('')
  }

  async function deleteNote(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return
    await db.catatan.delete(id)
    notify('Catatan berhasil dihapus.', 'info')
  }

  // Absensi Handler Functions
  async function updateAbsensiStatus(id: string, newStatus: 'H' | 'I' | 'S' | 'A') {
    await db.absensi.update(id, { status: newStatus })
    notify(`Status presensi diperbarui menjadi ${newStatus}.`, 'success')
  }

  async function saveEditedAbsensiJawaban(id: string) {
    await db.absensi.update(id, { jawabanSiswa: editingAbsensiJawaban.trim() || undefined })
    notify('Respon presensi siswa berhasil diperbarui.', 'success')
    setEditingAbsensiId(null)
    setEditingAbsensiJawaban('')
  }

  async function deleteAbsensiRecord(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus presensi tanggal ini?')) return
    await db.absensi.delete(id)
    notify('Presensi tanggal ini berhasil dihapus.', 'info')
  }

  async function handleAddOrUpdateAbsensiDate() {
    if (!newAbsensiDate) {
      notify('Pilih tanggal presensi.', 'info')
      return
    }
    const existing = absensi.find((a) => a.tanggal === newAbsensiDate)
    if (existing) {
      await db.absensi.update(existing.id, {
        status: newAbsensiStatus,
        jawabanSiswa: newAbsensiJawaban.trim() || undefined,
      })
      notify(`Presensi tanggal ${newAbsensiDate} berhasil diperbarui!`, 'success')
    } else {
      await db.absensi.add({
        id: generateId(),
        siswaId: siswa!.id,
        tanggal: newAbsensiDate,
        status: newAbsensiStatus,
        jawabanSiswa: newAbsensiJawaban.trim() || undefined,
        pertanyaanHariIni: 'Presensi Harian',
      })
      notify(`Presensi tanggal ${newAbsensiDate} berhasil ditambahkan!`, 'success')
    }
    setIsAddingAbsensi(false)
    setNewAbsensiJawaban('')
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
              className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1 dark:text-gray-100 dark:hover:bg-dark-surface-2"
            >
              <Pencil size={16} /> Edit Data
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDeleting(true)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100/50 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-900/50"
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
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {(['H', 'I', 'S', 'A'] as const).map((status) => (
              <Stat key={status} label={status} value={absensi.filter((a) => a.status === status).length} />
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 dark:bg-dark-surface-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-bold">Riwayat & Edit Presensi Siswa</h3>
                <p className="text-xs text-[var(--text-muted)]">Ubah status presensi (H/I/S/A), sunting respon siswa, atau catat presensi baru.</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingAbsensi(!isAddingAbsensi)}
                className="flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white shadow-sm"
              >
                <Plus size={16} /> {isAddingAbsensi ? 'Batal Tambah' : 'Catat / Edit Tanggal'}
              </motion.button>
            </div>

            {/* Add / Edit Date Presensi Form */}
            {isAddingAbsensi && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-primary/30 bg-primary-50/50 dark:bg-primary-950/40 p-4 space-y-3"
              >
                <p className="text-xs font-bold text-primary dark:text-primary-300">Catat atau Edit Presensi Manual per Tanggal:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Pilih Tanggal:</label>
                    <input
                      type="date"
                      value={newAbsensiDate}
                      onChange={(e) => setNewAbsensiDate(e.target.value)}
                      className="w-full min-h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-1 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Status Presensi:</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['H', 'I', 'S', 'A'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewAbsensiStatus(st)}
                          className={`min-h-10 rounded-lg text-xs font-extrabold transition ${
                            newAbsensiStatus === st
                              ? st === 'H' ? 'bg-emerald-600 text-white' : st === 'I' ? 'bg-blue-600 text-white' : st === 'S' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
                              : 'bg-white border border-[var(--border)] text-gray-700 dark:bg-dark-surface-1 dark:text-gray-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Jawaban / Respon Siswa (Opsional):</label>
                  <input
                    type="text"
                    value={newAbsensiJawaban}
                    onChange={(e) => setNewAbsensiJawaban(e.target.value)}
                    placeholder="Contoh: Pisang, Kaos Santai, Jepang..."
                    className="w-full min-h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-1 dark:text-gray-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAbsensi(false)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] bg-white dark:bg-dark-surface-1"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddOrUpdateAbsensiDate}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white shadow-sm"
                  >
                    Simpan Presensi
                  </button>
                </div>
              </motion.div>
            )}

            {/* Attendance History List with Inline Editing */}
            <div className="space-y-2.5 max-h-[450px] overflow-auto pr-1">
              {[...absensi].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).map((a) => (
                <div key={a.id} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3.5 bg-[var(--surface)] transition hover:shadow-sm text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold">
                      <CalendarDays size={16} className="text-primary" />
                      <span>{a.tanggal}</span>
                    </div>

                    {/* Quick Interactive Status Switcher (H, I, S, A) */}
                    <div className="flex items-center gap-1">
                      {(['H', 'I', 'S', 'A'] as const).map((st) => {
                        const isActive = a.status === st
                        let activeBg = 'bg-emerald-600 text-white font-extrabold shadow-sm'
                        if (st === 'I') activeBg = 'bg-blue-600 text-white font-extrabold shadow-sm'
                        if (st === 'S') activeBg = 'bg-amber-600 text-white font-extrabold shadow-sm'
                        if (st === 'A') activeBg = 'bg-red-600 text-white font-extrabold shadow-sm'

                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateAbsensiStatus(a.id, st)}
                            className={`h-7 w-7 rounded-md text-xs font-bold transition ${
                              isActive
                                ? activeBg
                                : 'border border-[var(--border)] bg-white text-gray-500 hover:bg-gray-100 dark:bg-dark-surface-1 dark:text-gray-400 dark:hover:bg-dark-surface-2'
                            }`}
                            title={`Ubah status ke ${st}`}
                          >
                            {st}
                          </button>
                        )
                      })}

                      <button
                        type="button"
                        onClick={() => deleteAbsensiRecord(a.id)}
                        className="ml-1 p-1 text-gray-400 hover:text-red-600 transition"
                        title="Hapus presensi tanggal ini"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {a.pertanyaanHariIni && (
                    <p className="text-xs text-[var(--text-muted)] italic">Pertanyaan: "{a.pertanyaanHariIni}"</p>
                  )}

                  {/* Respon Siswa Section */}
                  <div className="pt-1">
                    {editingAbsensiId === a.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editingAbsensiJawaban}
                          onChange={(e) => setEditingAbsensiJawaban(e.target.value)}
                          className="min-h-9 flex-1 rounded-lg border border-[var(--border)] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-1 dark:text-gray-100"
                          placeholder="Edit respon siswa..."
                        />
                        <button
                          type="button"
                          onClick={() => saveEditedAbsensiJawaban(a.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-sm"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAbsensiId(null)}
                          className="px-2 py-1.5 rounded-lg border border-[var(--border)] text-xs"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Jawaban: "{a.jawabanSiswa || 'Belum ada respon'}"
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAbsensiId(a.id)
                            setEditingAbsensiJawaban(a.jawabanSiswa || '')
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <Pencil size={12} /> Edit Respon
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!absensi.length && <p className="text-xs text-[var(--text-muted)]">Belum ada riwayat absensi.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'psikologis' && profileAI && (
        <div className="space-y-4">
          {/* AI Narrative Banner */}
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary-50/60 via-white/80 to-accent-50/30 p-6 shadow-sm dark:bg-dark-surface-2 dark:from-dark-surface-2 dark:to-dark-surface-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
                  <Brain size={22} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">Analisis Karakteristik Siswa</h2>
                  <p className="text-xs text-[var(--text-muted)]">Diperbarui: {profileAI.updatedAt} • Berdasarkan {profileAI.totalRespon} presensi interaktif</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white shadow-md disabled:opacity-50"
              >
                {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {isGeneratingAI ? 'Menyusun Analisis...' : 'Analisis Ulang Karakteristik'}
              </motion.button>
            </div>

            {/* Dominant Traits Badges */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Karakter Dominan Siswa:</p>
              <div className="flex flex-wrap gap-2">
                {profileAI.karakterUtama.map((trait) => (
                  <span key={trait} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3.5 py-1.5 text-xs font-bold shadow-sm dark:bg-emerald-950 dark:text-emerald-300">
                    <UserCheck size={14} /> {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Narrative Story */}
            <div className="rounded-2xl bg-white/90 p-5 shadow-inner border border-[var(--border)] dark:bg-dark-surface-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Profil Dynamics & Gambaran Karakter:</h3>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {profileAI.narasiKarakter}
              </p>
            </div>

            {/* Recommendation Cards */}
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="rounded-2xl bg-white/80 p-4 border border-[var(--border)] dark:bg-dark-surface-1">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1.5">
                  <Compass size={16} /> Saran Pendekatan Pembelajaran:
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {profileAI.saranPendekatan}
                </p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 border border-[var(--border)] dark:bg-dark-surface-1">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-1.5">
                  <Award size={16} /> Rekomendasi Pengembangan Bakat:
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {profileAI.rekomendasiBakat}
                </p>
              </div>
            </div>
          </div>
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
          
          <div className="space-y-3">
            {catatan.map((c) => (
              <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 dark:bg-dark-surface-2 transition hover:shadow-sm">
                {editingNoteId === c.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-1 dark:text-gray-100"
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveEditedNote(c.id)}
                        className="flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm"
                      >
                        Simpan Perubahan
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingNoteId(null)}
                        className="flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-1 dark:text-gray-100"
                      >
                        Batal
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">{c.tanggal}</p>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setEditingNoteId(c.id); setEditingNoteText(c.isi); }}
                          title="Edit Catatan"
                          className="rounded-lg p-1 text-gray-400 dark:text-gray-400 hover:bg-gray-100 hover:text-primary dark:hover:bg-dark-surface-1 dark:hover:text-primary transition"
                        >
                          <Pencil size={15} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteNote(c.id)}
                          title="Hapus Catatan"
                          className="rounded-lg p-1 text-gray-400 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition"
                        >
                          <Trash2 size={15} />
                        </motion.button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{c.isi}</p>
                  </div>
                )}
              </div>
            ))}
            {!catatan.length && <Empty text="Belum ada catatan perkembangan." />}
          </div>
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
