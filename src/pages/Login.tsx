import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage('Silakan lengkapi email dan kata sandi.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    try {
      await login(email, password)
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage('Email atau kata sandi tidak cocok. Silakan coba lagi.')
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.')
      } else {
        setErrorMessage('Gagal masuk ke sistem. Pastikan perangkat terhubung internet.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('WaliKelas2026!')
    setErrorMessage(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
            <GraduationCap size={36} />
          </div>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Aplikasi Wali Kelas
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Sistem Informasi & Manajemen Kelas Kolaboratif
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white/80 p-6 sm:p-8 shadow-sm dark:bg-dark-surface-2 backdrop-blur-md">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Alamat Email
              </label>
              <div className="mt-1.5 flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/60 px-4 shadow-sm dark:bg-dark-surface-1 focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Mail size={18} className="text-[var(--text-muted)] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sdncijurey1.sch.id"
                  required
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Kata Sandi
              </label>
              <div className="mt-1.5 flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/60 px-4 shadow-sm dark:bg-dark-surface-1 focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Lock size={18} className="text-[var(--text-muted)] shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Akun</span>
              )}
            </motion.button>
          </form>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <p className="text-center text-xs font-medium text-[var(--text-muted)]">
              Akses Cepat Akun Demo (Klik untuk mengisi):
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@sdncijurey1.sch.id')}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/50 transition"
              >
                <ShieldCheck size={16} className="text-primary" />
                <span>Admin Sekolah</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('evi.purnamasari@sdncijurey1.sch.id')}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/50 transition"
              >
                <UserCheck size={16} className="text-emerald-600" />
                <span>Wali Kelas V</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)]">
          SDN Cijurey I &bull; Dinas Pendidikan Kabupaten Majalengka
        </p>
      </motion.div>
    </div>
  )
}
