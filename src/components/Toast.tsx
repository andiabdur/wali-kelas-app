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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-[var(--text-primary)] shadow-lg"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}

          <span className="text-xs font-medium">{toast.title}</span>

          <button
            onClick={onClose}
            className="ml-2 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
