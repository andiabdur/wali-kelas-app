import { useState, useEffect } from 'react'
import { Download, Moon, RotateCcw, Save, Upload, Check, Loader2, Key, Sliders, Database } from 'lucide-react'
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
  const { data: kelas } = useKelas(activeKelasId)

  const [form, setForm] = useState<Kelas>({
    id: activeKelasId,
    nama: 'Kelas V',
    tahunAjaran: '2026/2027',
    namaWaliKelas: 'Evi Purnamasari, S.Pd.',
    nipWaliKelas: '19850101 201001 2 001',
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
      notify('Profil kelas berhasil disimpan.', 'success')
      setTimeout(() => setSavedSuccess(false), 2000)
    } catch (err: any) {
      notify(err.message || 'Gagal menyimpan profil kelas.', 'error')
    }
  }

  function saveLLM() {
    setLLMConfig(llmForm)
    notify('Konfigurasi inferensi AI tersimpan.', 'success')
  }

  async function handleGenerateQuestions() {
    setIsGeneratingQuestions(true)
    notify('Menyusun 30 pertanyaan presensi interaktif...', 'info')
    try {
      setLLMConfig(llmForm)
      const items = await generate30PresensiQuestionsAI()
      window.dispatchEvent(new Event('storage'))
      notify(`Berhasil menyusun ${items.length} pertanyaan presensi baru.`, 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal menyusun pertanyaan AI.', 'error')
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
      notify('Data kelas berhasil diekspor.', 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal mengekspor data.', 'error')
    }
  }

  async function handleImport(file?: File) {
    if (!file) return
    try {
      notify('Memulihkan data ke Firestore...', 'info')
      const text = await file.text()
      const data = JSON.parse(text)
      await importAllKelasData(activeKelasId, data)
      notify('Data kelas berhasil dipulihkan.', 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal mengimpor data.', 'error')
    }
  }

  async function doReset() {
    try {
      await resetKelasData(activeKelasId)
      setConfirmReset(false)
      notify('Seluruh data kelas berhasil direset.', 'info')
    } catch (err: any) {
      notify(err.message || 'Gagal mereset data kelas.', 'error')
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Konfigurasi</p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
          Pengaturan Aplikasi
        </h1>
      </div>

      {/* User Session Info Card */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold text-[var(--text-primary)]">Sesi Login Pengguna</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Akun Email</p>
            <p className="mt-1 font-semibold text-[var(--text-primary)] truncate">{profile?.email || '-'}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Peran Akses</p>
            <p className="mt-1 font-semibold text-primary capitalize">
              {role === 'admin' ? 'Administrator Sekolah' : 'Wali Kelas'}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Kelas Terpilih</p>
            <p className="mt-1 font-semibold text-[var(--text-primary)]">{form.nama || activeKelasId}</p>
          </div>
        </div>
      </article>

      {/* Class Profile Form */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold text-[var(--text-primary)]">Profil Kelas & Instansi Sekolah</h2>

        <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)]">
            <img
              src={form.logoDinas || '/logo-majalengka.png'}
              alt="Logo Dinas"
              className="h-12 w-12 object-contain rounded border bg-white p-1 shrink-0"
            />
            <div>
              <p className="font-semibold text-xs text-[var(--text-primary)]">Logo Pemkab Majalengka</p>
              <p className="text-[10px] text-[var(--text-muted)]">Kop Surat Sisi Kiri</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)]">
            <img
              src={form.logoSekolah || '/logo-sekolah.png'}
              alt="Logo Sekolah"
              className="h-12 w-12 object-contain rounded border bg-white p-1 shrink-0"
            />
            <div>
              <p className="font-semibold text-xs text-[var(--text-primary)]">Logo SDN Cijurey I</p>
              <p className="text-[10px] text-[var(--text-muted)]">Kop Surat Sisi Kanan</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input label="Nama Kelas" value={form.nama} onChange={(nama) => setForm({ ...form, nama })} />
          <Input
            label="Tahun Ajaran"
            value={form.tahunAjaran}
            onChange={(tahunAjaran) => setForm({ ...form, tahunAjaran })}
          />
          <Input
            label="Nama Wali Kelas"
            value={form.namaWaliKelas}
            onChange={(namaWaliKelas) => setForm({ ...form, namaWaliKelas })}
          />
          <Input
            label="NIP Wali Kelas"
            value={form.nipWaliKelas || ''}
            placeholder="19850101 201001 2 001"
            onChange={(nipWaliKelas) => setForm({ ...form, nipWaliKelas })}
          />
          <div className="sm:col-span-2">
            <Input
              label="Nama Sekolah"
              value={form.namaSekolah}
              onChange={(namaSekolah) => setForm({ ...form, namaSekolah })}
            />
          </div>
        </div>

        <button
          onClick={save}
          className={`mt-4 flex min-h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold text-white shadow-sm transition-colors ${
            savedSuccess ? 'bg-emerald-600' : 'bg-primary hover:bg-primary-600'
          }`}
        >
          {savedSuccess ? <Check size={16} /> : <Save size={16} />}
          <span>{savedSuccess ? 'Tersimpan' : 'Simpan Profil Kelas'}</span>
        </button>
      </article>

      {/* AI LLM Integration */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Sliders className="text-primary" size={18} />
          <h2 className="font-heading text-sm font-bold text-[var(--text-primary)]">Integrasi Model Inferensi AI</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Koneksi API model bahasa untuk pembuatan profil karakteristik dan rotasi pertanyaan presensi harian.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="API Endpoint URL"
              value={llmForm.apiUrl}
              placeholder="https://api.openai.com/v1/chat/completions"
              onChange={(apiUrl) => setLlmForm({ ...llmForm, apiUrl })}
            />
          </div>
          <Input
            label="Kredensial API Key"
            type="password"
            autoComplete="off"
            value={llmForm.apiKey}
            placeholder="sk-..."
            onChange={(apiKey) => setLlmForm({ ...llmForm, apiKey })}
          />
          <Input
            label="Nama Model"
            value={llmForm.model}
            placeholder="gpt-4o-mini / gemini-2.0-flash"
            onChange={(model) => setLlmForm({ ...llmForm, model })}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            onClick={saveLLM}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
          >
            <Key size={15} />
            <span>Simpan Konfigurasi AI</span>
          </button>

          <button
            disabled={isGeneratingQuestions}
            onClick={handleGenerateQuestions}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            {isGeneratingQuestions ? <Loader2 size={15} className="animate-spin" /> : <Sliders size={15} />}
            <span>{isGeneratingQuestions ? 'Menyusun...' : 'Generate 30 Pertanyaan Presensi'}</span>
          </button>
        </div>
      </article>

      {/* Backup & System Controls */}
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <h2 className="font-heading text-sm font-bold text-[var(--text-primary)]">Cadangan Data Cloud</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Ekspor atau impor data kelas ({activeKelasId}) dalam format berkas JSON.
          </p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={handleExport}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors"
            >
              <Download size={15} />
              <span>Ekspor JSON</span>
            </button>
            <label className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors">
              <Upload size={15} />
              <span>Impor JSON</span>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => handleImport(e.target.files?.[0])}
              />
            </label>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
          <h2 className="font-heading text-sm font-bold text-[var(--text-primary)]">Tampilan & Reset</h2>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={toggleDarkMode}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors"
            >
              <Moon size={15} />
              <span>{darkMode ? 'Tema Terang' : 'Tema Gelap'}</span>
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 text-xs font-semibold text-red-600 hover:bg-red-100/50 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 transition-colors"
            >
              <RotateCcw size={15} />
              <span>Reset Data Kelas</span>
            </button>
          </div>
        </article>
      </div>

      {/* Confirm Reset Dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/50 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-xl border border-[var(--border)]">
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">Reset Data Kelas?</h2>
            <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
              Tindakan ini akan menghapus seluruh rekaman siswa, absensi, nilai, dan catatan pada kelas {activeKelasId}.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setConfirmReset(false)}
                className="min-h-9 flex-1 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={doReset}
                className="min-h-9 flex-1 rounded-lg bg-red-600 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Reset Data
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
      <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
      />
    </label>
  )
}
