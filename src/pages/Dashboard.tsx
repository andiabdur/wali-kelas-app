import { useLiveQuery } from 'dexie-react-hooks'
import { AlertTriangle, CalendarCheck, ClipboardList, TrendingUp, Users } from 'lucide-react'
import { db, KATEGORI_POTENSI } from '../db/database'
import { getActiveStudents } from '../db/queries'
import { useStore } from '../store/useStore'
import { AttendanceBarChart, PotentialBars } from '../components/DashboardCharts'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function lastDays(count: number) {
  const days: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    days.push(date.toISOString().slice(0, 10))
  }
  return days
}

export function Dashboard() {
  const { navigate, kelasInfo } = useStore()
  const siswa = useLiveQuery(async () => getActiveStudents(await db.siswa.toArray()), []) ?? []
  const absensi = useLiveQuery(() => db.absensi.toArray(), []) ?? []
  const nilai = useLiveQuery(() => db.nilai.toArray(), []) ?? []

  const hariIni = todayISO()
  const absensiHariIni = absensi.filter((a) => a.tanggal === hariIni)
  const hadirHariIni = absensiHariIni.filter((a) => a.status === 'H').length
  const bulanIni = hariIni.slice(0, 7)
  const nilaiBulanIni = nilai.filter((n) => n.tanggal.startsWith(bulanIni))
  const rataNilai = nilaiBulanIni.length
    ? Math.round(nilaiBulanIni.reduce((sum, item) => sum + item.nilai, 0) / nilaiBulanIni.length)
    : 0

  const days = lastDays(14)
  const chartData = days.map((tanggal) => ({
    tanggal: tanggal.slice(8),
    hadir: absensi.filter((a) => a.tanggal === tanggal && a.status === 'H').length,
  }))

  const potentialData = KATEGORI_POTENSI.map((kategori) => ({
    label: kategori.label,
    value: siswa.filter((s) => s.potensi.includes(kategori.id)).length,
  })).filter((item) => item.value > 0)

  const siswaPerluPerhatian = siswa
    .map((anak) => {
      const records = absensi.filter((a) => a.siswaId === anak.id && a.tanggal.startsWith(bulanIni))
      const hadir = records.filter((a) => a.status === 'H').length
      const rate = records.length ? Math.round((hadir / records.length) * 100) : 100
      return { anak, rate }
    })
    .filter((item) => item.rate < 80)
    .slice(0, 5)

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {kelasInfo?.nama || 'Kelas SD'}
          </h1>
          <p className="mt-2 text-base text-[var(--text-muted)]">
            Pantau kondisi kelas hari ini dengan cepat dan rapi.
          </p>
        </div>
        <button
          onClick={() => navigate('absensi')}
          className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
        >
          Isi Absensi Hari Ini
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Users} label="Total Siswa" value={siswa.length.toString()} />
        <StatTile icon={CalendarCheck} label="Hadir Hari Ini" value={`${hadirHariIni}/${siswa.length}`} />
        <StatTile icon={TrendingUp} label="Rata-rata Nilai" value={rataNilai ? rataNilai.toString() : '-'} />
        <StatTile
          icon={AlertTriangle}
          label="Perlu Perhatian"
          value={siswaPerluPerhatian.length.toString()}
          tone="warning"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-[var(--border)] bg-white/60 p-5 shadow-sm dark:bg-dark-surface-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold">Kehadiran 14 Hari</h2>
              <p className="text-sm text-[var(--text-muted)]">Jumlah siswa hadir per hari.</p>
            </div>
          </div>
          <AttendanceBarChart data={chartData} />
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-white/60 p-5 shadow-sm dark:bg-dark-surface-2">
          <h2 className="font-heading text-xl font-bold">Distribusi Potensi</h2>
          <p className="mb-5 text-sm text-[var(--text-muted)]">Kategori bakat yang tercatat.</p>
          {potentialData.length ? <PotentialBars data={potentialData} /> : <Empty text="Belum ada potensi yang dicatat." />}
        </article>
      </div>

      <article className="rounded-2xl border border-[var(--border)] bg-white/60 p-5 shadow-sm dark:bg-dark-surface-2">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="text-primary" size={22} />
          <h2 className="font-heading text-xl font-bold">Siswa Perlu Perhatian</h2>
        </div>
        {siswaPerluPerhatian.length ? (
          <div className="divide-y divide-[var(--border)]">
            {siswaPerluPerhatian.map(({ anak, rate }) => (
              <button
                key={anak.id}
                onClick={() => navigate('siswa-detail', anak.id)}
                className="flex w-full items-center justify-between py-3 text-left"
              >
                <div>
                  <p className="font-semibold">{anak.nama}</p>
                  <p className="text-sm text-[var(--text-muted)]">Kehadiran bulan ini {rate}%</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pantau</span>
              </button>
            ))}
          </div>
        ) : (
          <Empty text="Belum ada siswa yang perlu perhatian khusus bulan ini." />
        )}
      </article>
    </section>
  )
}

function StatTile({ icon: Icon, label, value, tone = 'primary' }: { icon: typeof Users; label: string; value: string; tone?: 'primary' | 'warning' }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tone === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-primary-50 text-primary'}`}>
        <Icon size={22} />
      </div>
      <p className="font-heading text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{label}</p>
    </article>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl bg-[var(--surface-2)] p-5 text-center text-sm text-[var(--text-muted)]">{text}</div>
}
