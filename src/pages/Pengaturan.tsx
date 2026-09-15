import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Moon, RotateCcw, Save, Upload, Check, Bot, Sparkles, Loader2, Key, Server, Cpu, Cloud, Shield, UserCheck } from 'lucide-react'
import {
  useKelas,
  saveKelas,
  exportAllKelasData,
  importAllKelasData,
  resetKelasData,
  type Kelas,
} from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { getLLMConfig, setLLMConfig, generate30PresensiQuestionsAI } from '../utils/aiService'

export function Pengaturan() {
  const { darkMode, toggleDarkMode, notify } = useStore()
  const { activeKelasId, role, profile } = useAuth()
  const { data: kelas, loading: kelasLoading } = useKelas(activeKelasId)

  const [form, setForm] = useState<Kelas>({
    id: activeKelasId,
    nama: 'Kelas V',
    tahunAjaran: '2026/2027',
    namaWaliKelas: 'Evi Purnamasari, S.pd',
    nipWaliKelas: '23123213123123',
    namaSekolah: 'SDN Cijurey I',
    logoDinas: '/logo-majalengka.png',
    logoSekolah: '/logo-sekolah.png',
  })

  useEffect(() => {
    if (kelas) {
      setForm(kelas)
    }
  }, [kelas])

  const [confirmReset, setConfirmReset] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // LLM Config State
  const initialLLM = getLLMConfig()
  const [llmForm, setLlmForm] = useState(initialLLM)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)

  async function save() {
    try {
      await saveKelas({ ...form, id: activeKelasId })
      setSavedSuccess(true)
      notify('Profil kelas berhasil disimpan ke Cloud Firestore.', 'success')
      setTimeout(() => setSavedSuccess(false), 2000)
    } catch (err: any) {
      notify(err.message || 'Gagal menyimpan profil kelas.', 'error')
    }
  }

  function saveLLM() {
    setLLMConfig(llmForm)
    notify('Konfigurasi API LLM AI berhasil disimpan.', 'success')
  }

  async function handleGenerateQuestions() {
    setIsGeneratingQuestions(true)
    notify('Menghubungi AI untuk menggenerasi 30 pertanyaan presensi...', 'info')
    try {
      setLLMConfig(llmForm)
      const items = await generate30PresensiQuestionsAI()
      window.dispatchEvent(new Event('storage'))
      notify(`Berhasil menggenerasi ${items.length} pertanyaan presensi interaktif baru dari AI!`, 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal menggenerasi pertanyaan dari AI.', 'error')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  async function handleExport() {
    try {
      notify('Menyiapkan file cadangan...', 'info')
      const data = await exportAllKelasData(activeKelasId)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wali-kelas-backup-${activeKelasId}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      notify('Data JSON berhasil diekspor dari Firestore.', 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal mengekspor data.', 'error')
    }
  }

  async function handleImport(file?: File) {
    if (!file) return
    try {
      notify('Mengimpor data ke Cloud Firestore...', 'info')
      const text = await file.text()
      const data = JSON.parse(text)
      await importAllKelasData(activeKelasId, data)
      notify('Data JSON cadangan berhasil diimpor ke Firestore.', 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal mengimpor file JSON.', 'error')
    }
  }

  async function doReset() {
    try {
      await resetKelasData(activeKelasId)
      setConfirmReset(false)
      notify('Semua data kelas aktif berhasil direset.', 'info')
    } catch (err: any) {
      notify(err.message || 'Gagal mereset data.', 'error')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Pengaturan</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Data Kelas, Akun & Cloud Database</h1>
          <p className="mt-1 text-[var(--text-muted)]">Atur profil kelas, integrasi AI LLM, dan sinkronisasi Cloud Firestore.</p>
        </div>

        {/* Cloud Status Badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cloud Firestore Aktif</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">({activeKelasId})</span>
        </div>
      </div>

      {/* Info Akun Login */}
      <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
        <h2 className="font-heading text-xl font-bold">Informasi Akun</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {role === 'admin' ? <Shield size={24} /> : <UserCheck size={24} />}
          </div>
          <div>
            <p className="font-bold text-base text-[var(--text-primary)]">{profile?.nama || 'Pengguna'}</p>
            <p className="text-xs text-[var(--text-muted)]">{profile?.email}</p>
          </div>
          <div className="ml-auto">
            <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              {role === 'admin' ? 'Administrator' : 'Wali Kelas'}
            </span>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
        <h2 className="font-heading text-xl font-bold">Profil Kelas & Instansi Sekolah</h2>
        
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3.5 bg-white/50 dark:bg-dark-surface-1">
            <img src={form.logoDinas || '/logo-majalengka.png'} alt="Logo Pemkab Majalengka" className="h-16 w-16 object-contain rounded-lg border bg-white p-1 shrink-0" />
            <div>
              <p className="font-bold text-sm">Logo Pemkab Majalengka</p>
              <p className="text-xs text-[var(--text-muted)]">Kop Surat Kiri</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3.5 bg-white/50 dark:bg-dark-surface-1">
            <img src={form.logoSekolah || '/logo-sekolah.png'} alt="Logo SDN Cijurey I" className="h-16 w-16 object-contain rounded-lg border bg-white p-1 shrink-0" />
            <div>
              <p className="font-bold text-sm">Logo SDN Cijurey I</p>
              <p className="text-xs text-[var(--text-muted)]">Kop Surat Kanan</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input label="Nama Kelas" value={form.nama} onChange={(nama) => setForm({ ...form, nama })} />
          <Input label="Tahun Ajaran" value={form.tahunAjaran} onChange={(tahunAjaran) => setForm({ ...form, tahunAjaran })} />
          <Input label="Nama Wali Kelas" value={form.namaWaliKelas} onChange={(namaWaliKelas) => setForm({ ...form, namaWaliKelas })} />
          <Input label="NIP Wali Kelas" value={form.nipWaliKelas || ''} placeholder="Contoh: 19850101 201001 1 001" onChange={(nipWaliKelas) => setForm({ ...form, nipWaliKelas })} />
          <Input label="Nama Sekolah" value={form.namaSekolah} onChange={(namaSekolah) => setForm({ ...form, namaSekolah })} />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={save}
          className={`mt-5 flex min-h-11 items-center gap-2 rounded-xl px-5 font-semibold text-white shadow-md transition-colors ${savedSuccess ? 'bg-emerald-600' : 'bg-primary'}`}
        >
          {savedSuccess ? <Check size={18} /> : <Save size={18} />}
          <span>{savedSuccess ? 'Tersimpan ke Firestore' : 'Simpan Profil Kelas'}</span>
        </motion.button>
      </article>

      {/* AI LLM Settings */}
      <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" size={24} />
          <h2 className="font-heading text-xl font-bold">Integrasi AI LLM</h2>
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Konfigurasi koneksi API model bahasa (OpenAI, Gemini, OpenClaw, Ollama) untuk analisis kepribadian siswa dan pembuatan pertanyaan presensi.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="API Endpoint URL"
              value={llmForm.apiUrl}
              placeholder="https://api.openai.com/v1/chat/completions"
              onChange={(apiUrl) => setLlmForm({ ...llmForm, apiUrl })}
            />
          </div>
          <Input
            label="API Key / Token Kredensial"
            type="password"
            autoComplete="off"
            value={llmForm.apiKey}
            placeholder="sk-..."
            onChange={(apiKey) => setLlmForm({ ...llmForm, apiKey })}
          />
          <Input
            label="Nama Model LLM"
            value={llmForm.model}
            placeholder="gpt-4o-mini / gemini-1.5-flash / llama3"
            onChange={(model) => setLlmForm({ ...llmForm, model })}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveLLM}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white shadow-md"
          >
            <Key size={18} /> Simpan Konfigurasi AI
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            disabled={isGeneratingQuestions}
            onClick={handleGenerateQuestions}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-primary/40 bg-primary-50/50 px-5 font-semibold text-primary shadow-sm hover:bg-primary-100/50 dark:bg-primary-950/30 dark:border-primary-800 dark:text-primary-300 disabled:opacity-50"
          >
            {isGeneratingQuestions ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            <span>{isGeneratingQuestions ? 'Menggenerasi Pertanyaan...' : 'Generate 30 Pertanyaan Presensi AI'}</span>
          </motion.button>
        </div>
      </article>

      {/* Backup, Restore & Display */}
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
          <h2 className="font-heading text-xl font-bold">Backup & Restore Cloud</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Cadangkan data kelas ({activeKelasId}) ke file JSON atau pulihkan data dari file cadangan sebelumnya.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1 dark:text-gray-100 dark:hover:bg-dark-surface-2"
            >
              <Download size={18} /> Export JSON
            </motion.button>
            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1 dark:text-gray-100 dark:hover:bg-dark-surface-2"
            >
              <Upload size={18} /> Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={(e) => handleImport(e.target.files?.[0])} />
            </motion.label>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
          <h2 className="font-heading text-xl font-bold">Tampilan & Reset</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1 dark:text-gray-100 dark:hover:bg-dark-surface-2"
            >
              <Moon size={18} /> {darkMode ? 'Mode Terang' : 'Mode Gelap'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setConfirmReset(true)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 font-semibold text-red-600 shadow-sm hover:bg-red-100/50 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-900/50"
            >
              <RotateCcw size={18} /> Reset Data Kelas
            </motion.button>
          </div>
        </article>
      </div>

      {confirmReset && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/30 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-5 shadow-lg border border-[var(--border)]">
            <h2 className="font-heading text-2xl font-bold">Hapus semua data kelas?</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Tindakan ini menghapus seluruh siswa, absensi, nilai, dan catatan pada kelas {activeKelasId} dari Cloud Firestore.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="min-h-11 flex-1 rounded-xl border border-[var(--border)] font-semibold dark:text-gray-100"
              >
                Batal
              </button>
              <button
                onClick={doReset}
                className="min-h-11 flex-1 rounded-xl bg-red-600 font-semibold text-white"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Input({
  label,
  value,
  placeholder,
  onChange,
  type = 'text',
  autoComplete,
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 dark:bg-dark-surface-1 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
    </label>
  )
}
