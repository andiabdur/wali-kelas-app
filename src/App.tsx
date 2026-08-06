import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { useStore } from './store/useStore'
import { Dashboard } from './pages/Dashboard'
import { SiswaList } from './pages/SiswaList'
import { SiswaDetail } from './pages/SiswaDetail'
import { Absensi } from './pages/Absensi'
import { Akademis } from './pages/Akademis'
import { Laporan } from './pages/Laporan'
import { DenahBangku } from './pages/DenahBangku'
import { Pengaturan } from './pages/Pengaturan'

function App() {
  const { currentPage, loadKelasInfo, darkMode } = useStore()

  useEffect(() => {
    loadKelasInfo()
    document.documentElement.classList.toggle('dark', darkMode)
  }, [loadKelasInfo, darkMode])

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

export default App
