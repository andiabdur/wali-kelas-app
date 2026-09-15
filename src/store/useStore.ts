import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ToastMessage } from '../components/Toast'

type Page = 'dashboard' | 'siswa' | 'siswa-detail' | 'absensi' | 'absensi-rekap' | 'akademis' | 'laporan' | 'denah-bangku' | 'pengaturan' | 'manajemen-guru'

interface AppState {
  currentPage: Page
  selectedSiswaId: string | null
  darkMode: boolean
  toast: ToastMessage | null

  navigate: (page: Page, siswaId?: string) => void
  resetPage: () => void
  toggleDarkMode: () => void
  notify: (title: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: 'dashboard',
      selectedSiswaId: null,
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

      resetPage: () => {
        set({ currentPage: 'dashboard', selectedSiswaId: null })
      },

      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        document.documentElement.classList.toggle('dark', next)
      },
    }),
    {
      name: 'wali-kelas-ui',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
)
