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

  // 3. Extract array or object
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
  const objectMatch = cleaned.match(/\{[\s\S]*\}/)

  const candidate = arrayMatch ? arrayMatch[0] : (objectMatch ? objectMatch[0] : cleaned)

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
    throw new Error(`Respon AI tidak dapat di-parse sebagai JSON valid. Pastikan model AI merespon dengan format JSON. Raw: ${candidate.slice(0, 150)}...`)
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
export async function generateStudentPsychologicalProfileAI(
  namaSiswa: string,
  absensiRecords: Array<{ tanggal: string; jawabanSiswa?: string; pertanyaanHariIni?: string; status: string }>,
  nilaiRecords: Array<{ nilai: number; jenis: string }>,
  catatanRecords: Array<{ isi: string }>
): Promise<AnalisisPsikologis> {
  const config = getLLMConfig()

  // Fallback to local heuristic engine if API key is not provided
  if (!config.apiKey.trim()) {
    const fallback = synthesizePsychologicalProfile(namaSiswa, absensiRecords, nilaiRecords, catatanRecords)
    const result: AnalisisPsikologis = {
      id: generateId(),
      siswaId: '',
      updatedAt: fallback.updatedAt,
      karakterUtama: fallback.karakterUtama,
      narasiKarakter: fallback.narasiKarakter,
      saranPendekatan: fallback.saranPendekatan,
      rekomendasiBakat: fallback.rekomendasiBakat,
    }
    return result
  }

  const answeredList = absensiRecords.filter((a) => a.jawabanSiswa && a.jawabanSiswa.trim() !== '')
  const totalHadir = absensiRecords.filter((a) => a.status === 'H').length
  const totalAbsen = absensiRecords.length || 1
  const persenHadir = Math.round((totalHadir / totalAbsen) * 100)
  const avgNilai = nilaiRecords.length
    ? Math.round(nilaiRecords.reduce((acc, curr) => acc + curr.nilai, 0) / nilaiRecords.length)
    : 0

  const systemPrompt = `Anda adalah seorang Wali Kelas Sekolah Dasar (SD) yang bijaksana, hangat, kebapakan/keibuan, dan sangat mengenal kepribadian murid-muridnya.
Tugas Anda adalah menulis narasi pengamatan karakter dan perkembangan siswa untuk laporan wali kelas yang akan dibaca oleh guru dan orang tua murid.

ATURAN GAYA BAHASA (MUTLAK):
1. GUNAKAN BAHASA GURU ASLI: Tulis dalam bahasa Indonesia yang mengalir luwes, hangat, komunikatif, dan membumi.
2. DILARANG KERAS MENGGUNAKAN BAHASA ROBOT, JARGON PSIKOMETRI KAKU, ATAU AI SLOP:
   - JANGAN PERNAH gunakan kalimat klise seperti: "Berdasarkan rangkuman observasi...", "Subjek menunjukkan indikator afektif...", "Secara holistik...", "Spektrum kepribadian...", dsb.
   - JANGAN PERNAH gunakan tanda em dash (—).
3. CERITAKAN PERILAKU NYATA:
   - Ceritakan bagaimana sikap anak di kelas, pergaulannya dengan sesama teman, rasa ingin tahunya saat belajar, dan apa yang membuatnya bersemangat.
   - Singgung pilihan presensi "gue banget" atau jawaban santai siswa sebagai cerminan minat dan karakter otentik anak.
   - Buat narasi dalam 2 paragraf yang rapi dan mengalir enak dibaca.
4. SARAN PENDEKATAN KONKRET:
   - Berikan rekomendasi taktis yang ramah dan langsung bisa dipraktikkan guru di kelas atau orang tua di rumah.
5. REKOMENDASI BAKAT:
   - Sebutkan 2 sampai 4 kegiatan atau ekstrakurikuler SD yang nyata (misal: Seni Gambar, Pramuka, Futsal, Sains Cilik).

Format balasan WAJIB berupa JSON murni:
{
  "karakterUtama": ["Sifat 1", "Sifat 2", "Sifat 3"],
  "narasiKarakter": "Paragraf narasi karakter anak yang mengalir hangat dan luwes...",
  "saranPendekatan": "Saran pendekatan taktis bagi guru dan orang tua...",
  "rekomendasiBakat": "Daftar ekskul atau bidang minat yang cocok (dipisahkan koma)..."
}`

  const userPrompt = `Data Siswa:
Nama: ${namaSiswa}
Kehadiran: ${persenHadir}% hadir (${totalHadir} dari ${totalAbsen} pertemuan)
Rata-rata Nilai: ${avgNilai}

Pilihan Jawaban Santai Siswa Saat Presensi Pagi:
${answeredList.length > 0 ? answeredList.slice(-10).map((a) => `- Pertanyaan "${a.pertanyaanHariIni}" -> Pilihan anak: "${a.jawabanSiswa}"`).join('\n') : '(Belum ada respon santai yang tercatat)'}

${catatanRecords.length > 0 ? `Catatan Observasi Guru di Kelas:\n${catatanRecords.map((c) => `- ${c.isi}`).join('\n')}` : ''}

Tuliskan catatan profil karakter untuk ${namaSiswa} dengan gaya bahasa wali kelas yang hidup, luwes, dan hangat.`

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

  const fallback = synthesizePsychologicalProfile(namaSiswa, absensiRecords, nilaiRecords, catatanRecords)
  const parsed = cleanAndParseJSON<any>(content)
  const result: AnalisisPsikologis = {
    id: generateId(),
    siswaId: '',
    updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    karakterUtama: (Array.isArray(parsed.karakterUtama) && parsed.karakterUtama.length > 0) ? parsed.karakterUtama : fallback.karakterUtama,
    narasiKarakter: parsed.narasiKarakter || parsed.narasi || parsed.profile || parsed.deskripsi || fallback.narasiKarakter,
    saranPendekatan: parsed.saranPendekatan || parsed.saran || parsed.pendekatan || fallback.saranPendekatan,
    rekomendasiBakat: parsed.rekomendasiBakat || parsed.bakat || parsed.ekstrakurikuler || fallback.rekomendasiBakat,
  }

  return result
}
