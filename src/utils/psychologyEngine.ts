export interface PertanyaanItem {
  id: string
  hariKe: number
  pertanyaan: string
  kategori: string
  dimensi: string
  pilihan: {
    label: string
    makna: string
    sifat: string
  }[]
}

export const CURRICULUM_PERTANYAAN_HARIAN: PertanyaanItem[] = [
  {
    id: 'p1',
    hariKe: 1,
    pertanyaan: 'Kalau boleh milih, buah apa yang paling "kamu banget"?',
    kategori: 'Preferensi Diri',
    dimensi: 'Sensori & Karakter',
    pilihan: [
      { label: 'Pisang (Manis & Bikin Energi)', makna: 'Praktis, energik, siap beraktivitas fisik, dan penuh semangat', sifat: 'Enerjik' },
      { label: 'Apel (Renyah & Segar)', makna: 'Terstruktur, menyukai kerapian, konsisten, dan jujur', sifat: 'Terstruktur' },
      { label: 'Jeruk (Asam Manis Kejutan)', makna: 'Ceria, komunikatif, mampu menyegarkan suasana kelompok', sifat: 'Ceria' },
      { label: 'Semangka (Segar & Berbagi)', makna: 'Empatis, ramah, suka berbagi, dan memperhatikan teman', sifat: 'Empatis' },
    ],
  },
  {
    id: 'p2',
    hariKe: 2,
    pertanyaan: 'Baju/pakaian seperti apa yang paling nyaman kamu pakai saat liburan?',
    kategori: 'Gaya & Ekspresi Diri',
    dimensi: 'Ekspresi Diri',
    pilihan: [
      { label: 'Kaos Santai & Celana Pendek', makna: 'Aktif, praktis, mengutamakan kebebasan bergerak dan spontanitas', sifat: 'Spontan' },
      { label: 'Kemeja / Gaun Rapi Cantik', makna: 'Mandiri, menghargai kerapian, berwibawa, dan memperhatikan penampilan', sifat: 'Rapi' },
      { label: 'Baju Olahraga / Jersey Tim', makna: 'Penyuka kerjasama tim, kompetitif secara positif, dan sehat', sifat: 'Sportif' },
      { label: 'Jaket / Hoodie Hype & Keren', makna: 'Kreatif, percaya diri, menyukai gaya unik dan ekspresif', sifat: 'Kreatif' },
    ],
  },
  {
    id: 'p3',
    hariKe: 3,
    pertanyaan: 'Jika diberi tiket pesawat gratis, negara mana yang paling ingin kamu kunjungi?',
    kategori: 'Aspirasi & Wawasan',
    dimensi: 'Eksplorasi Dunia',
    pilihan: [
      { label: 'Jepang (Negara Teknologi & Anime)', makna: 'Menyukai inovasi, teknologi, cerita imajinatif, dan ketelitian', sifat: 'Inovatif' },
      { label: 'Arab Saudi (Mekkah & Madinah)', makna: 'Memiliki nilai religius yang kuat, santun, dan menghargai kedamaian', sifat: 'Religius' },
      { label: 'Korea / Eropa (Negara Pemandangan Indah)', makna: 'Menyukai seni, keindahan alam, musik, dan budaya populer', sifat: 'Artistik' },
      { label: 'Luar Angkasa / Wahana Alam Luar Negeri', makna: 'Jiwa petualang, pemberani, dan haus akan pengetahuan ilmiah baru', sifat: 'Petualang' },
    ],
  },
  {
    id: 'p4',
    hariKe: 4,
    pertanyaan: 'Hewan apa yang menurutmu paling lucu dan ingin kamu jadikan sahabat?',
    kategori: 'Sosial & Afeksi',
    dimensi: 'Kepekaan Emosional',
    pilihan: [
      { label: 'Kucing Lucu', makna: 'Penyayang, peka terhadap perasaan sesama, dan mandiri', sifat: 'Empatis' },
      { label: 'Kelinci / Anjing Setia', makna: 'Sangat bersahabat, setia kawan, dan suka berinteraksi aktif', sifat: 'Sosial' },
      { label: 'Burung Warna-warni', makna: 'Menyukai kebebasan ekspresi, seni, dan musik', sifat: 'Ekspresif' },
      { label: 'Ikan Hias Cantik', makna: 'Tenang, pengamat yang baik, dan tidak mudah terpengaruh', sifat: 'Reflektif' },
    ],
  },
  {
    id: 'p5',
    hariKe: 5,
    pertanyaan: 'Makanan sarapan impian apa yang paling bikin kamu bersemangat sekolah?',
    kategori: 'Gaya Hidup & Mood',
    dimensi: 'Antusiasme Pagi',
    pilihan: [
      { label: 'Nasi Goreng Telur Spesial', makna: 'Tradisional, menyukai kehangatan suasana rumah, dan penuh energi', sifat: 'Fokus' },
      { label: 'Roti Bakar Cokelat Keju', makna: 'Praktis, manis, menyukai kerapian dan kemudahan', sifat: 'Praktis' },
      { label: 'Sereal / Pancake Buah', makna: 'Ceria, menyukai variasi warna-warni, dan eksploratif', sifat: 'Ceria' },
      { label: 'Susu & Buah Segar', makna: 'Peduli kesehatan, disiplin diri, dan memiliki gaya hidup seimbang', sifat: 'Disiplin' },
    ],
  },
  {
    id: 'p6',
    hariKe: 6,
    pertanyaan: 'Aktivitas sore apa yang paling "gue banget" setelah pulang sekolah?',
    kategori: 'Minat Luar Kelas',
    dimensi: 'Intrinsic Motivation',
    pilihan: [
      { label: 'Bermain Sepeda / Olahraga di Lapangan', makna: 'Kinestetik tinggi, suka sosialisasi outdoor, dan enerjik', sifat: 'Sportif' },
      { label: 'Merakit Lego / Puzzle / Robot', makna: 'Kecerdasan spasial dan logika konstruktif tinggi', sifat: 'Konstruktif' },
      { label: 'Menggambar / Mewarnai Cerita', makna: 'Kreatif, imajinatif, dan mampu mengekspresikan ide visual', sifat: 'Kreatif' },
      { label: 'Membaca Buku / Menonton Ensiklopedia', makna: 'Senang menambah pengetahuan baru dan haus informasi', sifat: 'Linguistik' },
    ],
  },
  {
    id: 'p7',
    hariKe: 7,
    pertanyaan: 'Jika kamu punya kekuatan superhero impian, mana yang kamu pilih?',
    kategori: 'Values & Cita-cita',
    dimensi: 'Self-Efficacy',
    pilihan: [
      { label: 'Bisa Terbang Bebas di Angkasa', makna: 'Menyukai kebebasan berkreasi dan wawasan luas', sifat: 'Bebas & Inovatif' },
      { label: 'Kekuatan Super Membantu Orang', makna: 'Memiliki jiwa pelindung, tegas, dan membela kebenaran', sifat: 'Kepemimpinan' },
      { label: 'Bisa Menjadi Tak Terlihat', makna: 'Pengamat cermat, tenang, dan menyukai strategi di belakang layar', sifat: 'Strateger' },
      { label: 'Bisa Menyembuhkan Orang Sakit', makna: 'Empatis tinggi, perhatian, dan mengutamakan kesejahteraan sesama', sifat: 'Altruis' },
    ],
  },
  {
    id: 'p8',
    hariKe: 8,
    pertanyaan: 'Tempat liburan keluarga mana yang paling bikin kamu bahagia?',
    kategori: 'Preferensi Lingkungan',
    dimensi: 'Environmental Comfort',
    pilihan: [
      { label: 'Pantai & Bermain Pasir', makna: 'Menyukai kebebasan, eksplorasi alam terbuka, dan ketenangan', sifat: 'Eksploratif' },
      { label: 'Pegunungan & Udara Dingin Sejuk', makna: 'Menghargai kedamaian, udara bersih, dan refleksi diri', sifat: 'Tenang' },
      { label: 'Taman Bermain & Wahana Seru', makna: 'Ekstrovert, menyukai petualangan dan tantangan fisik', sifat: 'Ekstrovert' },
      { label: 'Museum / Pusat Sains Interaktif', makna: 'Keingintahuan intelektual tinggi dan menyukai fakta baru', sifat: 'Saintifik' },
    ],
  },
]

export function getActiveCurriculum(): PertanyaanItem[] {
  try {
    const saved = localStorage.getItem('AI_GENERATED_QUESTIONS')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return CURRICULUM_PERTANYAAN_HARIAN
}

export function getPertanyaanForDay(dateStr: string): PertanyaanItem {
  const curriculum = getActiveCurriculum()
  const date = new Date(dateStr)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const index = (dayOfYear - 1) % curriculum.length
  return curriculum[index] || curriculum[0]
}

export function synthesizePsychologicalProfile(
  namaSiswa: string,
  absensiRecords: Array<{ tanggal: string; jawabanSiswa?: string; pertanyaanHariIni?: string; status: string }>,
  nilaiRecords: Array<{ nilai: number; jenis: string }>,
  catatanRecords: Array<{ isi: string }>
) {
  const answeredList = absensiRecords.filter((a) => a.jawabanSiswa && a.jawabanSiswa.trim() !== '')
  
  // Aggregate traits from responses
  const traitCounts: Record<string, number> = {}
  const customAnswers: string[] = []

  answeredList.forEach((a) => {
    const jawaban = a.jawabanSiswa?.trim() || ''
    if (!jawaban) return

    // 1. Try matching with curriculum options (exact or partial)
    const matchedPilihan = getActiveCurriculum().flatMap((q) => q.pilihan).find(
      (p) => p.label.toLowerCase() === jawaban.toLowerCase() || jawaban.toLowerCase().includes(p.label.toLowerCase()) || p.label.toLowerCase().includes(jawaban.toLowerCase())
    )

    if (matchedPilihan) {
      const sifat = matchedPilihan.sifat
      traitCounts[sifat] = (traitCounts[sifat] || 0) + 1
    } else {
      // 2. Free-text write-in custom answer
      customAnswers.push(jawaban)
      traitCounts['Ekspresif & Unik'] = (traitCounts['Ekspresif & Unik'] || 0) + 1
    }
  })

  // Calculate top dominant traits
  const sortedTraits = Object.entries(traitCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([trait]) => trait)

  const topTraits = sortedTraits.length > 0 ? sortedTraits.slice(0, 3) : ['Ekspresif', 'Kreatif', 'Eksploratif']

  // Determine academic average
  const avgNilai = nilaiRecords.length
    ? Math.round(nilaiRecords.reduce((acc, curr) => acc + curr.nilai, 0) / nilaiRecords.length)
    : 80

  // Presence rate
  const totalHadir = absensiRecords.filter((a) => a.status === 'H').length
  const totalAbsen = absensiRecords.length || 1
  const persenHadir = Math.round((totalHadir / totalAbsen) * 100)

  // Construct Psychological Narrative based on findings
  let narasiKarakter = `Berdasarkan rangkuman observasi harian melalui presensi interaktif dan rekapitulasi performa, Ananda ${namaSiswa} menunjukkan kecenderungan karakter utama yang ${topTraits.join(', ').toLowerCase()}. `

  if (persenHadir >= 90) {
    narasiKarakter += `Ananda memiliki tingkat kedisiplinan dan kehadiran yang sangat konsisten (${persenHadir}%), mencerminkan rasa tanggung jawab serta keterikatan positif terhadap suasana pembelajaran di kelas. `
  } else {
    narasiKarakter += `Tingkat kehadiran Ananda mencapai ${persenHadir}%, menunjukkan potensi perkembangan yang terus dapat didampingi dengan dorongan motivasi harian. `
  }

  if (customAnswers.length > 0) {
    const sampleText = customAnswers.slice(0, 3).map((t) => `"${t}"`).join(', ')
    narasiKarakter += `Dalam sesi tanya-jawab interaktif presensi harian, Ananda ${namaSiswa} secara terbuka menyampaikan pilihan dan ide mandirinya seperti ${sampleText}. Hal ini mencerminkan rasa percaya diri, daya imajinasi yang bebas, serta keberanian mengekspresikan pendapat pribadi secara otentik. `
  } else if (answeredList.length > 0) {
    narasiKarakter += `Dalam sesi tanya-jawab interaktif harian, ${namaSiswa} secara konsisten memberikan respon yang mencerminkan kecerdasan emosional dan daya imajinasi yang aktif. `
  }

  if (avgNilai >= 85) {
    narasiKarakter += `Secara akademis, Ananda memiliki daya serap materi yang sangat baik dengan rata-rata pencapaian ${avgNilai}, menunjukkan kombinasi pemahaman logis dan fokus belajar yang matang.`
  } else if (avgNilai >= 75) {
    narasiKarakter += `Pencapaian akademis Ananda berada pada kategori baik (rata-rata ${avgNilai}), menunjukkan stabilitas belajar serta potensi besar untuk ditingkatkan melalui variasi metode pembelajaran kinestetik atau visual.`
  } else {
    narasiKarakter += `Secara akademis, Ananda meraih rata-rata ${avgNilai}, yang menandakan perlunya pendekatan pendampingan belajar secara bertahap dan personal.`
  }

  // Construct recommended teaching strategy
  let saranPendekatan = ''
  if (topTraits.includes('Eksploratif') || topTraits.includes('Bebas & Inovatif') || topTraits.includes('Kreatif')) {
    saranPendekatan = `Berikan proyek berbasis eksperimen atau tugas berbasis karya visual/kreatif. Ananda berkembang pesat saat diberi kebebasan bereksplorasi dan ruang untuk mengutarakan ide-ide baru.`
  } else if (topTraits.includes('Analitis') || topTraits.includes('Terstruktur') || topTraits.includes('Konstruktif')) {
    saranPendekatan = `Berikan tantangan pemecahan masalah (puzzle/logika) dengan alur kerja yang jelas. Ananda menyukai struktur yang rapi dan petunjuk yang rinci.`
  } else if (topTraits.includes('Leader') || topTraits.includes('Ekstrovert') || topTraits.includes('Antusias')) {
    saranPendekatan = `Libatkan Ananda sebagai koordinator kelompok atau fasilitator diskusi. Dorongan tanggung jawab sosial akan mengoptimalkan potensi kepemimpinan alaminya.`
  } else {
    saranPendekatan = `Apresiasi setiap usaha kecil dan ciptakan suasana belajar yang tenang serta ramah. Pendekatan apresiatif akan memperkuat kepercayaan diri Ananda.`
  }

  let rekomendasiBakat = ''
  if (topTraits.includes('Artistik') || topTraits.includes('Kreatif')) {
    rekomendasiBakat = 'Seni Rupa, Desain Grafis Cilik, Menulis Cerita, Musik'
  } else if (topTraits.includes('Analitis') || topTraits.includes('Saintifik')) {
    rekomendasiBakat = 'Sains & Robotik, Matematika Terapan, Coding/Catur'
  } else if (topTraits.includes('Kepemimpinan') || topTraits.includes('Sosial')) {
    rekomendasiBakat = 'Organisasi Siswa/Pramuka, Public Speaking, Olahraga Tim'
  } else {
    rekomendasiBakat = 'Literasi, Seni Budaya, Pengembangan Karakter & Olahraga'
  }

  return {
    karakterUtama: topTraits,
    narasiKarakter,
    saranPendekatan,
    rekomendasiBakat,
    totalRespon: answeredList.length,
    updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}
