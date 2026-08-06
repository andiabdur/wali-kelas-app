import type { Siswa } from './database'

export function getActiveStudents(students: Siswa[]): Siswa[] {
  return students.filter((student) => student.aktif).sort((a, b) => a.nomorAbsen - b.nomorAbsen)
}
