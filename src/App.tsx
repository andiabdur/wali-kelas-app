import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { useStore } from './store/useStore'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { SiswaList } from './pages/SiswaList'
import { SiswaDetail } from './pages/SiswaDetail'
import { Absensi } from './pages/Absensi'
import { Akademis } from './pages/Akademis'
import { Laporan } from './pages/Laporan'
import { DenahBangku } from './pages/DenahBangku'
import { Pengaturan } from './pages/Pengaturan'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { currentPage, darkMode } = useStore()
  const { user, loading } = useAuth()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Memuat Aplikasi Wali Kelas...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'siswa':
        return <SiswaList />
      case 'siswa-detail':
        return <SiswaDetail />
      case 'absensi':
      case 'absensi-rekap':
        return <Absensi />
      case 'denah-bangku':
        return <DenahBangku />
      case 'akademis':
        return <Akademis />
      case 'laporan':
        return <Laporan />
      case 'pengaturan':
        return <Pengaturan />
      default:
        return <Dashboard />
    }
  }

  return <Layout>{renderPage()}</Layout>
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
