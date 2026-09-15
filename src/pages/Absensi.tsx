import { useEffect, useMemo, useState } from 'react'
import { Calendar, CheckCircle2, CheckCheck, MessageSquare } from 'lucide-react'
import {
  useSiswaList,
  useAbsensiList,
  batchSaveAbsensi,
  type Absensi as AbsensiRecord,
} from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { getActiveCurriculum, getPertanyaanForDay } from '../utils/psychologyEngine'

type Status = AbsensiRecord['status']

const statusMeta: Record<Status, { label: string; activeClass: string }> = {
  H: { label: 'Hadir', activeClass: 'bg-emerald-600 text-white border-emerald-700 shadow-sm' },
  I: { label: 'Izin', activeClass: 'bg-blue-600 text-white border-blue-700 shadow-sm' },
  S: { label: 'Sakit', activeClass: 'bg-amber-600 text-white border-amber-700 shadow-sm' },
  A: { label: 'Alpa', activeClass: 'bg-red-600 text-white border-red-700 shadow-sm' },
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function Absensi() {
  const { notify } = useStore()
  const { activeKelasId } = useAuth()
  const [tanggal, setTanggal] = useState(todayISO())
  const { siswa: allSiswa } = useSiswaList(activeKelasId)
  const siswa = allSiswa.filter((item) => item.aktif)
  const { records } = useAbsensiList(activeKelasId, tanggal)

  const [curriculumVersion, setCurriculumVersion] = useState(0)

  useEffect(() => {
    function handleUpdate() {
      setCurriculumVersion((v) => v + 1)
    }
    window.addEventListener('storage', handleUpdate)
    return () => window.removeEventListener('storage', handleUpdate)
  }, [])

  const activeCurriculum = useMemo(() => getActiveCurriculum(), [tanggal, curriculumVersion])
  const defaultQuestion = useMemo(() => getPertanyaanForDay(tanggal), [tanggal, curriculumVersion])
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('')
  const [customQuestionText, setCustomQuestionText] = useState('')

  const selectedQuestion = useMemo(() => {
    return activeCurriculum.find((q) => q.id === selectedQuestionId) || defaultQuestion
  }, [activeCurriculum, selectedQuestionId, defaultQuestion])

  const [draftStatus, setDraftStatus] = useState<Record<string, Status>>({})
  const [draftJawaban, setDraftJawaban] = useState<Record<string, string>>({})

  const activeQuestionText = customQuestionText.trim() || selectedQuestion.pertanyaan

  const valuesStatus = useMemo(() => {
    const fromDb = Object.fromEntries(records.map((item) => [item.siswaId, item.status])) as Record<string, Status>
    return { ...fromDb, ...draftStatus }
  }, [records, draftStatus])

  const valuesJawaban = useMemo(() => {
    const fromDb = Object.fromEntries(
      records.map((item) => [item.siswaId, item.jawabanSiswa || ''])
    ) as Record<string, string>
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
    notify('Seluruh siswa ditandai Hadir.', 'info')
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

    try {
      await batchSaveAbsensi(activeKelasId, rows, tanggal, records)
      notify(`Presensi tanggal ${tanggal} tersimpan.`)
      setDraftStatus({})
      setDraftJawaban({})
    } catch (err: any) {
      notify(err.message || 'Gagal menyimpan presensi.', 'error')
    }
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Presensi Harian</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            Input Presensi Siswa
          </h1>
        </div>
        <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-medium text-[var(--text-primary)] cursor-pointer">
          <Calendar size={16} className="text-primary shrink-0" />
          <input
            type="date"
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value)
              setDraftStatus({})
              setDraftJawaban({})
            }}
            className="bg-transparent text-xs font-semibold outline-none cursor-pointer text-[var(--text-primary)]"
          />
        </label>
      </header>

      {/* Daily Question Selector */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <MessageSquare size={14} />
              <span>Pertanyaan Karakter Hari Ini</span>
            </div>
            <p className="font-heading text-base font-bold text-[var(--text-primary)]">
              "{activeQuestionText}"
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedQuestion.id}
              onChange={(e) => {
                setSelectedQuestionId(e.target.value)
                setCustomQuestionText('')
              }}
              className="min-h-9 w-full sm:w-72 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer truncate"
            >
              {activeCurriculum.map((q) => {
                const shortText = q.pertanyaan.length > 32 ? q.pertanyaan.slice(0, 32) + '...' : q.pertanyaan
                return (
                  <option key={q.id} value={q.id}>
                    Hari {q.hariKe}: {shortText}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </article>

      {/* Action Toolbar */}
      <div className="sticky top-0 z-10 -mx-3 sm:mx-0 border-y sm:border sm:rounded-xl border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 py-2.5 shadow-sm">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Terisi {filled} dari {siswa.length} siswa
          </p>
          <div className="flex gap-2">
            <button
              onClick={setAllHadir}
              className="flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors"
            >
              <CheckCheck size={15} className="text-emerald-600" />
              <span>Semua Hadir</span>
            </button>
            <button
              onClick={save}
              className="flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
            >
              <CheckCircle2 size={15} />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="grid gap-3">
        {siswa.map((item) => {
          const currentStatus = valuesStatus[item.id]
          const isHadir = currentStatus === 'H'
          const currentJawaban = valuesJawaban[item.id] || ''

          return (
            <article
              key={item.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-heading text-sm font-bold text-[var(--text-primary)]">{item.nama}</p>
                  <p className="text-xs text-[var(--text-muted)]">Absen #{item.nomorAbsen}</p>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    currentStatus
                      ? 'bg-primary-50 text-primary dark:bg-primary-900/40 dark:text-primary-300'
                      : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                  }`}
                >
                  {currentStatus ? statusMeta[currentStatus].label : 'Belum Terisi'}
                </span>
              </div>

              {/* Status Buttons: H, I, S, A */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(statusMeta) as Status[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatus(item.id, status)}
                    className={`min-h-10 rounded-md border text-xs font-bold transition-colors ${
                      currentStatus === status
                        ? statusMeta[status].activeClass
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-primary/40'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Child Response Section (When Present) */}
              {isHadir && (
                <div className="mt-3 pt-2.5 border-t border-[var(--border)] space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)]">
                    Respon Pertanyaan Siswa:
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedQuestion.pilihan.map((p) => {
                      const isSelected = currentJawaban.toLowerCase() === p.label.toLowerCase()
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setJawaban(item.id, p.label)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-white shadow-sm'
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-primary/40'
                          }`}
                        >
                          {p.label}
                        </button>
                      )
                    })}
                  </div>

                  <input
                    value={currentJawaban}
                    onChange={(e) => setJawaban(item.id, e.target.value)}
                    placeholder="Atau masukkan respon siswa..."
                    className="min-h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
                  />
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
