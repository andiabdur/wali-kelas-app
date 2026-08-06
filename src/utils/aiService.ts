/// <reference types="vite/client" />
import { db, generateId, type AnalisisPsikologis } from '../db/database'
import { CURRICULUM_PERTANYAAN_HARIAN, type PertanyaanItem, synthesizePsychologicalProfile } from './psychologyEngine'

export interface LLMConfig {
  apiUrl: string
  apiKey: string
  model: string
}

export function normalizeApiUrl(url: string): string {
  let trimmed = url.trim()
  if (!trimmed) return 'https://api.openai.com/v1/chat/completions'
  trimmed = trimmed.replace(/\/+$/, '')

  if (trimmed.endsWith('/chat/completions')) {
    return trimmed
  }
  if (trimmed.endsWith('/v1')) {
    return `${trimmed}/chat/completions`
  }
  return `${trimmed}/v1/chat/completions`
}

export function getLLMConfig(): LLMConfig {
  const localUrl = localStorage.getItem('LLM_API_URL')
  const localKey = localStorage.getItem('LLM_API_KEY')
  const localModel = localStorage.getItem('LLM_MODEL')

  const metaEnv = (import.meta as any).env || {}

  const rawUrl = localUrl || metaEnv.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'

  return {
    apiUrl: normalizeApiUrl(rawUrl),
    apiKey: localKey || metaEnv.VITE_OPENAI_API_KEY || '',
    model: localModel || metaEnv.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  }
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

  // Remove markdown fences like ```json ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  // Extract array or object
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
    throw new Error(`Respon AI tidak dapat di-parse sebagai JSON valid. Pastikan model AI mendukung format JSON. Raw: ${candidate.slice(0, 150)}...`)
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
 * Generate 30 Daily Interactive Presensi Questions using OpenAI LLM API
 */
export async function generate30PresensiQuestionsAI(): Promise<PertanyaanItem[]> {
  const config = getLLMConfig()

  if (!config.apiKey.trim()) {
    throw new Error('API Key LLM belum dikonfigurasi. Harap isi API Key di Pengaturan atau file .env.')
  }

  const systemPrompt = `Anda adalah psikolog anak dan pakar pendidikan SD.
Buat 30 pertanyaan presensi harian interaktif dan seru untuk siswa SD (1 bulan penuh).
Setiap pertanyaan memiliki 4 pilihan jawaban yang secara ringkas mencerminkan sifat/karakter emosional anak.

PENTING: Berikan balasan HANYA dalam format JSON Array tanpa teks pengantar atau markdown tambahan.
Skema JSON:
[
  {
    "id": "p1",
    "hariKe": 1,
    "pertanyaan": "Pertanyaan seru untuk anak",
    "kategori": "Kategori Psikologis",
    "dimensi": "Dimensi Psikologis",
    "pilihan": [
      { "label": "Opsi A", "makna": "Makna ringkas A", "sifat": "Sifat A" },
      { "label": "Opsi B", "makna": "Makna ringkas B", "sifat": "Sifat B" },
      { "label": "Opsi C", "makna": "Makna ringkas C", "sifat": "Sifat C" },
      { "label": "Opsi D", "makna": "Makna ringkas D", "sifat": "Sifat D" }
    ]
  }
]`

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Hasilkan 30 pertanyaan presensi harian interaktif psikologis anak dalam format JSON Array.' },
      ],
      temperature: 0.7,
      max_tokens: 3500,
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

  const items = cleanAndParseJSON<PertanyaanItem[]>(content)
  
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Hasil JSON dari AI tidak memuat daftar pertanyaan yang valid.')
  }

  // Save generated questions to localStorage
  localStorage.setItem('AI_GENERATED_QUESTIONS', JSON.stringify(items))
  return items
}

/**
 * Generate Student Psychological Profile Narrative using OpenAI LLM API
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
  const avgNilai = nilaiRecords.length
    ? Math.round(nilaiRecords.reduce((acc, curr) => acc + curr.nilai, 0) / nilaiRecords.length)
    : 0

  const userPrompt = `Nama Siswa: ${namaSiswa}
Jumlah Respon Presensi Interaktif: ${answeredList.length}
Respon Presensi Harian Siswa (termasuk jawaban pilihan & jawaban bebas siswa):
${answeredList.map((a) => `- ${a.tanggal}: Pertanyaan "${a.pertanyaanHariIni}" -> Jawaban Siswa "${a.jawabanSiswa}"`).join('\n')}

Data Akademis (Rata-rata nilai: ${avgNilai}):
${nilaiRecords.map((n) => `- Nilai ${n.jenis}: ${n.nilai}`).join('\n')}

Catatan Wali Kelas:
${catatanRecords.map((c) => `- ${c.isi}`).join('\n')}

Catatan Penting: Siswa dapat memberikan jawaban bebas yang otentik. Analisis jawaban bebas tersebut secara psikologis untuk mengungkap karakter, imajinasi, dan bakat anak secara hangat dan mendalam.

Hasilkan analisis kepribadian anak dalam format JSON berikut:
{
  "karakterUtama": ["Sifat 1", "Sifat 2", "Sifat 3"],
  "narasiKarakter": "Paragraf narasi komprehensif, hangat, dan mendalam tentang dinamika kepribadian dan perkembangan anak ini untuk dibaca wali kelas dan orang tua.",
  "saranPendekatan": "Rekomendasi strategi pendekatan pembelajaran yang paling cocok untuk anak ini.",
  "rekomendasiBakat": "Rekomendasi ekstrakurikuler atau bidang pengembangan bakat yang sesuai."
}`

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
          content: 'Anda adalah seorang Psikolog Pendidikan Anak yang hangat, empatis, dan berpengalaman. Hasilkan respon HANYA dalam format JSON yang valid.',
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
