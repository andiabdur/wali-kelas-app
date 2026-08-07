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
  { id: 'psikologis', label: 'Karakter AI', icon: Brain },
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
    notify('Menghubungi AI untuk menganalisis karakteristik siswa...', 'info')
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
      notify(`Analisis karakteristik AI untuk ${siswa.nama} berhasil diproses!`, 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal memproses analisis AI.', 'error')
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
            {(['H', 'I', 'S', 'A'] as const).map((status) => <Stat key={status} label={status} value={absensi.filter((a) => a.status === status).length} />)}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 dark:bg-dark-surface-2">
            <h3 className="font-heading text-base font-bold mb-3">Riwayat Presensi & Respon Pertanyaan Harian</h3>
            <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
              {absensi.map((a) => (
                <div key={a.id} className="flex flex-col gap-1 rounded-xl border border-[var(--border)] p-3 bg-[var(--surface)] text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{a.tanggal}</span>
                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary">Status: {a.status}</span>
                  </div>
                  {a.pertanyaanHariIni && (
                    <p className="text-xs text-[var(--text-muted)] italic">Pertanyaan: "{a.pertanyaanHariIni}"</p>
                  )}
                  {a.jawabanSiswa && (
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Jawaban: "{a.jawabanSiswa}"</p>
                  )}
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
                  <h2 className="font-heading text-xl font-bold">Analisis Karakteristik Siswa AI</h2>
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
                {isGeneratingAI ? 'Menyintesis AI...' : 'Generate / Refresh Analisis AI'}
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
