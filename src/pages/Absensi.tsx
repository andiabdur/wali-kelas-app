import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Calendar, CheckCircle2, CheckCheck } from 'lucide-react'
import { db, generateId, type Absensi as AbsensiRecord } from '../db/database'
import { useStore } from '../store/useStore'

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
  const [draft, setDraft] = useState<Record<string, Status>>({})

  const values = useMemo(() => {
    const fromDb = Object.fromEntries(records.map((item) => [item.siswaId, item.status])) as Record<string, Status>
    return { ...fromDb, ...draft }
  }, [records, draft])

  const filled = siswa.filter((item) => values[item.id]).length

  function setStatus(siswaId: string, status: Status) {
    setDraft((current) => ({ ...current, [siswaId]: status }))
  }

  function setAllHadir() {
    setDraft(Object.fromEntries(siswa.map((item) => [item.id, 'H' as Status])))
    notify('Semua siswa ditandai Hadir.', 'info')
  }

  async function save() {
    const rows = siswa
      .filter((item) => values[item.id])
      .map((item) => ({ siswaId: item.id, status: values[item.id] }))

    await db.transaction('rw', db.absensi, async () => {
      for (const row of rows) {
        const existing = records.find((item) => item.siswaId === row.siswaId)
        if (existing) {
          await db.absensi.update(existing.id, { status: row.status })
        } else {
          await db.absensi.add({ id: generateId(), siswaId: row.siswaId, tanggal, status: row.status })
        }
      }
    })
    notify(`Absensi tanggal ${tanggal} berhasil disimpan.`)
    setDraft({})
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Absensi</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Input Harian</h1>
          <p className="mt-1 text-[var(--text-muted)]">Tandai semua hadir, lalu koreksi siswa yang izin/sakit/alfa.</p>
        </div>
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-white/70 px-4 dark:bg-dark-surface-2 focus-within:ring-2 focus-within:ring-primary/20 transition">
          <Calendar size={18} className="text-primary" />
          <input type="date" value={tanggal} onChange={(e) => { setTanggal(e.target.value); setDraft({}) }} className="bg-transparent text-base outline-none cursor-pointer" />
        </label>
      </div>

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
              <CheckCircle2 size={18} /> Simpan Absensi
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {siswa.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 shadow-sm dark:bg-dark-surface-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-heading text-lg font-bold">{item.nama}</p>
                <p className="text-sm text-[var(--text-muted)]">No. {item.nomorAbsen}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${values[item.id] ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                {values[item.id] ? statusMeta[values[item.id]].label : 'Belum Absen'}
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
                    values[item.id] === status
                      ? statusMeta[status].className
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-gray-300'
                  }`}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
