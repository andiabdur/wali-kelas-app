import { useState, useEffect, useMemo } from 'react'
import {
  Download,
  Moon,
  RotateCcw,
  Save,
  Upload,
  Check,
  Loader2,
  Key,
  Sliders,
  Database,
  Search,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Radio,
  FileCheck,
  X,
} from 'lucide-react'
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
import {
  getLLMConfig,
  setLLMConfig,
  generate30PresensiQuestionsAI,
  OMNIROUTE_DEFAULT_PRESET,
} from '../utils/aiService'
import {
  getActiveCurriculum,
  isCustomCurriculumActive,
  saveCurriculumQuestions,
  resetCurriculumToDefault,
  CURRICULUM_PERTANYAAN_HARIAN,
  type PertanyaanItem,
} from '../utils/psychologyEngine'

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

  // LLM Config State
  const initialLLM = getLLMConfig()
  const [llmForm, setLlmForm] = useState(initialLLM)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [showLLMConfig, setShowLLMConfig] = useState(false)

  // Questions / Curriculum State
  const [questions, setQuestions] = useState<PertanyaanItem[]>(() => getActiveCurriculum())
  const [isCustom, setIsCustom] = useState(() => isCustomCurriculumActive())
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)

  useEffect(() => {
    if (kelas) {
      setForm(kelas)
      if (kelas.llmConfig) {
        setLlmForm(kelas.llmConfig)
        setLLMConfig(kelas.llmConfig)
      }
    }
  }, [kelas])

  useEffect(() => {
    function handleStorage() {
      setQuestions(getActiveCurriculum())
      setIsCustom(isCustomCurriculumActive())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const [confirmReset, setConfirmReset] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  async function save() {
    try {
      await saveKelas({ ...form, id: activeKelasId, llmConfig: llmForm })
      setSavedSuccess(true)
      notify('Profil kelas berhasil disimpan.', 'success')
      setTimeout(() => setSavedSuccess(false), 2000)
    } catch (err: any) {
      notify(err.message || 'Gagal menyimpan profil kelas.', 'error')
    }
  }

  async function saveLLM() {
    setLLMConfig(llmForm)
    try {
      await saveKelas({ id: activeKelasId, llmConfig: llmForm })
    } catch {}
    notify('Konfigurasi inferensi AI tersimpan.', 'success')
  }

  function handleApplyOmniRoutePreset() {
    setLlmForm(OMNIROUTE_DEFAULT_PRESET)
    setLLMConfig(OMNIROUTE_DEFAULT_PRESET)
    notify('Preset OmniRoute lokal berhasil dimuat.', 'info')
  }

  async function handleGenerateQuestions() {
    setIsGeneratingQuestions(true)
    notify('Menyusun 30 pertanyaan presensi interaktif...', 'info')
    try {
      setLLMConfig(llmForm)
      const items = await generate30PresensiQuestionsAI()
      setQuestions(items)
      setIsCustom(true)
      notify(`Berhasil menyusun ${items.length} pertanyaan presensi baru.`, 'success')
    } catch (err: any) {
      notify(err.message || 'Gagal menyusun pertanyaan AI.', 'error')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  function handleLoadStandardCurriculum() {
    saveCurriculumQuestions(CURRICULUM_PERTANYAAN_HARIAN)
    setQuestions(CURRICULUM_PERTANYAAN_HARIAN)
    setIsCustom(false)
    notify('30 Pertanyaan kurikulum standar berhasil dimuat.', 'success')
  }

  function handleResetCurriculum() {
    resetCurriculumToDefault()
    setQuestions(CURRICULUM_PERTANYAAN_HARIAN)
    setIsCustom(false)
    notify('Kurikulum presensi dikembalikan ke standar bawaan.', 'info')
  }

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions
    const q = searchQuery.toLowerCase()
    return questions.filter(
      (item) =>
        item.pertanyaan.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.dimensi.toLowerCase().includes(q) ||
        String(item.hariKe).includes(q) ||
        item.pilihan.some((p) => p.label.toLowerCase().includes(q) || p.sifat.toLowerCase().includes(q))
    )
  }, [questions, searchQuery])

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

      {/* Kurikulum & Pertanyaan Presensi Harian */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="text-primary" size={18} />
              <h2 className="font-heading text-sm font-bold text-[var(--text-primary)]">
                Kurikulum & Pertanyaan Presensi Harian
              </h2>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Daftar 30 pertanyaan presensi tematik ramah anak untuk observasi karakteristik siswa setiap hari.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {questions.length} Pertanyaan Aktif
            </span>
            <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--text-muted)]">
              {isCustom ? 'Kustom AI' : 'Standar Kurikulum'}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            disabled={isGeneratingQuestions}
            onClick={handleGenerateQuestions}
            className="flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingQuestions ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>{isGeneratingQuestions ? 'Menyusun 30 Pertanyaan...' : 'Generate Ulang dengan AI'}</span>
          </button>

          <button
            type="button"
            onClick={handleLoadStandardCurriculum}
            className="flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--text-muted)] cursor-pointer"
          >
            <FileCheck size={14} className="text-primary" />
            <span>Muat 30 Pertanyaan Standar</span>
          </button>

          {isCustom && (
            <button
              type="button"
              onClick={handleResetCurriculum}
              className="flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-red-600 hover:border-red-300 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset Bawaan</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLLMConfig(!showLLMConfig)}
            className="ml-auto flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--text-muted)] cursor-pointer"
          >
            <Sliders size={14} className="text-[var(--text-muted)]" />
            <span>Konfigurasi AI</span>
            {showLLMConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Collapsible LLM Config Panel */}
        {showLLMConfig && (
          <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Pengaturan Koneksi Model AI
              </span>
              <button
                type="button"
                onClick={handleApplyOmniRoutePreset}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors hover:bg-emerald-100 cursor-pointer"
              >
                <Radio size={12} className="text-emerald-600" />
                <span>Gunakan OmniRoute Lokal</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="API Endpoint URL"
                  value={llmForm.apiUrl}
                  placeholder="http://127.0.0.1:20128/v1/chat/completions"
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
                placeholder="auto/best-fast atau gpt-4o-mini"
                onChange={(model) => setLlmForm({ ...llmForm, model })}
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={saveLLM}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Save size={13} />
                <span>Simpan Konfigurasi AI</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar & List Header */}
        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Daftar Pertanyaan Presensi ({filteredQuestions.length} dari {questions.length})
            </span>

            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 w-full sm:w-72">
              <Search size={14} className="text-[var(--text-muted)] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hari, pertanyaan, sifat..."
                className="w-full bg-transparent text-xs outline-none text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredQuestions.length === 0 ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--text-muted)]">
                Tidak ada pertanyaan yang cocok dengan pencarian "{searchQuery}".
              </div>
            ) : (
              filteredQuestions.map((item) => {
                const isExpanded = expandedQuestionId === item.id || !!searchQuery.trim()
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors"
                  >
                    <div
                      className="flex items-start justify-between gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedQuestionId(expandedQuestionId === item.id ? null : item.id)}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold px-1.5 shrink-0 mt-0.5">
                          #{item.hariKe}
                        </span>
                        <div>
                          <h3 className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                            {item.pertanyaan}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                            <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 border border-[var(--border)] font-medium">
                              {item.kategori}
                            </span>
                            <span>&bull;</span>
                            <span>{item.dimensi}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 mt-1"
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 border-t border-[var(--border)] pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.pilihan.map((pil, pIdx) => (
                          <div
                            key={pIdx}
                            className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-xs flex flex-col justify-between gap-1"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-[var(--text-primary)] leading-snug">
                                {pil.label}
                              </span>
                              <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                                {pil.sifat}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                              {pil.makna}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
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
