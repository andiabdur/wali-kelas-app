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
    pertanyaan: 'Jika kamu punya pintu ajaib hari ini, ke mana kamu paling ingin pergi?',
    kategori: 'Imajinasi & Eksplorasi',
    dimensi: 'Openness & Curiosity',
    pilihan: [
      { label: 'Negara Luar Negeri / Luar Angkasa', makna: 'Memiliki rasa ingin tahu tinggi, imajinasi eksploratif, dan wawasan luas', sifat: 'Eksploratif' },
      { label: 'Rumah Nenek / Desa yang Asri', makna: 'Menghargai kenyamanan, kehangatan keluarga, dan stabilitas emosional', sifat: 'Sentimental' },
      { label: 'Taman Bermain / Wahana Seru', makna: 'Enerjik, menyukai kegembiraan, dan penuh semangat bersosialisasi', sifat: 'Ekstrovert' },
      { label: 'Perpustakaan Rahasia / Laboratorium', makna: 'Fokus, senang memecahkan teka-teki, dan mandiri dalam belajar', sifat: 'Analitis' },
    ],
  },
  {
    id: 'p2',
    hariKe: 2,
    pertanyaan: 'Buah apa yang paling kamu sukai saat ini?',
    kategori: 'Preferensi Sensori & Karakter',
    dimensi: 'Emotional Disposition',
    pilihan: [
      { label: 'Pisang', makna: 'Praktis, energik, siap beraktivitas fisik, dan mudah beradaptasi', sifat: 'Praktis' },
      { label: 'Apel', makna: 'Terstruktur, menyukai kerapian, konsisten, dan berpendirian teguh', sifat: 'Terstruktur' },
      { label: 'Jeruk', makna: 'Ceria, komunikatif, mampu menyegarkan suasana kelompok', sifat: 'Komunikatif' },
      { label: 'Anggur', makna: 'Artistik, memperhatikan detail halus, dan memiliki apresiasi estetika', sifat: 'Artistik' },
    ],
  },
  {
    id: 'p3',
    hariKe: 3,
    pertanyaan: 'Hewan apa yang menurutmu paling lucu dan ingin kamu pelihara?',
    kategori: 'Relasi Sosial & Afeksi',
    dimensi: 'Agreeableness & Empathy',
    pilihan: [
      { label: 'Kucing', makna: 'Penyayang, peka terhadap perasaan sesama, dan menghargai kebebasan', sifat: 'Empatis' },
      { label: 'Anjing / Kelinci', makna: 'Sangat bersahabat, setia kawan, suka berinteraksi aktif', sifat: 'Sosial' },
      { label: 'Burung Berwarna-warni', makna: 'Menyukai ekspresi bebas, musik, dan keindahan ekspresif', sifat: 'Ekspresif' },
      { label: 'Ikan Hias', makna: 'Tenang, pengamat yang baik, tidak mudah terdistraksi', sifat: 'Reflektif' },
    ],
  },
  {
    id: 'p4',
    hariKe: 4,
    pertanyaan: 'Jika kamu menjadi superhero, kekuatan ajaib apa yang kamu pilih?',
    kategori: 'Aspirasi & Motivasi Diri',
    dimensi: 'Self-Efficacy & Values',
    pilihan: [
      { label: 'Terbang Bebas di Angkasa', makna: 'Menginginkan kebebasan berkreasi, wawasan pandang luas', sifat: 'Bebas & Inovatif' },
      { label: 'Membaca Pikiran Teman', makna: 'Peka secara emosional, ingin memahami orang lain lebih dalam', sifat: 'Intuisi Tinggi' },
      { label: 'Menjadi Tak Terlihat', makna: 'Pengamat cermat, tenang, menyukai strategi di belakang layar', sifat: 'Strateger' },
      { label: 'Kekuatan Otot Super Pelindung', makna: 'Jiwa pelindung, tegas, tidak ragu membela kebenaran', sifat: 'Kepemimpinan' },
    ],
  },
  {
    id: 'p5',
    hariKe: 5,
    pertanyaan: 'Warna pensil gambar mana yang pertama kali kamu ambil saat menggambar?',
    kategori: 'Gaya Ekspresi & Mood',
    dimensi: 'Creative Temperament',
    pilihan: [
      { label: 'Merah / Jingga Enerjik', makna: 'Penuh antusiasme, berani mengemukakan pendapat secara terbuka', sifat: 'Antusias' },
      { label: 'Biru / Nila Bijak', makna: 'Tenang, sistematis dalam berpikir, menyukai kedamaian', sifat: 'Tenang' },
      { label: 'Kuning Ceria', makna: 'Optimis, humoris, pembawa keceriaan di lingkungan kelas', sifat: 'Optimis' },
      { label: 'Hijau Alami', makna: 'Pengayom, kooperatif, dapat dipercaya oleh teman kelompok', sifat: 'Kooperatif' },
    ],
  },
  {
    id: 'p6',
    hariKe: 6,
    pertanyaan: 'Saat mendapat hadiah misteri, apa yang pertama kali kamu lakukan?',
    kategori: 'Gaya Pengambilan Keputusan',
    dimensi: 'Impulsivity vs Deliberation',
    pilihan: [
      { label: 'Langsung Membukanya dengan Cepat', makna: 'Spontan, berani mengambil risiko, penuh rasa penasaran', sifat: 'Spontan' },
      { label: 'Mengocok Kotak & Menebak Isinya', makna: 'Suka berteori, kritis, mengumpulkan bukti terlebih dahulu', sifat: 'Kritis' },
      { label: 'Bertanya Siapa Pengirimnya', makna: 'Menghargai hubungan antarmanusia dan etika bersosialisasi', sifat: 'Sosial' },
      { label: 'Membuka dengan Rapi & Hati-hati', makna: 'Sangat teliti, menghargai barang, berhati-hati dalam bertindak', sifat: 'Metodis' },
    ],
  },
  {
    id: 'p7',
    hariKe: 7,
    pertanyaan: 'Mainan atau aktivitas apa yang paling bikin kamu lupa waktu?',
    kategori: 'Minat Utama (Holland Themes)',
    dimensi: 'Intrinsic Motivation',
    pilihan: [
      { label: 'Bongkar Pasang / Lego / Puzzle', makna: 'Memiliki kecerdasan spasial dan konstruktif tinggi (Realistic/Investigative)', sifat: 'Konstruktif' },
      { label: 'Menggambar / Mewarnai / Menari', makna: 'Kecerdasan kinestetik dan artistik ekspresif tinggi (Artistic)', sifat: 'Kreatif' },
      { label: 'Bermain Peran / Olahraga Bersama', makna: 'Minat sosial dan kecerdasan interpersonal kuat (Social)', sifat: 'Interpersonal' },
      { label: 'Membaca Buku / Menulis Cerita', makna: 'Kecerdasan linguistik dan konseptual mendalam (Investigative/Conventional)', sifat: 'Linguistik' },
    ],
  },
  {
    id: 'p8',
    hariKe: 8,
    pertanyaan: 'Jika ada acara pesta sekolah, tugas apa yang paling ingin kamu ambil?',
    kategori: 'Peran Kelompok (Belbin Roles)',
    dimensi: 'Group Dynamics',
    pilihan: [
      { label: 'Ketua Pengatur Acara', makna: 'Bakat kepemimpinan alami dan pengorganisasi kegiatan', sifat: 'Leader' },
      { label: 'Pentas Seni / Pembawa Acara', makna: 'Senang tampil di depan umum dan percaya diri tinggi', sifat: 'Presenter' },
      { label: 'Menyiapkan Dekorasi & Peralatan', makna: 'Pekerja keras, eksekutor andal, berorientasi hasil fisik', sifat: 'Eksekutor' },
      { label: 'Menyambut & Menyapa Tamu', makna: 'Ramah, memiliki kecerdasan emosional dan keramahan alami', sifat: 'Host' },
    ],
  },
  {
    id: 'p9',
    hariKe: 9,
    pertanyaan: 'Bagaimana perasaanmu jika hujan turun deras di pagi hari?',
    kategori: 'Resiliensi & Regulasi Emosi',
    dimensi: 'Emotional Resilience',
    pilihan: [
      { label: 'Senang, Ingin Main Genangan Air', makna: 'Melihat peluang positif di situasi tak terduga', sifat: 'Resilien' },
      { label: 'Syahdu, Ingin Membaca / Tidur Nyenyak', makna: 'Menikmati ketenangan interior dan kedamaian diri', sifat: 'Introvert Syahdu' },
      { label: 'Penasaran dari Mana Asal Hujan', makna: 'Berpikir ilmiah dan selalu ingin tahu sebab-akibat fenomena alam', sifat: 'Saintifik' },
      { label: 'Siap Pakai Payung / Jas Hujan Favorit', makna: 'Selalu bersiap siaga dan memiliki perencanaan matang', sifat: 'Terencana' },
    ],
  },
  {
    id: 'p10',
    hariKe: 10,
    pertanyaan: 'Karakter robot seperti apa yang ingin kamu ciptakan?',
    kategori: 'Visi Masa Depan & Problem Solving',
    dimensi: 'Problem Solving Style',
    pilihan: [
      { label: 'Robot Penolong Bencana & Orang Sakit', makna: 'Tingkat kepedulian kemanusiaan dan altruisme sangat tinggi', sifat: 'Altruis' },
      { label: 'Robot Pembersih Rumah & Sekolah', makna: 'Praktis, menyukai efisiensi dan kerapian lingkungan sekitar', sifat: 'Praktis' },
      { label: 'Robot Penjelajah Lautan & Luar Angkasa', makna: 'Haus akan penemuan baru dan eksplorasi wilayah belum terjamah', sifat: 'Penjelajah' },
      { label: 'Robot Pembuat Mainan & Musik', makna: 'Inovator kreatif yang ingin menyebarkan kegembiraan', sifat: 'Inovator' },
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
  const keywords: string[] = []

  answeredList.forEach((a) => {
    const matchedPilihan = CURRICULUM_PERTANYAAN_HARIAN.flatMap((q) => q.pilihan).find(
      (p) => p.label.toLowerCase() === a.jawabanSiswa?.toLowerCase()
    )
    if (matchedPilihan) {
      const sifat = matchedPilihan.sifat
      traitCounts[sifat] = (traitCounts[sifat] || 0) + 1
      keywords.push(matchedPilihan.makna)
    }
  })

  // Calculate top dominant traits
  const sortedTraits = Object.entries(traitCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([trait]) => trait)

  const topTraits = sortedTraits.length > 0 ? sortedTraits.slice(0, 3) : ['Eksploratif', 'Kreatif', 'Kooperatif']

  // Determine academic average
  const avgNilai = nilaiRecords.length
    ? Math.round(nilaiRecords.reduce((acc, curr) => acc + curr.nilai, 0) / nilaiRecords.length)
    : 80

  // Presence rate
  const totalHadir = absensiRecords.filter((a) => a.status === 'H').length
  const totalAbsen = absensiRecords.length || 1
  const persenHadir = Math.round((totalHadir / totalAbsen) * 100)

  // Construct Psychological Narrative based on findings
  let narasiKarakter = `Berdasarkan rangkuman observasi harian melalui presensi interaktif dan rekapitas performa, Ananda ${namaSiswa} menunjukkan kecenderungan karakter utama yang ${topTraits.join(', ').toLowerCase()}. `

  if (persenHadir >= 90) {
    narasiKarakter += `Ananda memiliki tingkat kedisiplinan dan kehadiran yang sangat konsisten (${persenHadir}%), mencerminkan rasa tanggung jawab serta keterikatan positif terhadap suasana pembelajaran di kelas. `
  } else {
    narasiKarakter += `Tingkat kehadiran Ananda mencapai ${persenHadir}%, menunjukkan potensi perkembangan yang terus dapat didampingi dengan dorongan motivasi harian. `
  }

  if (answeredList.length > 0) {
    narasiKarakter += `Dalam sesi tanya-jawab interaktif harian, ${namaSiswa} secara konsisten memilih opsi yang mencerminkan kecerdasan emosional dan daya imajinasi yang aktif. `
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
