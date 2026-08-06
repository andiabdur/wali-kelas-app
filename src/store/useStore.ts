import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, exportAllData, importAllData } from '../db/database'
import type { Kelas } from '../db/database'

import type { ToastMessage } from '../components/Toast'

type Page = 'dashboard' | 'siswa' | 'siswa-detail' | 'absensi' | 'absensi-rekap' | 'akademis' | 'laporan' | 'denah-bangku' | 'pengaturan'

interface AppState {
  currentPage: Page
  selectedSiswaId: string | null
  kelasInfo: Kelas | null
  darkMode: boolean
  toast: ToastMessage | null

  navigate: (page: Page, siswaId?: string) => void
  setKelasInfo: (info: Kelas) => void
  toggleDarkMode: () => void
  loadKelasInfo: () => Promise<void>
  exportData: () => Promise<void>
  importData: (file: File) => Promise<void>
  notify: (title: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: 'dashboard',
      selectedSiswaId: null,
      kelasInfo: null,
      darkMode: false,
      toast: null,

      notify: (title, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9)
        set({ toast: { id, title, type } })
        setTimeout(() => {
          if (get().toast?.id === id) {
            set({ toast: null })
          }
        }, 3000)
      },

      clearToast: () => set({ toast: null }),

      navigate: (page, siswaId) => {
        set({ currentPage: page, selectedSiswaId: siswaId ?? null })
      },

      setKelasInfo: async (info) => {
        if (info.id) {
          await db.kelas.put(info)
        } else {
          const id = await db.kelas.add(info)
          info = { ...info, id: id as number }
        }
        set({ kelasInfo: info })
      },

      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        document.documentElement.classList.toggle('dark', next)
      },

      loadKelasInfo: async () => {
        const kelas = await db.kelas.toCollection().first()
        if (kelas) set({ kelasInfo: kelas })
      },

      exportData: async () => {
        const data = await exportAllData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wali-kelas-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      importData: async (file) => {
        const text = await file.text()
        const data = JSON.parse(text)
        await importAllData(data)
        await get().loadKelasInfo()
      },
    }),
    {
      name: 'wali-kelas-ui',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
)
