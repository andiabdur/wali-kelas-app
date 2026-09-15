import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  FileText,
  GraduationCap,
  Settings,
  Users,
  Grid3X3,
  LogOut,
  Shield,
  UserCheck,
  ChevronDown,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { useAllKelas, useKelas } from '../db/firestore'

const primaryItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'siswa', label: 'Siswa', icon: Users },
  { id: 'absensi', label: 'Absensi', icon: CalendarCheck },
  { id: 'denah-bangku', label: 'Denah Bangku', icon: Grid3X3 },
  { id: 'akademis', label: 'Akademis', icon: BookOpen },
  { id: 'laporan', label: 'Laporan', icon: FileText },
] as const

const mobileItems = primaryItems.filter((item) => item.id !== 'akademis')

export function DesktopNavigation() {
  const { currentPage, navigate } = useStore()
  const { profile, role, logout, activeKelasId, setActiveKelasId } = useAuth()
  const { data: kelas } = useKelas(activeKelasId)
  const { list: allKelas } = useAllKelas()

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5">
      {/* Brand & Class Info */}
      <div className="mb-5 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm shrink-0">
            <GraduationCap size={22} strokeWidth={2} />
          </div>
          <div className="overflow-hidden">
            <p className="font-heading text-sm font-bold text-[var(--text-primary)] truncate">Wali Kelas</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{kelas?.namaSekolah || 'SDN Cijurey I'}</p>
          </div>
        </div>

        {/* Admin Class Switcher */}
        {role === 'admin' && allKelas.length > 0 && (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
              <span>Kelas Aktif</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-bold">Admin</span>
            </div>
            <div className="relative flex items-center">
              <select
                value={activeKelasId}
                onChange={(e) => setActiveKelasId(e.target.value)}
                className="w-full appearance-none rounded-md bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] outline-none border border-[var(--border)] pr-7 cursor-pointer hover:border-primary/40 transition-colors"
              >
                {allKelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.tahunAjaran})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 text-[var(--text-muted)]" />
            </div>
          </div>
        )}
      </div>

      {/* Main Nav Items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
        {primaryItems.map((item) => {
          const active = currentPage === item.id || (item.id === 'siswa' && currentPage === 'siswa-detail')
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary dark:bg-primary-900/40 dark:text-primary-300 font-semibold'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom Nav: Settings & User Profile / Logout */}
      <div className="border-t border-[var(--border)] pt-3 space-y-2">
        <button
          onClick={() => navigate('pengaturan')}
          className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            currentPage === 'pengaturan'
              ? 'bg-primary-50 text-primary dark:bg-primary-900/40 dark:text-primary-300 font-semibold'
              : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Settings size={18} strokeWidth={currentPage === 'pengaturan' ? 2.2 : 1.8} />
          <span>Pengaturan</span>
        </button>

        <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
              {role === 'admin' ? <Shield size={16} /> : <UserCheck size={16} />}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                {profile?.nama || profile?.email || 'Guru'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] capitalize">
                {role === 'admin' ? 'Administrator' : (kelas?.nama || 'Wali Kelas')}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export function MobileNavigation() {
  const { currentPage, navigate } = useStore()
  const { role, activeKelasId, setActiveKelasId, logout, profile } = useAuth()
  const { list: allKelas } = useAllKelas()
  const { data: kelas } = useKelas(activeKelasId)

  return (
    <>
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white shrink-0">
            <GraduationCap size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate leading-tight">
              {kelas?.nama || 'Wali Kelas'}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{profile?.nama || 'SDN Cijurey I'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' && allKelas.length > 0 && (
            <select
              value={activeKelasId}
              onChange={(e) => setActiveKelasId(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--text-primary)] outline-none"
            >
              {allKelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => logout()}
            title="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-red-600 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-1 pb-safe pt-1 lg:hidden shadow-sm">
        {mobileItems.map((item) => {
          const active = currentPage === item.id || (item.id === 'siswa' && currentPage === 'siswa-detail')
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-[10px] font-medium transition-colors ${
                active ? 'text-primary font-semibold' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
              <span className="w-full text-center truncate tracking-tight">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={() => navigate('pengaturan')}
          className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-[10px] font-medium transition-colors ${
            currentPage === 'pengaturan' ? 'text-primary font-semibold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Settings size={18} strokeWidth={currentPage === 'pengaturan' ? 2.2 : 1.8} className="shrink-0" />
          <span className="w-full text-center truncate tracking-tight">Setelan</span>
        </button>
      </nav>
    </>
  )
}
