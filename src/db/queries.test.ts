import { describe, expect, it } from 'vitest'
import type { Siswa } from './database'
import { getActiveStudents } from './queries'

const students: Siswa[] = [
  { id: '2', nama: 'Budi', nomorAbsen: 2, jenisKelamin: 'L', potensi: [], aktif: true, createdAt: '' },
  { id: '1', nama: 'Siti', nomorAbsen: 1, jenisKelamin: 'P', potensi: [], aktif: true, createdAt: '' },
  { id: '3', nama: 'Rina', nomorAbsen: 3, jenisKelamin: 'P', potensi: [], aktif: false, createdAt: '' },
]

describe('getActiveStudents', () => {
  it('returns active students sorted by attendance number', () => {
    expect(getActiveStudents(students).map((student) => student.nama)).toEqual(['Siti', 'Budi'])
  })
})
