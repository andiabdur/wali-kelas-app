import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share, X, Smartphone, CheckCircle2 } from 'lucide-react'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if app is already running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed before
    const isDismissed = localStorage.getItem('PWA_INSTALL_DISMISSED') === 'true'
    if (isDismissed) return

    // Detect iOS Safari
    const ua = window.navigator.userAgent
    const iosDevice = /iPhone|iPad|iPod/.test(ua) && !('MSStream' in window)
    if (iosDevice) {
      setIsIOS(true)
      setShowPrompt(true)
      return
    }

    // Listen for Android/Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  async function handleInstallClick() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  function handleDismiss() {
    setShowPrompt(false)
    localStorage.setItem('PWA_INSTALL_DISMISSED', 'true')
  }

  if (!showPrompt || isInstalled) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-3 right-3 z-[100] mx-auto max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-[var(--text-primary)]">
                Pasang Aplikasi Wali Kelas
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed">
                {isIOS
                  ? 'Pasang di Safari iOS: ketuk tombol Bagikan lalu pilih Tambah ke Layar Utama.'
                  : 'Tambahkan ke layar utama perangkat untuk akses praktis dan performa optimal.'}
              </p>

              {isIOS ? (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Share size={14} /> <span>Menu Safari &rarr; Tambah ke Layar Utama</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  <Download size={14} /> Pasang Aplikasi
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-gray-200 dark:hover:bg-dark-surface-1"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
