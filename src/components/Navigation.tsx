import { BarChart3, BookOpen, CalendarCheck, FileText, GraduationCap, Settings, Users, Dices } from 'lucide-react'
import { useStore } from '../store/useStore'

const primaryItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'siswa', label: 'Siswa', icon: Users },
  { id: 'absensi', label: 'Absensi', icon: CalendarCheck },
  { id: 'denah-bangku', label: 'Denah Bangku', icon: Dices },
  { id: 'akademis', label: 'Akademis', icon: BookOpen },
  { id: 'laporan', label: 'Laporan', icon: FileText },
] as const

const mobileItems = primaryItems.filter((item) => item.id !== 'akademis')

export function DesktopNavigation() {
  const { currentPage, navigate, kelasInfo } = useStore()

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <GraduationCap size={24} />
        </div>
        <div>
          <p className="font-heading text-base font-bold text-[var(--text-primary)]">Wali Kelas</p>
          <p className="text-xs text-[var(--text-muted)]">{kelasInfo?.nama || 'Kelas SD'}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {primaryItems.map((item) => {
          const active = currentPage === item.id || (item.id === 'siswa' && currentPage === 'siswa-detail')
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                active
                  ? 'bg-primary-50 text-primary shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <button
        onClick={() => navigate('pengaturan')}
        className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          currentPage === 'pengaturan'
            ? 'bg-primary-50 text-primary shadow-sm'
            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Settings size={20} />
        <span>Pengaturan</span>
      </button>
    </aside>
  )
}

export function MobileNavigation() {
  const { currentPage, navigate } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 border-t border-[var(--border)] bg-[var(--surface)] px-1 pb-safe pt-1 lg:hidden">
      {mobileItems.map((item) => {
        const active = currentPage === item.id || (item.id === 'siswa' && currentPage === 'siswa-detail')
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${
              active ? 'text-primary' : 'text-[var(--text-muted)]'
            }`}
          >
            <Icon size={21} strokeWidth={active ? 2.4 : 2} />
            <span>{item.label}</span>
          </button>
        )
      })}
      <button
        onClick={() => navigate('pengaturan')}
        className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${
          currentPage === 'pengaturan' ? 'text-primary' : 'text-[var(--text-muted)]'
        }`}
      >
        <Settings size={21} />
        <span>Setelan</span>
      </button>
    </nav>
  )
}
