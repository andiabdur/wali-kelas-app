import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Calendar, CheckCircle2, CheckCheck, HelpCircle, Sparkles, MessageSquare } from 'lucide-react'
import { db, generateId, type Absensi as AbsensiRecord } from '../db/database'
import { useStore } from '../store/useStore'
import { CURRICULUM_PERTANYAAN_HARIAN, getPertanyaanForDay, type PertanyaanItem } from '../utils/psychologyEngine'

type Status = AbsensiRecord['status']

const statusMeta: Record<Status, { label: string; className: string }> = {
  H: { label: 'Hadir', className: 'bg-emerald-500 text-white border-emerald-600 shadow-sm' },
  I: { label: 'Izin', className: 'bg-blue-500 text-white border-blue-600 shadow-sm' },
  S: { label: 'Sakit', className: 'bg-amber-500 text-white border-amber-600 shadow-sm' },
  A: { label: 'Alfa', className: 'bg-red-500 text-white border-red-600 shadow-sm' },
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function Absensi() {
  const { notify } = useStore()
  const [tanggal, setTanggal] = useState(todayISO())
  const siswa = useLiveQuery(() => db.siswa.toArray(), [])?.filter((item) => item.aktif).sort((a, b) => a.nomorAbsen - b.nomorAbsen) ?? []
  const records = useLiveQuery(() => db.absensi.where('tanggal').equals(tanggal).toArray(), [tanggal]) ?? []
  
  const defaultQuestion = useMemo(() => getPertanyaanForDay(tanggal), [tanggal])
  const [selectedQuestion, setSelectedQuestion] = useState<PertanyaanItem>(defaultQuestion)
  const [customQuestionText, setCustomQuestionText] = useState('')

  const [draftStatus, setDraftStatus] = useState<Record<string, Status>>({})
  const [draftJawaban, setDraftJawaban] = useState<Record<string, string>>({})

  const activeQuestionText = customQuestionText.trim() || selectedQuestion.pertanyaan

  const valuesStatus = useMemo(() => {
    const fromDb = Object.fromEntries(records.map((item) => [item.siswaId, item.status])) as Record<string, Status>
    return { ...fromDb, ...draftStatus }
  }, [records, draftStatus])

  const valuesJawaban = useMemo(() => {
    const fromDb = Object.fromEntries(records.map((item) => [item.siswaId, item.jawabanSiswa || ''])) as Record<string, string>
    return { ...fromDb, ...draftJawaban }
  }, [records, draftJawaban])

  const filled = siswa.filter((item) => valuesStatus[item.id]).length

  function setStatus(siswaId: string, status: Status) {
    setDraftStatus((current) => ({ ...current, [siswaId]: status }))
  }

  function setJawaban(siswaId: string, jawaban: string) {
    setDraftJawaban((current) => ({ ...current, [siswaId]: jawaban }))
  }

  function setAllHadir() {
    setDraftStatus(Object.fromEntries(siswa.map((item) => [item.id, 'H' as Status])))
    notify('Semua siswa ditandai Hadir.', 'info')
  }

  async function save() {
    const rows = siswa
      .filter((item) => valuesStatus[item.id])
      .map((item) => ({
        siswaId: item.id,
        status: valuesStatus[item.id],
        pertanyaanHariIni: activeQuestionText,
        jawabanSiswa: valuesJawaban[item.id] || undefined,
        dimensiPsikologis: selectedQuestion.dimensi,
      }))

    await db.transaction('rw', db.absensi, async () => {
      for (const row of rows) {
        const existing = records.find((item) => item.siswaId === row.siswaId)
        if (existing) {
          await db.absensi.update(existing.id, {
            status: row.status,
            pertanyaanHariIni: row.pertanyaanHariIni,
            jawabanSiswa: row.jawabanSiswa,
            dimensiPsikologis: row.dimensiPsikologis,
          })
        } else {
          await db.absensi.add({
            id: generateId(),
            siswaId: row.siswaId,
            tanggal,
            status: row.status,
            pertanyaanHariIni: row.pertanyaanHariIni,
            jawabanSiswa: row.jawabanSiswa,
            dimensiPsikologis: row.dimensiPsikologis,
          })
        }
      }
    })
    notify(`Absensi & Respon Pertanyaan Harian tanggal ${tanggal} berhasil disimpan.`)
    setDraftStatus({})
    setDraftJawaban({})
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Absensi Interaktif</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Input Harian & Karakter Siswa</h1>
          <p className="mt-1 text-[var(--text-muted)]">Absen siswa sambil menanyakan pertanyaan harian untuk analisis psikologis AI.</p>
        </div>
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-white/70 px-4 dark:bg-dark-surface-2 focus-within:ring-2 focus-within:ring-primary/20 transition">
          <Calendar size={18} className="text-primary" />
          <input type="date" value={tanggal} onChange={(e) => { setTanggal(e.target.value); setDraftStatus({}); setDraftJawaban({}) }} className="bg-transparent text-base outline-none cursor-pointer" />
        </label>
      </div>

      {/* Interactive Question Banner */}
      <article className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary-50/70 via-white/80 to-accent-50/40 p-5 shadow-sm dark:bg-dark-surface-2 dark:from-dark-surface-2 dark:to-dark-surface-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles size={14} /> Pertanyaan Presensi Harian AI
              </span>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Dimensi: {selectedQuestion.dimensi}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-gray-100">
              "{activeQuestionText}"
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Kategori: {selectedQuestion.kategori} • Tanyakan pertanyaan ini saat memanggil nama siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedQuestion.id}
              onChange={(e) => {
                const found = CURRICULUM_PERTANYAAN_HARIAN.find((q) => q.id === e.target.value)
                if (found) {
                  setSelectedQuestion(found)
                  setCustomQuestionText('')
                }
              }}
              className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-semibold shadow-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-1"
            >
              {CURRICULUM_PERTANYAAN_HARIAN.map((q) => (
                <option key={q.id} value={q.id}>
                  Hari {q.hariKe}: {q.pertanyaan.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </article>

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-10 -mx-4 border-y border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 py-3 sm:mx-0 sm:rounded-2xl sm:border shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[var(--text-muted)]">Terisi {filled}/{siswa.length} siswa</p>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={setAllHadir}
              className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold hover:bg-gray-50 dark:bg-dark-surface-1"
            >
              <CheckCheck size={16} className="text-emerald-600" /> Tandai Semua Hadir
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={save}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md"
            >
              <CheckCircle2 size={18} /> Simpan Presensi & Respon
            </motion.button>
          </div>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid gap-3">
        {siswa.map((item) => {
          const currentStatus = valuesStatus[item.id]
          const isHadir = currentStatus === 'H'
          const currentJawaban = valuesJawaban[item.id] || ''

          return (
            <article key={item.id} className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 shadow-sm dark:bg-dark-surface-2 transition hover:shadow-md">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-heading text-lg font-bold">{item.nama}</p>
                  <p className="text-sm text-[var(--text-muted)]">No. Absen {item.nomorAbsen}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${currentStatus ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                  {currentStatus ? statusMeta[currentStatus].label : 'Belum Absen'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(statusMeta) as Status[]).map((status) => (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setStatus(item.id, status)}
                    className={`min-h-11 rounded-xl border text-sm font-extrabold transition-all ${
                      currentStatus === status
                        ? statusMeta[status].className
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-gray-300'
                    }`}
                  >
                    {status}
                  </motion.button>
                ))}
              </div>

              {/* Interactive Student Answer Section (Visible when Hadir) */}
              {isHadir && (
                <div className="mt-3.5 pt-3 border-t border-dashed border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <MessageSquare size={14} /> Jawaban Siswa untuk Pertanyaan Hari Ini:
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedQuestion.pilihan.map((p) => {
                      const isSelected = currentJawaban.toLowerCase() === p.label.toLowerCase()
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setJawaban(item.id, p.label)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            isSelected
                              ? 'border-primary bg-primary text-white shadow-sm'
                              : 'border-[var(--border)] bg-white text-[var(--text-primary)] hover:border-gray-300 dark:bg-dark-surface-1'
                          }`}
                        >
                          {p.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={currentJawaban}
                      onChange={(e) => setJawaban(item.id, e.target.value)}
                      placeholder="Atau ketik jawaban khusus siswa..."
                      className="min-h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface-1"
                    />
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
