import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Moon, RotateCcw, Save, Upload, Check, Bot, Sparkles, Loader2, Key, Server, Cpu } from 'lucide-react'
import { resetAllData, type Kelas } from '../db/database'
import { useStore } from '../store/useStore'
import { getLLMConfig, setLLMConfig, generate30PresensiQuestionsAI } from '../utils/aiService'

export function Pengaturan() {
  const { kelasInfo, setKelasInfo, exportData, importData, darkMode, toggleDarkMode, notify } = useStore()
  const [form, setForm] = useState<Kelas>(kelasInfo || { nama: 'Kelas 3A', tahunAjaran: '2025/2026', namaWaliKelas: '', nipWaliKelas: '', namaSekolah: 'SDN CIJUREY I', logoDinas: '/logo-majalengka.png', logoSekolah: '/logo-sekolah.png' })
  const [confirmReset, setConfirmReset] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // LLM Config State
  const initialLLM = getLLMConfig()
  const [llmForm, setLlmForm] = useState(initialLLM)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)

  async function save() {
    await setKelasInfo(form)
    setSavedSuccess(true)
    notify('Profil kelas berhasil disimpan.', 'success')
    setTimeout(() => setSavedSuccess(false), 2000)
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
      notify(`Berhasil menggenerasi ${items.length} pertanyaan presensi interaktif baru dari AI!`, 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal menggenerasi pertanyaan dari AI.', 'error')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  async function handleImport(file?: File) {
    if (!file) return
    await importData(file)
    notify('Data JSON berhasil diimport.', 'success')
  }

  async function doReset() {
    await resetAllData()
    setConfirmReset(false)
    notify('Semua data berhasil direset.', 'info')
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Pengaturan</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Data Kelas, AI LLM & Backup</h1>
        <p className="mt-1 text-[var(--text-muted)]">Atur profil kelas, integrasi AI LLM, dan cadangkan data secara lokal.</p>
      </div>

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
          {savedSuccess ? <Check size={18} className="animate-bounce" /> : <Save size={18} />}
          {savedSuccess ? 'Tersimpan!' : 'Simpan Profil'}
        </motion.button>
      </article>

      {/* AI LLM Integration Section */}
      <article className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-50/50 via-white/80 to-accent-50/30 p-5 shadow-sm dark:bg-dark-surface-2 dark:from-dark-surface-2 dark:to-dark-surface-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold">Konfigurasi AI LLM & Pertanyaan Presensi</h2>
            <p className="text-xs text-[var(--text-muted)]">Mendukung OpenAI API standard (`VITE_OPENAI_API_URL`, `VITE_OPENAI_API_KEY`, `VITE_OPENAI_MODEL` di file `.env` atau form di bawah).</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Input label="API URL (OpenAI Compatible)" value={llmForm.apiUrl} placeholder="https://api.openai.com/v1/chat/completions" onChange={(apiUrl) => setLlmForm({ ...llmForm, apiUrl })} />
          <Input label="API Key LLM" type="password" value={llmForm.apiKey} placeholder="sk-..." onChange={(apiKey) => setLlmForm({ ...llmForm, apiKey })} />
          <Input label="Model AI" value={llmForm.model} placeholder="gpt-4o-mini" onChange={(model) => setLlmForm({ ...llmForm, model })} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveLLM}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1 text-sm"
          >
            <Save size={16} /> Simpan Konfigurasi AI
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateQuestions}
            disabled={isGeneratingQuestions}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white shadow-md disabled:opacity-50 text-sm"
          >
            {isGeneratingQuestions ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGeneratingQuestions ? 'Menggenerasi dari AI...' : 'Generate 30 Pertanyaan Presensi AI'}
          </motion.button>
        </div>
      </article>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
          <h2 className="font-heading text-xl font-bold">Backup & Restore</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Gunakan export JSON untuk memindahkan data ke perangkat/browser lain.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportData}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1"
            >
              <Download size={18} /> Export JSON
            </motion.button>
            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1"
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
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1"
            >
              <Moon size={18} /> {darkMode ? 'Mode Terang' : 'Mode Gelap'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setConfirmReset(true)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 font-semibold text-red-600 shadow-sm hover:bg-red-100/50"
            >
              <RotateCcw size={18} /> Reset Data
            </motion.button>
          </div>
        </article>
      </div>

      {confirmReset && <div className="fixed inset-0 z-[60] flex items-end bg-black/30 p-4 sm:items-center sm:justify-center"><div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-5 shadow-lg"><h2 className="font-heading text-2xl font-bold">Hapus semua data?</h2><p className="mt-2 text-[var(--text-muted)]">Tindakan ini menghapus siswa, absensi, nilai, catatan, dan mapel dari browser ini.</p><div className="mt-6 flex gap-3"><button onClick={() => setConfirmReset(false)} className="min-h-11 flex-1 rounded-xl border border-[var(--border)] font-semibold">Batal</button><button onClick={doReset} className="min-h-11 flex-1 rounded-xl bg-red-600 font-semibold text-white">Ya, Hapus</button></div></div></div>}
    </section>
  )
}

function Input({ label, value, placeholder, onChange, type = 'text' }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block"><span className="text-sm font-semibold">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 dark:placeholder:text-gray-600" /></label>
}
