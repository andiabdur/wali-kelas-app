import { describe, expect, it } from 'vitest'
import { synthesizePsychologicalProfile } from './psychologyEngine'

describe('synthesizePsychologicalProfile', () => {
  it('generates natural and warm character narrative for active/cheerful students', () => {
    const result = synthesizePsychologicalProfile(
      'Aditya Pratama',
      [
        { tanggal: '2026-09-01', jawabanSiswa: 'Jeruk (Asam Manis Kejutan)', status: 'H' },
        { tanggal: '2026-09-02', jawabanSiswa: 'Kelinci / Anjing Setia', status: 'H' },
      ],
      [{ nilai: 88, jenis: 'UH' }],
      [{ isi: 'Sangat aktif berdiskusi dalam kelompok.' }]
    )

    expect(result.narasiKarakter).toContain('Aditya Pratama')
    expect(result.narasiKarakter).not.toContain('Berdasarkan rangkuman observasi harian')
    expect(result.narasiKarakter).not.toContain('keterikatan positif')
    expect(result.narasiKarakter).not.toContain('subjek')
    expect(result.saranPendekatan.length).toBeGreaterThan(15)
    expect(result.rekomendasiBakat.length).toBeGreaterThan(5)
    expect(result.karakterUtama.length).toBeGreaterThan(0)
  })

  it('handles write-in custom answers without robotic language', () => {
    const result = synthesizePsychologicalProfile(
      'Siti Nurhaliza',
      [
        { tanggal: '2026-09-01', jawabanSiswa: 'pengen jadi astronot hebat', status: 'H' },
      ],
      [{ nilai: 78, jenis: 'Tugas' }],
      []
    )

    expect(result.narasiKarakter).toContain('Siti Nurhaliza')
    expect(result.narasiKarakter).toContain('"pengen jadi astronot hebat"')
    expect(result.narasiKarakter).not.toContain('Berdasarkan rangkuman observasi harian')
  })
})
