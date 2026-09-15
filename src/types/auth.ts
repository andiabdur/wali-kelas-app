export type UserRole = 'admin' | 'walikelas'

export interface UserProfile {
  uid: string
  email: string
  nama: string
  role: UserRole
  kelasId?: string
  createdAt?: string
}

export interface Kelas {
  id: string
  nama: string
  tahunAjaran: string
  namaWaliKelas: string
  nipWaliKelas?: string
  namaSekolah: string
  waliKelasUid?: string
  waliKelasEmail?: string
  logoDinas?: string
  logoSekolah?: string
  llmConfig?: {
    apiUrl: string
    apiKey: string
    model: string
  }
  createdAt?: string
  updatedAt?: string
}
