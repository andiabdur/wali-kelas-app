import { useState } from 'react'
import {
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  Users,
  Grid3X3,
  Shield,
  GraduationCap,
  UserCheck,
  ArrowRight,
  UserPlus,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react'
import {
  KATEGORI_POTENSI,
  useKelas,
  useAllKelas,
  useSiswaList,
  useAbsensiList,
  useNilaiList,
  useTeachersList,
  useAllSiswaGlobal,
  useAllAbsensiToday,
} from '../db/firestore'
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
  const { role, activeKelasId } = useAuth()
  const [adminViewMode, setAdminViewMode] = useState<'school' | 'classroom'>('school')

  if (role === 'admin' && adminViewMode === 'school') {
    return <AdminDashboard onSwitchToClassroom={() => setAdminViewMode('classroom')} />
  }

  return (
    <ClassroomDashboard
      isAdmin={role === 'admin'}
      onBackToSchool={role === 'admin' ? () => setAdminViewMode('school') : undefined}
    />
  )
}

function AdminDashboard({ onSwitchToClassroom }: { onSwitchToClassroom: () => void }) {
  const { navigate } = useStore()
  const { activeKelasId, setActiveKelasId } = useAuth()
  const { teachers } = useTeachersList()
  const { list: allKelas } = useAllKelas()
  const { allSiswa } = useAllSiswaGlobal()
  const { records: absensiHariIni } = useAllAbsensiToday()

  const siswaAktif = allSiswa.filter((s) => s.aktif)
  const totalHadirHariIni = absensiHariIni.filter((a) => a.status === 'H').length
  const attendancePercentage = siswaAktif.length
    ? Math.round((totalHadirHariIni / siswaAktif.length) * 100)
    : 0

  const activeKelasObj = allKelas.find((k) => k.id === activeKelasId)

  // School-wide potential distribution
  const globalPotentialData = KATEGORI_POTENSI.map((kategori) => ({
    label: kategori.label,
    value: siswaAktif.filter((s) => s.potensi.includes(kategori.id)).length,
  })).filter((item) => item.value > 0)

  const handleInspectClass = (kelasId: string) => {
    setActiveKelasId(kelasId)
    onSwitchToClassroom()
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              Panel Administrator
            </span>
            <span className="text-xs text-[var(--text-muted)]">SDN Cijurey I</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            Dasbor Pengawasan Sekolah
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('manajemen-guru')}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors cursor-pointer"
          >
            <UserPlus size={16} className="text-primary" />
            <span>Manajemen Guru</span>
          </button>
          <button
            onClick={onSwitchToClassroom}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <LayoutDashboard size={16} />
            <span>Lihat Ruang {activeKelasObj?.nama || 'Kelas'}</span>
          </button>
        </div>
      </header>

      {/* 4 School-wide Stat Tiles */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Shield} label="Total Guru Terdaftar" value={`${teachers.length} Guru`} />
        <StatTile icon={GraduationCap} label="Total Kelas Aktif" value={`${allKelas.length} Kelas`} />
        <StatTile icon={Users} label="Total Siswa Terdaftar" value={`${siswaAktif.length} Siswa`} />
        <StatTile
          icon={CalendarCheck}
          label="Kehadiran Sekolah Hari Ini"
          value={`${totalHadirHariIni}/${siswaAktif.length} (${attendancePercentage}%)`}
        />
      </div>

      {/* Section: Daftar Kelas & Wali Kelas */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">
              Daftar Ruang Kelas & Wali Kelas
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Data terisolasi per kelas. Setiap guru mengelola siswa pada kelasnya masing-masing.
            </p>
          </div>
          <button
            onClick={() => navigate('manajemen-guru')}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto cursor-pointer"
          >
            <span>Kelola Penugasan Guru</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pr-4">Nama Kelas</th>
                <th className="pb-3 px-4">Tahun Ajaran</th>
                <th className="pb-3 px-4">Wali Kelas Pengampu</th>
                <th className="pb-3 px-4 text-center">Jumlah Siswa</th>
                <th className="pb-3 px-4 text-center">Hadir Hari Ini</th>
                <th className="pb-3 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {allKelas.map((k) => {
                const classStudents = siswaAktif.filter((s) => s.kelasId === k.id)
                const classHadir = absensiHariIni.filter((a) => a.kelasId === k.id && a.status === 'H').length
                const teacherObj = teachers.find((t) => t.kelasId === k.id)

                return (
                  <tr key={k.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="py-3 pr-4 font-bold text-[var(--text-primary)]">
                      {k.nama}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {k.tahunAjaran}
                    </td>
                    <td className="py-3 px-4">
                      {k.namaWaliKelas && k.namaWaliKelas !== '-' ? (
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{k.namaWaliKelas}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{k.waliKelasEmail || teacherObj?.email || ''}</p>
                        </div>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          Belum Ditugaskan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[var(--text-primary)]">
                      {classStudents.length} Siswa
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[var(--text-primary)]">
                      {classHadir}/{classStudents.length}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        onClick={() => handleInspectClass(k.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors cursor-pointer"
                      >
                        <span>Buka Kelas</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </article>

      {/* Teachers Overview and Talents Grid */}
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        {/* Teachers Card List */}
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">
              Daftar Wali Kelas Terdaftar
            </h2>
            <button
              onClick={() => navigate('manajemen-guru')}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {teachers.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                Belum ada guru yang didaftarkan.
              </p>
            ) : (
              teachers.map((t) => {
                const assigned = allKelas.find((k) => k.id === t.kelasId)
                return (
                  <div key={t.uid} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-heading text-xs font-bold shrink-0">
                        {t.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs text-[var(--text-primary)] truncate">{t.nama}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">{t.email}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {assigned ? (
                        <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-primary-950/50 dark:text-primary-300">
                          {assigned.nama}
                        </span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </article>

        {/* Global Student Potentials */}
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <h2 className="mb-4 font-heading text-base font-bold text-[var(--text-primary)]">
            Pemetaan Bakat Siswa (Seluruh Sekolah)
          </h2>
          {globalPotentialData.length ? (
            <PotentialBars data={globalPotentialData} />
          ) : (
            <Empty text="Belum ada pemetaan potensi siswa." />
          )}
        </article>
      </div>
    </section>
  )
}

function ClassroomDashboard({
  isAdmin,
  onBackToSchool,
}: {
  isAdmin?: boolean
  onBackToSchool?: () => void
}) {
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
      {/* Admin Switch Banner */}
      {isAdmin && onBackToSchool && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary-50/70 p-3 text-xs dark:bg-primary-950/40">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Shield size={16} />
            <span>Sedang melihat ruang kelas: <strong className="font-bold">{kelas?.nama || 'Kelas'}</strong></span>
          </div>
          <button
            onClick={onBackToSchool}
            className="rounded-md bg-white dark:bg-[var(--surface-2)] border border-[var(--border)] px-3 py-1 font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors cursor-pointer"
          >
            Kembali ke Dasbor Sekolah
          </button>
        </div>
      )}

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
            className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors cursor-pointer"
          >
            <Grid3X3 size={16} className="text-primary" />
            <span>Denah Bangku</span>
          </button>
          <button
            onClick={() => navigate('absensi')}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
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
                className="flex w-full items-center justify-between py-2.5 text-left hover:text-primary transition-colors cursor-pointer"
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
