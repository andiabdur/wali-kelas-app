/// <reference types="vite/client" />
import { db, generateId, type AnalisisPsikologis } from '../db/database'
import { CURRICULUM_PERTANYAAN_HARIAN, type PertanyaanItem, synthesizePsychologicalProfile } from './psychologyEngine'

export interface LLMConfig {
  apiUrl: string
  apiKey: string
  model: string
}

export function getLLMConfig(): LLMConfig {
  const localUrl = localStorage.getItem('LLM_API_URL')
  const localKey = localStorage.getItem('LLM_API_KEY')
  const localModel = localStorage.getItem('LLM_MODEL')

  const metaEnv = (import.meta as any).env || {}

  return {
    apiUrl: localUrl || metaEnv.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
    apiKey: localKey || metaEnv.VITE_OPENAI_API_KEY || '',
    model: localModel || metaEnv.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  }
}

export function setLLMConfig(config: Partial<LLMConfig>) {
  if (config.apiUrl !== undefined) localStorage.setItem('LLM_API_URL', config.apiUrl)
  if (config.apiKey !== undefined) localStorage.setItem('LLM_API_KEY', config.apiKey)
  if (config.model !== undefined) localStorage.setItem('LLM_MODEL', config.model)
}

/**
 * Generate 30 Daily Interactive Presensi Questions using OpenAI LLM API
 */
export async function generate30PresensiQuestionsAI(): Promise<PertanyaanItem[]> {
  const config = getLLMConfig()

  if (!config.apiKey.trim()) {
    throw new Error('API Key LLM belum dikonfigurasi. Harap isi API Key di Pengaturan atau file .env.')
  }

  const systemPrompt = `Anda adalah seorang psikolog anak dan ahli pendidikan dasar profesional.
Tugas Anda adalah menghasilkan 30 pertanyaan presensi harian yang seru, mudah, dan menyenangkan untuk siswa SD (Sekolah Dasar).
Setiap pertanyaan harus memiliki makna psikologis yang dapat mencerminkan preferensi emosional, gaya belajar, kecerdasan ganda (Multiple Intelligences), atau orientasi sosial anak.

Keluarkan respon HANYA dalam format JSON Array valid yang memuat 30 objek dengan skema sebagai berikut:
[
  {
    "id": "p1",
    "hariKe": 1,
    "pertanyaan": "String pertanyaan seru",
    "kategori": "String kategori psikologis",
    "dimensi": "String dimensi psikologis",
    "pilihan": [
      { "label": "Opsi A", "makna": "Makna psikologis opsi A", "sifat": "Sifat/Trait" },
      { "label": "Opsi B", "makna": "Makna psikologis opsi B", "sifat": "Sifat/Trait" },
      { "label": "Opsi C", "makna": "Makna psikologis opsi C", "sifat": "Sifat/Trait" },
      { "label": "Opsi D", "makna": "Makna psikologis opsi D", "sifat": "Sifat/Trait" }
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
        { role: 'user', content: 'Tolong buatkan 30 pertanyaan presensi harian interaktif psikologis anak untuk 1 bulan penuh.' },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `Gagal menghubungi API LLM (Status: ${response.status})`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Parse JSON response
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('Respon AI tidak memuat format JSON array yang valid.')
  }

  const items: PertanyaanItem[] = JSON.parse(jsonMatch[0])
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
Respon Presensi Harian Siswa:
${answeredList.map((a) => `- ${a.tanggal}: Pertanyaan "${a.pertanyaanHariIni}" -> Jawaban Siswa "${a.jawabanSiswa}"`).join('\n')}

Data Akademis (Rata-rata nilai: ${avgNilai}):
${nilaiRecords.map((n) => `- Nilai ${n.jenis}: ${n.nilai}`).join('\n')}

Catatan Wali Kelas:
${catatanRecords.map((c) => `- ${c.isi}`).join('\n')}

Berdasarkan data di atas dan referensi psikologi pendidikan anak (Big Five, Holland Themes, Multiple Intelligences), hasilkan analisis naratif kepribadian anak ini dalam format JSON berikut:
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
          content: 'Anda adalah seorang Psikolog Pendidikan Anak yang hangat, empatis, dan berpengalaman. Buatlah analisis psikologis perkembangan anak dalam format JSON yang valid.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `Gagal menghubungi API LLM (Status: ${response.status})`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Respon AI tidak memuat format JSON objek yang valid.')
  }

  const parsed = JSON.parse(jsonMatch[0])
  const result: AnalisisPsikologis = {
    id: generateId(),
    siswaId: '',
    updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    karakterUtama: parsed.karakterUtama || ['Kreatif', 'Empatis', 'Eksploratif'],
    narasiKarakter: parsed.narasiKarakter || '',
    saranPendekatan: parsed.saranPendekatan || '',
    rekomendasiBakat: parsed.rekomendasiBakat || '',
  }

  return result
}
