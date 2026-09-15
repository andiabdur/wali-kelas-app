import { AlertTriangle, CalendarCheck, ClipboardList, TrendingUp, Users, Grid3X3 } from 'lucide-react'
import { KATEGORI_POTENSI, useKelas, useSiswaList, useAbsensiList, useNilaiList } from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { AttendanceBarChart, PotentialBars } from '../components/DashboardCharts'
import { TabelDetailKehadiran } from '../components/TabelDetailKehadiran'

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
  const { navigate } = useStore()
  const { activeKelasId } = useAuth()
  const { data: kelas } = useKelas(activeKelasId)
  const { siswa: allSiswa } = useSiswaList(activeKelasId)
  const siswa = allSiswa.filter((s) => s.aktif)
  const { records: absensi } = useAbsensiList(activeKelasId)
  const { nilai } = useNilaiList(activeKelasId)

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
      {/* Header */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ringkasan Kelas</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            {kelas?.nama || 'Kelas SD'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('denah-bangku')}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors"
          >
            <Grid3X3 size={16} className="text-primary" />
            <span>Denah Bangku</span>
          </button>
          <button
            onClick={() => navigate('absensi')}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
          >
            <CalendarCheck size={16} />
            <span>Presensi Hari Ini</span>
          </button>
        </div>
      </header>

      {/* 4 Stat Tiles */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Users} label="Total Siswa Aktif" value={siswa.length.toString()} />
        <StatTile icon={CalendarCheck} label="Hadir Hari Ini" value={`${hadirHariIni}/${siswa.length}`} />
        <StatTile icon={TrendingUp} label="Rata-rata Nilai Bulan Ini" value={rataNilai ? rataNilai.toString() : '-'} />
        <StatTile
          icon={AlertTriangle}
          label="Perlu Perhatian Kehadiran"
          value={siswaPerluPerhatian.length.toString()}
          tone="warning"
        />
      </div>

      {/* Visual Charts */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <div className="mb-4">
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">Kehadiran 14 Hari Terakhir</h2>
          </div>
          <AttendanceBarChart data={chartData} />
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <h2 className="mb-4 font-heading text-base font-bold text-[var(--text-primary)]">Distribusi Potensi Siswa</h2>
          {potentialData.length ? <PotentialBars data={potentialData} /> : <Empty text="Belum ada pemetaan potensi siswa." />}
        </article>
      </div>

      {/* Attendance Detail Table */}
      <TabelDetailKehadiran
        siswa={siswa}
        absensi={absensi}
        onSelectSiswa={(id) => navigate('siswa-detail', id)}
      />

      {/* Attention Required List */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="text-primary" size={18} />
          <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">Siswa Perlu Perhatian</h2>
        </div>
        {siswaPerluPerhatian.length ? (
          <div className="divide-y divide-[var(--border)]">
            {siswaPerluPerhatian.map(({ anak, rate }) => (
              <button
                key={anak.id}
                onClick={() => navigate('siswa-detail', anak.id)}
                className="flex w-full items-center justify-between py-2.5 text-left hover:text-primary transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{anak.nama}</p>
                  <p className="text-xs text-[var(--text-muted)]">Kehadiran bulan ini {rate}%</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  Pantau
                </span>
              </button>
            ))}
          </div>
        ) : (
          <Empty text="Seluruh siswa memiliki tingkat kehadiran normal bulan ini." />
        )}
      </article>
    </section>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = 'primary',
}: {
  icon: typeof Users
  label: string
  value: string
  tone?: 'primary' | 'warning'
}) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            tone === 'warning'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
    </article>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg bg-[var(--surface)] p-4 text-center text-xs text-[var(--text-muted)]">{text}</div>
}
