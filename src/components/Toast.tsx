import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  title: string
  type?: 'success' | 'error' | 'info'
}

export function Toast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl bg-gray-900/95 px-5 py-3.5 text-white shadow-2xl backdrop-blur-md dark:bg-white dark:text-gray-900 border border-white/10 dark:border-black/10"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="h-5 w-5 text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 animate-bounce" />
          )}

          <span className="text-sm font-semibold tracking-wide">{toast.title}</span>

          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white dark:hover:bg-black/10 dark:hover:text-black transition"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
