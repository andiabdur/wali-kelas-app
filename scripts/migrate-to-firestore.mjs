import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore'
import * as fs from 'fs'

// Read .env
const envContent = fs.readFileSync('./.env', 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) env[match[1]] = match[2]?.trim() || ''
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function getOrCreateUser(email, password, displayName) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    console.log(`[AUTH] Akun baru dibuat: ${email} (UID: ${cred.user.uid})`)
    return cred.user
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      console.log(`[AUTH] Akun sudah ada, berhasil login: ${email} (UID: ${cred.user.uid})`)
      return cred.user
    }
    throw e
  }
}

async function migrate() {
  console.log('--- MEMULAI MIGRASI DATA WALI KELAS KE FIREBASE ---')

  // 1. Akun Admin
  const adminUser = await getOrCreateUser(
    'admin@sdncijurey1.sch.id',
    'WaliKelas2026!',
    'Administrator'
  )
  await setDoc(doc(db, 'users', adminUser.uid), {
    uid: adminUser.uid,
    email: 'admin@sdncijurey1.sch.id',
    nama: 'Administrator Sekolah',
    role: 'admin',
    createdAt: new Date().toISOString(),
  })
  console.log('[USER] Profil Admin disimpan di Firestore.')

  // 2. Akun Wali Kelas V (Evi Purnamasari)
  const eviUser = await getOrCreateUser(
    'evi.purnamasari@sdncijurey1.sch.id',
    'WaliKelas2026!',
    'Evi Purnamasari, S.pd'
  )
  const kelasId = 'kelas_v'

  await setDoc(doc(db, 'users', eviUser.uid), {
    uid: eviUser.uid,
    email: 'evi.purnamasari@sdncijurey1.sch.id',
    nama: 'Evi Purnamasari, S.pd',
    role: 'walikelas',
    kelasId: kelasId,
    createdAt: new Date().toISOString(),
  })
  console.log('[USER] Profil Wali Kelas V disimpan di Firestore.')

  // 3. Baca backup JSON
  const backupPath = './wali-kelas-backup-2026-09-11.json'
  if (!fs.existsSync(backupPath)) {
    throw new Error(`File ${backupPath} tidak ditemukan!`)
  }
  const rawData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))
  console.log(`[DATA] Membaca data backup: ${rawData.siswa?.length} siswa, ${rawData.absensi?.length} absensi, ${rawData.mataPelajaran?.length} mapel, ${rawData.nilai?.length} nilai.`)

  // 4. Buat dokumen Kelas V
  const kelasInfo = rawData.kelas?.[0] || {
    nama: 'Kelas V',
    tahunAjaran: '2026/2027',
    namaWaliKelas: 'Evi Purnamasari, S.pd',
    namaSekolah: 'SDN Cijurey I',
    nipWaliKelas: '23123213123123',
  }

  await setDoc(doc(db, 'kelas', kelasId), {
    id: kelasId,
    nama: kelasInfo.nama || 'Kelas V',
    tahunAjaran: kelasInfo.tahunAjaran || '2026/2027',
    namaWaliKelas: kelasInfo.namaWaliKelas || 'Evi Purnamasari, S.pd',
    nipWaliKelas: kelasInfo.nipWaliKelas || '23123213123123',
    namaSekolah: kelasInfo.namaSekolah || 'SDN Cijurey I',
    waliKelasUid: eviUser.uid,
    waliKelasEmail: 'evi.purnamasari@sdncijurey1.sch.id',
    logoDinas: '/logo-majalengka.png',
    logoSekolah: '/logo-sekolah.png',
    updatedAt: new Date().toISOString(),
  })
  console.log(`[KELAS] Data Kelas V (${kelasId}) disimpan.`)

  // 5. Migrasi Siswa
  if (rawData.siswa && rawData.siswa.length > 0) {
    const batch = writeBatch(db)
    for (const item of rawData.siswa) {
      const ref = doc(db, 'siswa', item.id)
      batch.set(ref, {
        ...item,
        kelasId: kelasId,
      })
    }
    await batch.commit()
    console.log(`[SISWA] Berhasil menyimpan ${rawData.siswa.length} data siswa.`)
  }

  // 6. Migrasi Absensi
  if (rawData.absensi && rawData.absensi.length > 0) {
    // Firestore batch limit is 500, we have 80 items
    const batch = writeBatch(db)
    for (const item of rawData.absensi) {
      const ref = doc(db, 'absensi', item.id)
      batch.set(ref, {
        ...item,
        kelasId: kelasId,
      })
    }
    await batch.commit()
    console.log(`[ABSENSI] Berhasil menyimpan ${rawData.absensi.length} data presensi.`)
  }

  // 7. Migrasi Mata Pelajaran
  if (rawData.mataPelajaran && rawData.mataPelajaran.length > 0) {
    const batch = writeBatch(db)
    for (const item of rawData.mataPelajaran) {
      const ref = doc(db, 'mataPelajaran', item.id)
      batch.set(ref, {
        ...item,
        kelasId: kelasId,
      })
    }
    await batch.commit()
    console.log(`[MAPEL] Berhasil menyimpan ${rawData.mataPelajaran.length} mata pelajaran.`)
  }

  // 8. Migrasi Nilai
  if (rawData.nilai && rawData.nilai.length > 0) {
    const batch = writeBatch(db)
    for (const item of rawData.nilai) {
      const ref = doc(db, 'nilai', item.id)
      batch.set(ref, {
        ...item,
        kelasId: kelasId,
      })
    }
    await batch.commit()
    console.log(`[NILAI] Berhasil menyimpan ${rawData.nilai.length} data nilai evaluasi.`)
  }

  // 9. Migrasi Catatan (jika ada)
  if (rawData.catatan && rawData.catatan.length > 0) {
    const batch = writeBatch(db)
    for (const item of rawData.catatan) {
      const ref = doc(db, 'catatan', item.id)
      batch.set(ref, {
        ...item,
        kelasId: kelasId,
      })
    }
    await batch.commit()
    console.log(`[CATATAN] Berhasil menyimpan ${rawData.catatan.length} catatan observasi.`)
  }

  console.log('=== MIGRASI SELESAI DENGAN SUKSES ===')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migrasi gagal:', err)
  process.exit(1)
})
