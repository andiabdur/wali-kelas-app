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
        className="fixed bottom-20 left-3 right-3 z-[100] mx-auto max-w-lg rounded-2xl border-2 border-primary/30 bg-[var(--surface)]/95 backdrop-blur-md p-4 shadow-2xl dark:bg-dark-surface-2 dark:border-primary-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[var(--text-primary)]">
                Pasang Aplikasi Wali Kelas
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed">
                {isIOS
                  ? 'Pasang di iPhone/iPad: Ketuk ikon Bagikan (Share) di browser Safari, lalu pilih "Tambah ke Layar Utama".'
                  : 'Pasang aplikasi di layar utama HP Anda untuk akses cepat & penuh secara offline!'}
              </p>

              {isIOS ? (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-300">
                  <Share size={15} /> <span>Buka menu Safari → Tambah ke Layar Utama</span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstallClick}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md"
                >
                  <Download size={15} /> Pasang di HP Sekarang
                </motion.button>
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
