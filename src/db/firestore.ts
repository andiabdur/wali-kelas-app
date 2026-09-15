import { useState, useEffect } from 'react'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  getDoc,
} from 'firebase/firestore'
import { firestore, firebaseConfig } from '../lib/firebase'
import type { Kelas, UserProfile } from '../types/auth'

export type { Kelas, UserProfile }

export interface Siswa {
  id: string
  kelasId: string
  nama: string
  nisn?: string
  nis?: string
  nomorAbsen: number
  jenisKelamin: 'L' | 'P'
  tempatLahir?: string
  tanggalLahir?: string
  alamat?: string
  namaAyah?: string
  namaIbu?: string
  teleponOrtu?: string
  foto?: string
  potensi: string[]
  aktif: boolean
  createdAt: string
}

export interface Absensi {
  id: string
  kelasId: string
  siswaId: string
  tanggal: string
  status: 'H' | 'I' | 'S' | 'A'
  keterangan?: string
  pertanyaanHariIni?: string
  jawabanSiswa?: string
  dimensiPsikologis?: string
}

export interface AnalisisPsikologis {
  id: string
  kelasId: string
  siswaId: string
  updatedAt: string
  karakterUtama: string[]
  narasiKarakter: string
  saranPendekatan: string
  rekomendasiBakat: string
}

export interface MataPelajaran {
  id: string
  kelasId: string
  nama: string
  urutan: number
  warna?: string
}

export interface Nilai {
  id: string
  kelasId: string
  siswaId: string
  mapelId: string
  jenis: 'kuis' | 'latihan' | 'ulangan' | 'tugas'
  tanggal: string
  nilai: number
  keterangan?: string
}

export interface Catatan {
  id: string
  kelasId: string
  siswaId: string
  tanggal: string
  isi: string
}

export const KATEGORI_POTENSI = [
  { id: 'seni_budaya', label: 'Seni Budaya', iconName: 'Palette' },
  { id: 'olahraga', label: 'Olahraga', iconName: 'Trophy' },
  { id: 'matematika', label: 'Matematika', iconName: 'Calculator' },
  { id: 'bahasa', label: 'Bahasa', iconName: 'BookOpen' },
  { id: 'sains', label: 'Sains', iconName: 'FlaskConical' },
  { id: 'kepemimpinan', label: 'Kepemimpinan', iconName: 'Crown' },
  { id: 'sosial', label: 'Sosial', iconName: 'Users' },
  { id: 'teknologi', label: 'Teknologi', iconName: 'Laptop' },
  { id: 'musik', label: 'Musik', iconName: 'Music' },
  { id: 'literasi', label: 'Literasi', iconName: 'BookMarked' },
]

export function generateId(): string {
  return crypto.randomUUID()
}

// --- REALTIME HOOKS ---

export function useKelas(kelasId: string) {
  const [data, setData] = useState<Kelas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!kelasId) {
      setData(null)
      setLoading(false)
      return
    }
    const docRef = doc(firestore, 'kelas', kelasId)
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setData(snap.data() as Kelas)
      } else {
        setData(null)
      }
      setLoading(false)
    }, (err) => {
      console.error('Error fetching kelas:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [kelasId])

  return { data, loading }
}

export function useAllKelas() {
  const [list, setList] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const colRef = collection(firestore, 'kelas')
    const unsub = onSnapshot(colRef, (snap) => {
      const items: Kelas[] = []
      snap.forEach((d) => items.push(d.data() as Kelas))
      setList(items)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching all kelas:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { list, loading }
}

export function useTeachersList() {
  const [teachers, setTeachers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(firestore, 'users'), where('role', '==', 'walikelas'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: UserProfile[] = []
        snap.forEach((d) => items.push(d.data() as UserProfile))
        items.sort((a, b) => a.nama.localeCompare(b.nama))
        setTeachers(items)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching teachers:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  return { teachers, loading }
}

export function useAllSiswaGlobal() {
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const colRef = collection(firestore, 'siswa')
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const items: Siswa[] = []
        snap.forEach((d) => items.push(d.data() as Siswa))
        setAllSiswa(items)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching all siswa global:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  return { allSiswa, loading }
}

export function useAllAbsensiToday(tanggal?: string) {
  const [records, setRecords] = useState<Absensi[]>([])
  const [loading, setLoading] = useState(true)
  const targetDate = tanggal || new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const q = query(collection(firestore, 'absensi'), where('tanggal', '==', targetDate))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Absensi[] = []
        snap.forEach((d) => items.push(d.data() as Absensi))
        setRecords(items)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching all absensi today:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [targetDate])

  return { records, loading }
}

export function useSiswaList(kelasId: string) {
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!kelasId) {
      setSiswa([])
      setLoading(false)
      return
    }
    const q = query(collection(firestore, 'siswa'), where('kelasId', '==', kelasId))
    const unsub = onSnapshot(q, (snap) => {
      const items: Siswa[] = []
      snap.forEach((d) => items.push(d.data() as Siswa))
      items.sort((a, b) => a.nomorAbsen - b.nomorAbsen)
      setSiswa(items)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching siswa:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [kelasId])

  return { siswa, loading }
}

export function useAbsensiList(kelasId: string, tanggal?: string) {
  const [records, setRecords] = useState<Absensi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!kelasId) {
      setRecords([])
      setLoading(false)
      return
    }
    const constraints = [where('kelasId', '==', kelasId)]
    if (tanggal) {
      constraints.push(where('tanggal', '==', tanggal))
    }
    const q = query(collection(firestore, 'absensi'), ...constraints)
    const unsub = onSnapshot(q, (snap) => {
      const items: Absensi[] = []
      snap.forEach((d) => items.push(d.data() as Absensi))
      setRecords(items)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching absensi:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [kelasId, tanggal])

  return { records, loading }
}

export function useMataPelajaranList(kelasId: string) {
  const [mapel, setMapel] = useState<MataPelajaran[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!kelasId) {
      setMapel([])
      setLoading(false)
      return
    }
    const q = query(collection(firestore, 'mataPelajaran'), where('kelasId', '==', kelasId))
    const unsub = onSnapshot(q, (snap) => {
      const items: MataPelajaran[] = []
      snap.forEach((d) => items.push(d.data() as MataPelajaran))
      items.sort((a, b) => a.urutan - b.urutan)
      setMapel(items)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching mata pelajaran:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [kelasId])

  return { mapel, loading }
}

export function useNilaiList(kelasId: string, siswaId?: string) {
  const [nilai, setNilai] = useState<Nilai[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!kelasId) {
      setNilai([])
      setLoading(false)
      return
    }
    const constraints = [where('kelasId', '==', kelasId)]
    if (siswaId) {
      constraints.push(where('siswaId', '==', siswaId))
    }
    const q = query(collection(firestore, 'nilai'), ...constraints)
    const unsub = onSnapshot(q, (snap) => {
      const items: Nilai[] = []
      snap.forEach((d) => items.push(d.data() as Nilai))
      setNilai(items)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching nilai:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [kelasId, siswaId])

  return { nilai, loading }
}

export function useCatatanList(kelasId: string, siswaId?: string) {
  const [catatan, setCatatan] = useState<Catatan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!kelasId) {
      setCatatan([])
      setLoading(false)
      return
    }
    const constraints = [where('kelasId', '==', kelasId)]
    if (siswaId) {
      constraints.push(where('siswaId', '==', siswaId))
    }
    const q = query(collection(firestore, 'catatan'), ...constraints)
    const unsub = onSnapshot(q, (snap) => {
      const items: Catatan[] = []
      snap.forEach((d) => items.push(d.data() as Catatan))
      items.sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      setCatatan(items)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching catatan:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [kelasId, siswaId])

  return { catatan, loading }
}

export function useAnalisisPsikologis(kelasId: string, siswaId?: string) {
  const [analisis, setAnalisis] = useState<AnalisisPsikologis | null>(null)

  useEffect(() => {
    if (!kelasId || !siswaId) {
      setAnalisis(null)
      return
    }
    const q = query(
      collection(firestore, 'analisisPsikologis'),
      where('kelasId', '==', kelasId),
      where('siswaId', '==', siswaId)
    )
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setAnalisis(snap.docs[0].data() as AnalisisPsikologis)
      } else {
        setAnalisis(null)
      }
    }, (err) => {
      console.error('Error fetching analisis psikologis:', err)
    })
    return () => unsub()
  }, [kelasId, siswaId])

  return analisis
}

// --- MUTATION ACTIONS ---

export async function saveKelas(kelasData: Partial<Kelas> & { id: string }) {
  const ref = doc(firestore, 'kelas', kelasData.id)
  await setDoc(ref, { ...kelasData, updatedAt: new Date().toISOString() }, { merge: true })
}

export async function addSiswa(siswa: Siswa) {
  const clean = Object.fromEntries(Object.entries(siswa).filter(([_, v]) => v !== undefined))
  await setDoc(doc(firestore, 'siswa', siswa.id), clean)
}

export async function updateSiswa(id: string, data: Partial<Siswa>) {
  const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined))
  await updateDoc(doc(firestore, 'siswa', id), clean)
}

export async function deleteSiswaCascade(siswaId: string, kelasId: string) {
  const batch = writeBatch(firestore)
  batch.delete(doc(firestore, 'siswa', siswaId))

  // Find associated absensi
  const absensiQ = query(collection(firestore, 'absensi'), where('kelasId', '==', kelasId), where('siswaId', '==', siswaId))
  const absensiSnap = await getDocs(absensiQ)
  absensiSnap.forEach((d) => batch.delete(d.ref))

  // Find associated nilai
  const nilaiQ = query(collection(firestore, 'nilai'), where('kelasId', '==', kelasId), where('siswaId', '==', siswaId))
  const nilaiSnap = await getDocs(nilaiQ)
  nilaiSnap.forEach((d) => batch.delete(d.ref))

  // Find associated catatan
  const catatanQ = query(collection(firestore, 'catatan'), where('kelasId', '==', kelasId), where('siswaId', '==', siswaId))
  const catatanSnap = await getDocs(catatanQ)
  catatanSnap.forEach((d) => batch.delete(d.ref))

  // Find associated analisisPsikologis
  const aiQ = query(collection(firestore, 'analisisPsikologis'), where('kelasId', '==', kelasId), where('siswaId', '==', siswaId))
  const aiSnap = await getDocs(aiQ)
  aiSnap.forEach((d) => batch.delete(d.ref))

  await batch.commit()
}

export async function batchSaveAbsensi(
  kelasId: string,
  rows: Array<{
    siswaId: string
    status: Absensi['status']
    pertanyaanHariIni?: string
    jawabanSiswa?: string
    dimensiPsikologis?: string
  }>,
  tanggal: string,
  existingRecords: Absensi[]
) {
  const batch = writeBatch(firestore)
  for (const row of rows) {
    const existing = existingRecords.find((r) => r.siswaId === row.siswaId && r.tanggal === tanggal)
    if (existing) {
      batch.update(doc(firestore, 'absensi', existing.id), {
        status: row.status,
        pertanyaanHariIni: row.pertanyaanHariIni || '',
        jawabanSiswa: row.jawabanSiswa || '',
        dimensiPsikologis: row.dimensiPsikologis || '',
      })
    } else {
      const newId = generateId()
      batch.set(doc(firestore, 'absensi', newId), {
        id: newId,
        kelasId,
        siswaId: row.siswaId,
        tanggal,
        status: row.status,
        pertanyaanHariIni: row.pertanyaanHariIni || '',
        jawabanSiswa: row.jawabanSiswa || '',
        dimensiPsikologis: row.dimensiPsikologis || '',
      })
    }
  }
  await batch.commit()
}

export async function updateAbsensiRecord(id: string, data: Partial<Absensi>) {
  await updateDoc(doc(firestore, 'absensi', id), data)
}

export async function addAbsensiRecord(record: Absensi) {
  await setDoc(doc(firestore, 'absensi', record.id), record)
}

export async function addMataPelajaran(mapel: MataPelajaran) {
  await setDoc(doc(firestore, 'mataPelajaran', mapel.id), mapel)
}

export async function deleteMataPelajaranCascade(mapelId: string, kelasId: string) {
  const batch = writeBatch(firestore)
  batch.delete(doc(firestore, 'mataPelajaran', mapelId))

  const nilaiQ = query(collection(firestore, 'nilai'), where('kelasId', '==', kelasId), where('mapelId', '==', mapelId))
  const nilaiSnap = await getDocs(nilaiQ)
  nilaiSnap.forEach((d) => batch.delete(d.ref))

  await batch.commit()
}

export async function batchSaveNilai(entries: Nilai[]) {
  const batch = writeBatch(firestore)
  for (const entry of entries) {
    batch.set(doc(firestore, 'nilai', entry.id), entry)
  }
  await batch.commit()
}

export async function deleteNilai(id: string) {
  await deleteDoc(doc(firestore, 'nilai', id))
}

export async function addCatatan(catatan: Catatan) {
  await setDoc(doc(firestore, 'catatan', catatan.id), catatan)
}

export async function updateCatatan(id: string, isi: string) {
  await updateDoc(doc(firestore, 'catatan', id), { isi })
}

export async function deleteCatatan(id: string) {
  await deleteDoc(doc(firestore, 'catatan', id))
}

export async function saveAnalisisPsikologis(analisis: AnalisisPsikologis) {
  await setDoc(doc(firestore, 'analisisPsikologis', analisis.id), analisis)
}

export async function deleteAnalisisPsikologis(id: string) {
  await deleteDoc(doc(firestore, 'analisisPsikologis', id))
}

export async function exportAllKelasData(kelasId: string) {
  const [kelasSnap, siswaSnap, absensiSnap, mapelSnap, nilaiSnap, catatanSnap] = await Promise.all([
    getDocs(query(collection(firestore, 'kelas'), where('id', '==', kelasId))),
    getDocs(query(collection(firestore, 'siswa'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'absensi'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'mataPelajaran'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'nilai'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'catatan'), where('kelasId', '==', kelasId))),
  ])

  return {
    kelas: kelasSnap.docs.map((d) => d.data()),
    siswa: siswaSnap.docs.map((d) => d.data()),
    absensi: absensiSnap.docs.map((d) => d.data()),
    mataPelajaran: mapelSnap.docs.map((d) => d.data()),
    nilai: nilaiSnap.docs.map((d) => d.data()),
    catatan: catatanSnap.docs.map((d) => d.data()),
    exportedAt: new Date().toISOString(),
  }
}

export async function importAllKelasData(kelasId: string, data: any) {
  const batch = writeBatch(firestore)
  if (data.kelas?.length) {
    batch.set(doc(firestore, 'kelas', kelasId), { ...data.kelas[0], id: kelasId })
  }
  if (data.siswa?.length) {
    for (const item of data.siswa) {
      batch.set(doc(firestore, 'siswa', item.id), { ...item, kelasId })
    }
  }
  if (data.absensi?.length) {
    for (const item of data.absensi) {
      batch.set(doc(firestore, 'absensi', item.id), { ...item, kelasId })
    }
  }
  if (data.mataPelajaran?.length) {
    for (const item of data.mataPelajaran) {
      batch.set(doc(firestore, 'mataPelajaran', item.id), { ...item, kelasId })
    }
  }
  if (data.nilai?.length) {
    for (const item of data.nilai) {
      batch.set(doc(firestore, 'nilai', item.id), { ...item, kelasId })
    }
  }
  if (data.catatan?.length) {
    for (const item of data.catatan) {
      batch.set(doc(firestore, 'catatan', item.id), { ...item, kelasId })
    }
  }
  await batch.commit()
}

export async function resetKelasData(kelasId: string) {
  const [siswaSnap, absensiSnap, mapelSnap, nilaiSnap, catatanSnap, aiSnap] = await Promise.all([
    getDocs(query(collection(firestore, 'siswa'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'absensi'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'mataPelajaran'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'nilai'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'catatan'), where('kelasId', '==', kelasId))),
    getDocs(query(collection(firestore, 'analisisPsikologis'), where('kelasId', '==', kelasId))),
  ])

  const batch = writeBatch(firestore)
  siswaSnap.forEach((d) => batch.delete(d.ref))
  absensiSnap.forEach((d) => batch.delete(d.ref))
  mapelSnap.forEach((d) => batch.delete(d.ref))
  nilaiSnap.forEach((d) => batch.delete(d.ref))
  catatanSnap.forEach((d) => batch.delete(d.ref))
  aiSnap.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

export interface CreateTeacherParams {
  email: string
  password: string
  nama: string
  nip?: string
  kelasId: string
  namaKelasBaru?: string
  tahunAjaran?: string
}

export async function createTeacherAccount(params: CreateTeacherParams): Promise<{ uid: string; kelasId: string }> {
  let targetKelasId = params.kelasId

  // If creating a new class
  if (params.kelasId === 'new_class' || params.namaKelasBaru) {
    const rawName = params.namaKelasBaru?.trim() || 'Kelas Baru'
    targetKelasId =
      'kelas_' +
      rawName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
    if (!targetKelasId || targetKelasId === 'kelas_') {
      targetKelasId = 'kelas_' + generateId().slice(0, 8)
    }

    const kelasRef = doc(firestore, 'kelas', targetKelasId)
    const kelasSnap = await getDoc(kelasRef)
    if (!kelasSnap.exists()) {
      await setDoc(kelasRef, {
        id: targetKelasId,
        nama: rawName,
        tahunAjaran: params.tahunAjaran || '2026/2027',
        namaWaliKelas: params.nama,
        nipWaliKelas: params.nip || '',
        namaSekolah: 'SDN Cijurey I',
        logoDinas: '/logo-majalengka.png',
        logoSekolah: '/logo-sekolah.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  // Create user in Firebase Auth using a secondary Firebase App instance
  // This completely prevents logging out the current admin user!
  const secondaryAppName = `admin-create-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
  let uid = ''
  try {
    const secondaryAuth = getAuth(secondaryApp)
    const cred = await createUserWithEmailAndPassword(secondaryAuth, params.email, params.password)
    if (params.nama) {
      await updateProfile(cred.user, { displayName: params.nama })
    }
    uid = cred.user.uid
  } finally {
    await deleteApp(secondaryApp)
  }

  // Save profile to Firestore users collection
  const userRef = doc(firestore, 'users', uid)
  await setDoc(userRef, {
    uid,
    email: params.email,
    nama: params.nama,
    nip: params.nip || '',
    role: 'walikelas',
    kelasId: targetKelasId,
    createdAt: new Date().toISOString(),
  })

  // Update class document to link this teacher
  if (targetKelasId) {
    const kelasRef = doc(firestore, 'kelas', targetKelasId)
    await setDoc(
      kelasRef,
      {
        id: targetKelasId,
        namaWaliKelas: params.nama,
        nipWaliKelas: params.nip || '',
        waliKelasUid: uid,
        waliKelasEmail: params.email,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  }

  return { uid, kelasId: targetKelasId }
}

export interface UpdateTeacherParams {
  uid: string
  nama: string
  nip?: string
  kelasId: string
  previousKelasId?: string
}

export async function updateTeacherAccount(params: UpdateTeacherParams) {
  const userRef = doc(firestore, 'users', params.uid)
  await setDoc(
    userRef,
    {
      nama: params.nama,
      nip: params.nip || '',
      kelasId: params.kelasId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  )

  // If class changed, unlink previous class
  if (params.previousKelasId && params.previousKelasId !== params.kelasId) {
    const prevKelasRef = doc(firestore, 'kelas', params.previousKelasId)
    await setDoc(
      prevKelasRef,
      {
        waliKelasUid: '',
        waliKelasEmail: '',
        namaWaliKelas: '-',
        nipWaliKelas: '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  }

  // Link new class
  if (params.kelasId) {
    const newKelasRef = doc(firestore, 'kelas', params.kelasId)
    await setDoc(
      newKelasRef,
      {
        namaWaliKelas: params.nama,
        nipWaliKelas: params.nip || '',
        waliKelasUid: params.uid,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  }
}

export async function deleteTeacherAccount(uid: string, kelasId?: string) {
  await deleteDoc(doc(firestore, 'users', uid))

  if (kelasId) {
    const kelasRef = doc(firestore, 'kelas', kelasId)
    await setDoc(
      kelasRef,
      {
        waliKelasUid: '',
        waliKelasEmail: '',
        namaWaliKelas: '-',
        nipWaliKelas: '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  }
}

export async function createNewKelas(nama: string, tahunAjaran = '2026/2027') {
  const rawId =
    'kelas_' +
    nama
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  const id = rawId && rawId !== 'kelas_' ? rawId : 'kelas_' + generateId().slice(0, 8)
  const ref = doc(firestore, 'kelas', id)
  await setDoc(ref, {
    id,
    nama,
    tahunAjaran,
    namaWaliKelas: '-',
    nipWaliKelas: '',
    namaSekolah: 'SDN Cijurey I',
    logoDinas: '/logo-majalengka.png',
    logoSekolah: '/logo-sekolah.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return id
}
