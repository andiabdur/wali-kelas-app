/// <reference types="vite/client" />
import { db, generateId, type AnalisisPsikologis } from '../db/database'
import { CURRICULUM_PERTANYAAN_HARIAN, type PertanyaanItem, synthesizePsychologicalProfile, saveCurriculumQuestions } from './psychologyEngine'

export interface LLMConfig {
  apiUrl: string
  apiKey: string
  model: string
}

export const OMNIROUTE_CLOUD_PRESET: LLMConfig = {
  apiUrl: 'https://omni.senyap.web.id/v1/chat/completions',
  apiKey: 'sk-25df769ef46500b5-22caec-85267272',
  model: 'auto/best-fast',
}

export const OMNIROUTE_LOCAL_PRESET: LLMConfig = {
  apiUrl: 'http://127.0.0.1:20128/v1/chat/completions',
  apiKey: 'sk-25df769ef46500b5-22caec-85267272',
  model: 'auto/best-fast',
}

export const OMNIROUTE_DEFAULT_PRESET = OMNIROUTE_CLOUD_PRESET

export function normalizeApiUrl(url: string): string {
  let trimmed = url.trim()
  if (!trimmed) return OMNIROUTE_CLOUD_PRESET.apiUrl
  trimmed = trimmed.replace(/\/+$/, '')

  if (trimmed.endsWith('/chat/completions')) {
    return trimmed
  }
  if (trimmed.endsWith('/v1')) {
    return `${trimmed}/chat/completions`
  }
  return `${trimmed}/v1/chat/completions`
}

export function deriveModelsUrl(apiUrl: string): string {
  let trimmed = apiUrl.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/chat/completions')) {
    return trimmed.replace(/\/chat\/completions$/, '/models')
  }
  if (trimmed.endsWith('/v1')) {
    return `${trimmed}/models`
  }
  if (trimmed.endsWith('/models')) {
    return trimmed
  }
  return `${trimmed}/models`
}

export function getLLMConfig(): LLMConfig {
  const localUrl = localStorage.getItem('LLM_API_URL')
  const localKey = localStorage.getItem('LLM_API_KEY')
  const localModel = localStorage.getItem('LLM_MODEL')

  const metaEnv = (import.meta as any).env || {}

  const rawUrl = localUrl || metaEnv.VITE_OPENAI_API_URL || OMNIROUTE_CLOUD_PRESET.apiUrl

  return {
    apiUrl: normalizeApiUrl(rawUrl),
    apiKey: localKey !== null ? localKey : (metaEnv.VITE_OPENAI_API_KEY || OMNIROUTE_CLOUD_PRESET.apiKey),
    model: localModel || metaEnv.VITE_OPENAI_MODEL || OMNIROUTE_CLOUD_PRESET.model,
  }
}

export async function testLLMConnection(config: LLMConfig): Promise<{ ok: boolean; message: string; modelsCount?: number }> {
  if (!config.apiUrl.trim()) {
    return { ok: false, message: 'URL Endpoint masih kosong.' }
  }
  if (!config.apiKey.trim()) {
    return { ok: false, message: 'API Key masih kosong.' }
  }

  const modelsUrl = deriveModelsUrl(config.apiUrl)

  try {
    const res = await fetch(modelsUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      let errorMsg = `HTTP ${res.status} ${res.statusText}`
      try {
        const json = JSON.parse(text)
        if (json.error?.message) errorMsg = json.error.message
      } catch {}
      return { ok: false, message: `Koneksi ditolak: ${errorMsg}` }
    }

    const data = await res.json()
    const modelsCount = Array.isArray(data.data) ? data.data.length : undefined
    return {
      ok: true,
      message: `Koneksi berhasil! Endpoint merespon normal${modelsCount ? ` (${modelsCount} model terdeteksi)` : ''}.`,
      modelsCount,
    }
  } catch (err: any) {
    return {
      ok: false,
      message: `Gagal menghubungi endpoint: ${err.message}. Pastikan alamat host benar dan server mengizinkan akses (CORS).`,
    }
  }
}

export async function fetchAvailableModels(config: LLMConfig): Promise<string[]> {
  if (!config.apiKey.trim()) {
    throw new Error('API Key diperlukan untuk memuat daftar model.')
  }
  const modelsUrl = deriveModelsUrl(config.apiUrl)
  const res = await fetch(modelsUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.apiKey.trim()}`,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let errorMsg = `HTTP ${res.status}`
    try {
      const json = JSON.parse(text)
      if (json.error?.message) errorMsg = json.error.message
    } catch {}
    throw new Error(`Gagal memuat model: ${errorMsg}`)
  }

  const data = await res.json()
  if (!Array.isArray(data.data)) {
    throw new Error('Respon endpoint tidak memuat daftar model yang valid.')
  }

  const ids: string[] = data.data
    .map((m: any) => m.id)
    .filter((id: any): id is string => typeof id === 'string' && id.trim().length > 0)

  ids.sort((a, b) => {
    const aAuto = a.startsWith('auto/')
    const bAuto = b.startsWith('auto/')
    if (aAuto && !bAuto) return -1
    if (!aAuto && bAuto) return 1
    return a.localeCompare(b)
  })

  return ids
}

export function setLLMConfig(config: Partial<LLMConfig>) {
  if (config.apiUrl !== undefined) localStorage.setItem('LLM_API_URL', normalizeApiUrl(config.apiUrl))
  if (config.apiKey !== undefined) localStorage.setItem('LLM_API_KEY', config.apiKey)
  if (config.model !== undefined) localStorage.setItem('LLM_MODEL', config.model)
}

/**
 * Helper to clean markdown code blocks and parse JSON safely (with repair for truncated arrays)
 */
function cleanAndParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim()

  // 1. Strip reasoning / thinking tags like <think>...</think> produced by reasoning models
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  // 2. Remove markdown code fences like ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  // 3. Try direct JSON parse first
  try {
    return JSON.parse(cleaned)
  } catch {}

  // 4. Identify whether outermost structure is an object or array
  const firstBrace = cleaned.indexOf('{')
  const firstBracket = cleaned.indexOf('[')

  let candidate = cleaned
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = cleaned.lastIndexOf('}')
    if (lastBrace > firstBrace) {
      candidate = cleaned.slice(firstBrace, lastBrace + 1)
    }
  } else if (firstBracket !== -1) {
    const lastBracket = cleaned.lastIndexOf(']')
    if (lastBracket > firstBracket) {
      candidate = cleaned.slice(firstBracket, lastBracket + 1)
    }
  }

  try {
    return JSON.parse(candidate)
  } catch (firstErr) {
    // Attempt auto-repair for truncated array
    if (candidate.startsWith('[')) {
      const lastObjIndex = candidate.lastIndexOf('}')
      if (lastObjIndex > 0) {
        try {
          const repaired = candidate.substring(0, lastObjIndex + 1) + ']'
          return JSON.parse(repaired)
        } catch {}
      }
    }
    // Attempt auto-repair for truncated object
    if (candidate.startsWith('{')) {
      const lastQuoteIndex = candidate.lastIndexOf('"')
      if (lastQuoteIndex > 0) {
        try {
          const repaired = candidate.substring(0, lastQuoteIndex + 1) + '}'
          return JSON.parse(repaired)
        } catch {}
      }
    }
    throw new Error(`Respon AI tidak dapat di-parse sebagai JSON valid. Raw: ${candidate.slice(0, 150)}...`)
  }
}

/**
 * Extract content from response supporting both standard JSON and SSE streaming format (data: {...})
 */
async function extractContentFromResponse(response: Response): Promise<string> {
  const text = await response.text()

  // 1. Try standard JSON parse
  try {
    const data = JSON.parse(text)
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content
    }
    if (data.choices?.[0]?.text) {
      return data.choices[0].text
    }
    if (data.output?.text) {
      return data.output.text
    }
  } catch {}

  // 2. Try parsing Server-Sent Events (SSE) streaming format ("data: {...}")
  if (text.includes('data:')) {
    const lines = text.split('\n')
    let accumulatedContent = ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('data:') && !trimmed.includes('[DONE]')) {
        const jsonStr = trimmed.slice(5).trim()
        try {
          const parsed = JSON.parse(jsonStr)
          const deltaContent =
            parsed.choices?.[0]?.delta?.content ||
            parsed.choices?.[0]?.message?.content ||
            ''
          accumulatedContent += deltaContent
        } catch {}
      }
    }
    if (accumulatedContent.trim()) {
      return accumulatedContent.trim()
    }
  }

  return text.trim()
}

/**
 * Generate 30 Daily Interactive Presensi Questions using OpenAI / OmniRoute LLM API
 */
export async function generate30PresensiQuestionsAI(): Promise<PertanyaanItem[]> {
  const config = getLLMConfig()

  if (!config.apiKey.trim()) {
    throw new Error('API Key LLM belum dikonfigurasi. Harap isi API Key di menu Pengaturan.')
  }

  const systemPrompt = `Anda adalah seorang pendidik SD dan pengamat karakter anak yang ramah, kreatif, dan menyenangkan.
Tugas Anda adalah membuat 30 pertanyaan presensi harian yang sangat simpel, seru, dan bernuansa 'gue banget' untuk siswa SD (1 bulan penuh).
Topik pertanyaan meliputi: buah kesukaan, baju/pakaian favorit liburan, negara/tempat impian, hewan paling lucu, makanan sarapan impian, minuman segar, kegiatan sore, kekuatan superhero, cita-cita, dll.

Setiap pertanyaan memiliki 4 pilihan jawaban yang mudah dipilih siswa dan mencerminkan kecenderungan karakter anak secara positif.

PENTING: Berikan balasan HANYA dalam format JSON Array tanpa teks pengantar atau markdown tambahan.
Skema JSON:
[
  {
    "id": "p1",
    "hariKe": 1,
    "pertanyaan": "Kalau boleh milih, buah apa yang paling 'kamu banget'?",
    "kategori": "Preferensi Diri",
    "dimensi": "Minat & Karakter",
    "pilihan": [
      { "label": "Pisang (Manis & Bikin Energi)", "makna": "Enerjik, aktif, dan penuh semangat", "sifat": "Enerjik" },
      { "label": "Apel (Renyah & Segar)", "makna": "Praktis, jujur, dan terstruktur", "sifat": "Praktis" },
      { "label": "Jeruk (Asam Manis Kejutan)", "makna": "Ceria, eksploratif, menyukai hal baru", "sifat": "Ceria" },
      { "label": "Semangka (Segar & Berbagi)", "makna": "Empatis, ramah, dan suka berbagi", "sifat": "Empatis" }
    ]
  }
]`

  let response: Response
  try {
    response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Hasilkan 30 pertanyaan presensi harian interaktif dan ramah anak ("gue banget") dalam format JSON Array dari hari ke-1 sampai hari ke-30.' },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    })
  } catch (networkErr: any) {
    throw new Error(`Gagal terhubung ke endpoint LLM (${config.apiUrl}). Pastikan server/gateway AI aktif dan mengizinkan CORS: ${networkErr.message}`)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    let msg = `Gagal menghubungi API LLM (HTTP Status: ${response.status})`
    try {
      const errJson = JSON.parse(errorText)
      if (errJson.error?.message) msg = errJson.error.message
    } catch {}
    throw new Error(msg)
  }

  const content = await extractContentFromResponse(response)

  if (!content.trim()) {
    throw new Error('Respon dari API LLM kosong.')
  }

  const items = cleanAndParseJSON<PertanyaanItem[]>(content)
  
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Hasil JSON dari AI tidak memuat daftar pertanyaan yang valid.')
  }

  // Ensure each item has an id and hariKe
  const formattedItems: PertanyaanItem[] = items.map((item, index) => ({
    ...item,
    id: item.id || `p${index + 1}`,
    hariKe: item.hariKe || index + 1,
  }))

  // Save generated questions using helper which dispatches storage event
  saveCurriculumQuestions(formattedItems)
  return formattedItems
}

/**
 * Generate Student Character Profile Narrative using OpenAI LLM API
 */
export interface ExtraStudentContext {
  jenisKelamin?: 'L' | 'P'
  potensi?: string[]
  mapelNames?: Record<string, string>
}

/**
 * Generate Student Character Profile Narrative using OpenAI LLM API
 */
export async function generateStudentPsychologicalProfileAI(
  namaSiswa: string,
  absensiRecords: Array<{ tanggal: string; jawabanSiswa?: string; pertanyaanHariIni?: string; status: string }>,
  nilaiRecords: Array<{ nilai: number; jenis: string; mapelId?: string }>,
  catatanRecords: Array<{ isi: string }>,
  extra?: ExtraStudentContext
): Promise<AnalisisPsikologis> {
  const config = getLLMConfig()

  if (!config.apiKey.trim()) {
    throw new Error('API Key belum dikonfigurasi. Harap pilih preset OmniRoute atau masukkan API Key di menu Pengaturan.')
  }

  const answeredList = absensiRecords.filter((a) => a.jawabanSiswa && a.jawabanSiswa.trim() !== '')
  const totalHadir = absensiRecords.filter((a) => a.status === 'H').length
  const totalIzin = absensiRecords.filter((a) => a.status === 'I').length
  const totalSakit = absensiRecords.filter((a) => a.status === 'S').length
  const totalAlpa = absensiRecords.filter((a) => a.status === 'A').length
  const totalAbsen = absensiRecords.length || 1
  const persenHadir = Math.round((totalHadir / totalAbsen) * 100)
  const avgNilai = nilaiRecords.length
    ? Math.round(nilaiRecords.reduce((acc, curr) => acc + curr.nilai, 0) / nilaiRecords.length)
    : 0

  const systemPrompt = `Anda adalah seorang Psikolog Pendidikan Anak dan Wali Kelas Sekolah Dasar (SD) yang sangat berpengalaman, empatis, dan berwawasan mendalam.
Tugas Anda adalah melakukan ANALISIS PSIKOLOGIS, KARAKTERISTIK, DAN POTENSI SISWA SECARA MENDALAM, OTENTIK, DAN BEBAS DARI TEMPLATE KALIMAT KAKU berdasarkan data pengamatan nyata.

PANDUAN ANALISIS (MUTLAK & BEBAS TEMPLATE):
1. BUKAN TEMPLATE: Dilarang keras menggunakan pola kalimat kaku yang berulang ("Dalam keseharian di kelas...", "Tingkat kehadirannya sangat baik...", "Di bidang pelajaran..."). Tulis analisis yang hidup, mengalir bebas, dan benar-benar personal untuk anak ini.
2. TELAAH MAKNA JAWABAN SISWA: Analisis secara mendalam bagaimana pilihan-pilihan jawaban santai yang dipilih siswa saat presensi pagi (misal: pilihan buah, pakaian, hewan kesukaan, superhero impian, tempat liburan, dll) mencerminkan cara berpikir, kepekaan emosional, nilai hidup, serta interaksi sosialnya.
3. KORELASIKAN DENGAN AKADEMIS & CATATAN GURU: Hubungkan kepribadian anak dengan performa akademisnya dan catatan interaksi guru di kelas. Ungkapkan bagaimana anak menghadapi tantangan belajar.
4. GAYA PENULISAN: Bahasa Indonesia yang kaya, hangat, berjiwa pendidik, mengalir alami, dan berwawasan mendalam untuk dibaca wali kelas dan orang tua murid.
5. STRICT RULES:
   - Dilarang menggunakan tanda em dash (—).
   - Dilarang menggunakan istilah birokratis kaku atau jargon AI klise.
6. SARAN PENDEKATAN: Berikan panduan bimbingan yang taktis, personal, dan relevan dengan kepribadian anak ini (untuk diterapkan guru di kelas dan orang tua di rumah).
7. REKOMENDASI BAKAT: Sebutkan 2 sampai 4 bidang minat, talenta, atau ekstrakurikuler SD yang paling sesuai untuk memfasilitasi potensinya.

Format balasan HARUS JSON valid tanpa markdown pembungkus:
{
  "karakterUtama": ["Sifat 1", "Sifat 2", "Sifat 3"],
  "narasiKarakter": "Ulasan karakter dan psikologis siswa yang mendalam, kaya wawasan, mengalir alami, dan personal...",
  "saranPendekatan": "Saran pendekatan pembelajaran dan pendampingan personal...",
  "rekomendasiBakat": "Rekomendasi ekstrakurikuler atau bidang pengembangan bakat..."
}`

  const genderLabel = extra?.jenisKelamin === 'L' ? 'Laki-laki' : extra?.jenisKelamin === 'P' ? 'Perempuan' : ''
  const potensiList = extra?.potensi && extra.potensi.length > 0 ? extra.potensi.join(', ') : 'Belum ditandai khusus'
  const mapelNames = extra?.mapelNames || {}

  const nilaiFormatted = nilaiRecords.map((n) => {
    const mapelName = n.mapelId && mapelNames[n.mapelId] ? mapelNames[n.mapelId] : 'Mata Pelajaran'
    return `- ${mapelName} (${n.jenis}): ${n.nilai}`
  }).join('\n')

  const userPrompt = `Data Observasi Siswa:
Nama: ${namaSiswa}${genderLabel ? ` (${genderLabel})` : ''}
Rekap Kehadiran: ${persenHadir}% hadir (${totalHadir} Hadir, ${totalIzin} Izin, ${totalSakit} Sakit, ${totalAlpa} Alpa dari ${totalAbsen} hari)
Minat/Potensi Terdaftar: ${potensiList}

Data Akademis (Rata-rata kelas: ${avgNilai}):
${nilaiRecords.length > 0 ? nilaiFormatted : '(Belum ada data nilai)'}

Pilihan Jawaban Santai Presensi Harian Siswa:
${answeredList.length > 0 ? answeredList.map((a) => `- ${a.tanggal}: Pertanyaan "${a.pertanyaanHariIni || 'Pertanyaan presensi'}" -> Pilihan anak: "${a.jawabanSiswa}"`).join('\n') : '(Belum ada respon santai yang tercatat)'}

${catatanRecords.length > 0 ? `Catatan Observasi Guru di Kelas:\n${catatanRecords.map((c) => `- ${c.isi}`).join('\n')}` : ''}

Lakukan analisis psikologis dan kepribadian ${namaSiswa} secara mendalam dan otentik. Tuliskan dalam format JSON yang ditentukan.`

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    let msg = `Gagal menghubungi API LLM (HTTP Status: ${response.status})`
    try {
      const errJson = JSON.parse(errorText)
      if (errJson.error?.message) msg = errJson.error.message
    } catch {}
    throw new Error(msg)
  }

  const content = await extractContentFromResponse(response)

  if (!content.trim()) {
    throw new Error('Respon dari API LLM kosong.')
  }

  const parsed = cleanAndParseJSON<any>(content)
  const root = Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' ? parsed[0] : parsed

  if (!root || typeof root !== 'object') {
    throw new Error('Format respon AI tidak dapat dibaca sebagai objek JSON.')
  }

  const rawTraits = root.karakterUtama || root.karakter_utama || root.karakter || root.traits
  const karakterUtama = Array.isArray(rawTraits) && rawTraits.length > 0
    ? rawTraits.map((t: any) => String(t).trim()).filter(Boolean)
    : ['Kreatif', 'Tekun', 'Santun']

  const narasi = root.narasiKarakter || root.narasi_karakter || root.narasi || root.analisis || root.deskripsi || root.profile || ''
  const saran = root.saranPendekatan || root.saran_pendekatan || root.saran || root.pendekatan || ''
  const bakat = root.rekomendasiBakat || root.rekomendasi_bakat || root.bakat || root.ekstrakurikuler || ''

  const result: AnalisisPsikologis = {
    id: generateId(),
    siswaId: '',
    updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    karakterUtama,
    narasiKarakter: String(narasi || '').trim(),
    saranPendekatan: String(saran || '').trim(),
    rekomendasiBakat: String(bakat || '').trim(),
  }

  if (!result.narasiKarakter) {
    throw new Error('AI tidak mengembalikan narasi karakter yang memadai. Silakan coba analisis ulang.')
  }

  return result
}
