import { type ReactNode } from 'react'
import { DesktopNavigation, MobileNavigation } from './Navigation'
import { Toast } from './Toast'
import { useStore } from '../store/useStore'

export function Layout({ children }: { children: ReactNode }) {
  const { toast, clearToast } = useStore()

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <DesktopNavigation />
      <main className="min-h-screen px-4 pb-40 pt-5 sm:px-6 lg:ml-64 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <MobileNavigation />
      <Toast toast={toast} onClose={clearToast} />
    </div>
  )
}
