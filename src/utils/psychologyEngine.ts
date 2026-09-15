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
  {
    id: 'p9',
    hariKe: 9,
    pertanyaan: 'Warna pensil gambar apa yang paling sering kamu pakai saat menggambar?',
    kategori: 'Ekspresi Visual & Emosi',
    dimensi: 'Kreativitas Warna',
    pilihan: [
      { label: 'Biru Samudra (Tenang & Damai)', makna: 'Pembawa ketenangan, reflektif, dan penuh pertimbangan', sifat: 'Tenang' },
      { label: 'Kuning Cerah (Ceria & Hangat)', makna: 'Penuh optimisme, ceria, dan mudah menularkan tawa', sifat: 'Ceria' },
      { label: 'Merah Berani (Semangat Juang)', makna: 'Tegas, pantang menyerah, dan berani mengambil langkah pertama', sifat: 'Pemberani' },
      { label: 'Hijau Daun (Sejuk & Bersahabat)', makna: 'Suka keharmonisan, peduli sesama, dan cinta lingkungan', sifat: 'Harmonis' },
    ],
  },
  {
    id: 'p10',
    hariKe: 10,
    pertanyaan: 'Suara alam apa yang paling menenangkan dan bikin pikiranmu adem?',
    kategori: 'Sensori & Relaksasi',
    dimensi: 'Regulasi Diri',
    pilihan: [
      { label: 'Gemercik Air Sungai Mengalir', makna: 'Menyukai ketenangan alur kehidupan dan mudah beradaptasi', sifat: 'Adaptif' },
      { label: 'Hembusan Angin di Pepohonan', makna: 'Bebas, menyukai ruang berimajinasi, dan berpikiran terbuka', sifat: 'Terbuka' },
      { label: 'Suara Tetesan Hujan di Genteng', makna: 'Introspektif, nyaman dalam keheningan, dan sensitif', sifat: 'Introspektif' },
      { label: 'Deburan Ombak di Tepi Pantai', makna: 'Dinamis, berenergi besar, dan menyukai pengalaman luas', sifat: 'Dinamis' },
    ],
  },
  {
    id: 'p11',
    hariKe: 11,
    pertanyaan: 'Jika diajak ikut lomba antar-sekolah, cabang apa yang paling ingin kamu coba?',
    kategori: 'Minat & Prestasi',
    dimensi: 'Efikasi Diri',
    pilihan: [
      { label: 'Lomba Cerdas Cermat / Sains', makna: 'Kecerdasan logis-matematis tinggi dan menyukai pemecahan masalah', sifat: 'Analitis' },
      { label: 'Lomba Gambar / Kaligrafi / Puisi', makna: 'Kecerdasan artistik, apresiasi estetika, dan imajinatif', sifat: 'Artistik' },
      { label: 'Lomba Lari / Futsal / Bulu Tangkis', makna: 'Kinestetik tinggi, kompetitif sehat, dan ketangkasan fisik', sifat: 'Sportif' },
      { label: 'Lomba Menyanyi / Pentas Cerita', makna: 'Kecerdasan musikal, komunikatif, dan percaya diri tampil', sifat: 'Ekspresif' },
    ],
  },
  {
    id: 'p12',
    hariKe: 12,
    pertanyaan: 'Teman seperti apa yang paling bikin kamu merasa nyaman dan ceria?',
    kategori: 'Relasi Sosial',
    dimensi: 'Pola Pertemanan',
    pilihan: [
      { label: 'Teman yang Lucu & Suka Bikin Ketawa', makna: 'Menyukai keceriaan, humor positif, dan kehangatan sosial', sifat: 'Humoris' },
      { label: 'Teman yang Setia & Bisa Menjaga Rahasia', makna: 'Menghargai kejujuran, loyalitas, dan kedalaman hubungan', sifat: 'Loyal' },
      { label: 'Teman yang Pintar & Suka Mengajari', makna: 'Berorientasi belajar bersama dan menghargai pengetahuan', sifat: 'Kooperatif' },
      { label: 'Teman yang Berani Membela Saat Kesulitan', makna: 'Menghargai keberanian moral, keadilan, dan perlindungan', sifat: 'Altruis' },
    ],
  },
  {
    id: 'p13',
    hariKe: 13,
    pertanyaan: 'Kendaraan masa depan apa yang paling keren untuk berangkat ke sekolah?',
    kategori: 'Imajinasi & Teknologi',
    dimensi: 'Visi Inovasi',
    pilihan: [
      { label: 'Sepatu Roda Terbang Anti-Macet', makna: 'Spontan, menyukai kelincahan, dan kepraktisan instan', sifat: 'Lincah' },
      { label: 'Kapsul Kereta Tabung Super Cepat', makna: 'Menghargai efisiensi waktu, keteraturan, dan teknologi modern', sifat: 'Efisien' },
      { label: 'Karpet Terbang Berdaya Matahari', makna: 'Imajinatif, berjiwa ramah lingkungan, dan menyukai keajaiban', sifat: 'Idealis' },
      { label: 'Pintu Ajaib Langsung Tembus Kelas', makna: 'Fokus pada tujuan langsung tanpa hambatan perjalanan', sifat: 'Praktis' },
    ],
  },
  {
    id: 'p14',
    hariKe: 14,
    pertanyaan: 'Cuaca seperti apa yang paling bikin harimu terasa sangat menyenangkan?',
    kategori: 'Suasana & Mood',
    dimensi: 'Respon Lingkungan',
    pilihan: [
      { label: 'Pagi Cerah dengan Matahari Bersinar', makna: 'Optimis, penuh energi pagi, dan siap menghadapi tantangan', sifat: 'Optimis' },
      { label: 'Mendung Teduh & Berangin Sejuk', makna: 'Tenang, fokus, dan nyaman mengerjakan hal detail', sifat: 'Tenang' },
      { label: 'Hujan Rintik Saat Santai di Rumah', makna: 'Menyukai kehangatan keluarga dan momen refleksi diri', sifat: 'Reflektif' },
      { label: 'Sore Hari dengan Pelangi Indah', makna: 'Penuh harapan, peka terhadap keindahan alam, dan ceria', sifat: 'Inspiratif' },
    ],
  },
  {
    id: 'p15',
    hariKe: 15,
    pertanyaan: 'Tokoh dalam cerita atau film seperti apa yang paling kamu kagumi?',
    kategori: 'Keteladanan & Nilai',
    dimensi: 'Karakter Panutan',
    pilihan: [
      { label: 'Pahlawan Pembela Kebenaran', makna: 'Memiliki kompas moral kuat, adil, dan berani bersikap', sifat: 'Integritas' },
      { label: 'Detektif Pintar Pemecah Teka-Teki', makna: 'Kritis, teliti mengamati detail, dan rasa ingin tahu tinggi', sifat: 'Kritis' },
      { label: 'Sahabat Ceria Penolong Semua Orang', makna: 'Hangat, inklusif, dan mengutamakan kerukunan teman', sifat: 'Penyayang' },
      { label: 'Ilmuwan Penemu Benda Ajaib', makna: 'Visioner, inovatif, dan berani mencoba hal baru', sifat: 'Inovatif' },
    ],
  },
  {
    id: 'p16',
    hariKe: 16,
    pertanyaan: 'Cara belajar seperti apa yang paling mudah bikin kamu paham pelajaran?',
    kategori: 'Gaya Belajar',
    dimensi: 'Modalitas Belajar',
    pilihan: [
      { label: 'Melihat Gambar & Menonton Video', makna: 'Gaya belajar visual kuat, mudah mencerna grafis dan animasi', sifat: 'Visual' },
      { label: 'Mendengarkan Guru Bercerita & Menjelaskan', makna: 'Gaya belajar auditori kuat, peka terhadap intonasi dan diskusi', sifat: 'Auditori' },
      { label: 'Praktik Langsung / Membuat Benda', makna: 'Gaya belajar kinestetik, memahami lewat sentuhan dan tindakan', sifat: 'Kinestetik' },
      { label: 'Membaca Sendiri & Membuat Catatan Rapi', makna: 'Gaya belajar mandiri, reflektif, dan menyukai keteraturan', sifat: 'Mandiri' },
    ],
  },
  {
    id: 'p17',
    hariKe: 17,
    pertanyaan: 'Minuman apa yang paling segar dan pas dinikmati setelah olahraga?',
    kategori: 'Preferensi Kesegaran',
    dimensi: 'Vitalitas Fisik',
    pilihan: [
      { label: 'Air Putih Dingin Segar', makna: 'Sederhana, jujur, mengutamakan kebutuhan pokok tanpa kepura-puraan', sifat: 'Sederhana' },
      { label: 'Es Kelapa Muda Manis Alami', makna: 'Alami, ramah, dan menyukai kesegaran murni dari alam', sifat: 'Harmonis' },
      { label: 'Susu Cokelat Dingin Bertenaga', makna: 'Bersemangat, ceria, dan menyukai kenyamanan rasa', sifat: 'Antusias' },
      { label: 'Jus Mangga / Jeruk Segar Kental', makna: 'Eksploratif, menyukai rasa kaya, dan bersemangat', sifat: 'Eksploratif' },
    ],
  },
  {
    id: 'p18',
    hariKe: 18,
    pertanyaan: 'Jika kamu punya markas rahasia sendiri, lokasinya paling cocok di mana?',
    kategori: 'Eksplorasi Spasial',
    dimensi: 'Kenyamanan Pribadi',
    pilihan: [
      { label: 'Rumah Pohon di Tengah Kebun Hijau', makna: 'Mencintai alam, suka perspektif tinggi, dan kebebasan', sifat: 'Petualang' },
      { label: 'Ruang Bawah Tanah Penuh Gadget & Buku', makna: 'Fokus mendalam, menyukai privasi, dan hobi riset', sifat: 'Peneliti' },
      { label: 'Tenda Nyaman di Tepi Danau Tenang', makna: 'Menyukai ketenteraman, keheningan, dan kedamaian batin', sifat: 'Tenang' },
      { label: 'Loteng Rumah dengan Teropong Bintang', makna: 'Imajinatif, berpikiran jauh ke depan, dan pemimpi besar', sifat: 'Visioner' },
    ],
  },
  {
    id: 'p19',
    hariKe: 19,
    pertanyaan: 'Jika disuruh membuat prakarya bebas, karya apa yang paling ingin kamu buat?',
    kategori: 'Kreativitas Tangan',
    dimensi: 'Produktivitas Karya',
    pilihan: [
      { label: 'Diorama Miniatur Kota Modern / Robot', makna: 'Kemampuan struktural spasial, ketelitian merangkai komponen', sifat: 'Konstruktif' },
      { label: 'Lukisan Kanvas Warna-warni Penuh Cerita', makna: 'Ekspresi emosional mendalam lewat warna dan bentuk seni', sifat: 'Artistik' },
      { label: 'Kerajinan dari Bahan Daur Ulang Ramah Alam', makna: 'Peduli lingkungan, kreatif memecahkan masalah limbah', sifat: 'Inovatif' },
      { label: 'Kartu Ucapan Tiga Dimensi untuk Sahabat', makna: 'Sosial afektif tinggi, penuh perhatian pada orang lain', sifat: 'Empatis' },
    ],
  },
  {
    id: 'p20',
    hariKe: 20,
    pertanyaan: 'Apa yang paling cepat mengembalikan senyummu saat kamu sedang merasa sedih?',
    kategori: 'Regulasi Emosi',
    dimensi: 'Resiliensi Diri',
    pilihan: [
      { label: 'Pelukan Hangat dari Ibu atau Ayah', makna: 'Kebutuhan afeksi keluarga kuat, terbuka pada rasa aman', sifat: 'Penyayang' },
      { label: 'Bercanda & Bermain Bersama Sahabat', makna: 'Kekuatan pemulihan dari dukungan sosial teman sebaya', sifat: 'Sosial' },
      { label: 'Menggambar atau Menulis Curahan Hati', makna: 'Penyaluran emosi kreatif dan sehat secara mandiri', sifat: 'Ekspresif' },
      { label: 'Menyendiri Sejenak Mendengarkan Lagu', makna: 'Mampu merefleksikan diri dan menenangkan pikiran sendiri', sifat: 'Reflektif' },
    ],
  },
  {
    id: 'p21',
    hariKe: 21,
    pertanyaan: 'Waktu dalam satu hari yang paling kamu nantikan setiap harinya?',
    kategori: 'Ritme Aktivitas',
    dimensi: 'Pengelolaan Waktu',
    pilihan: [
      { label: 'Pagi Hari Saat Berangkat Sekolah', makna: 'Antusias menyambut ilmu baru dan bertemu teman-teman', sifat: 'Antusias' },
      { label: 'Istirahat Jam Pertama di Sekolah', makna: 'Sosial tinggi, menikmati kebersamaan dan kebebasan bermain', sifat: 'Sosial' },
      { label: 'Sore Hari Saat Bebas Bermain Hobi', makna: 'Menghargai hobi pribadi dan waktu eksplorasi bebas', sifat: 'Kreatif' },
      { label: 'Malam Hari Menjelang Tidur Berkisah', makna: 'Menghargai kehangatan keluarga dan cerita imajinatif', sifat: 'Penyayang' },
    ],
  },
  {
    id: 'p22',
    hariKe: 22,
    pertanyaan: 'Jika kamu bisa menanam satu pohon ajaib di halaman, pohon apa itu?',
    kategori: 'Aspirasi Imajinatif',
    dimensi: 'Orientasi Harapan',
    pilihan: [
      { label: 'Pohon Buah Berbagai Rasa yang Tak Pernah Habis', makna: 'Murah hati, senang berbagi kenikmatan dengan sesama', sifat: 'Dermawan' },
      { label: 'Pohon Berdaun Buku Cerita & Pengetahuan', makna: 'Haus akan wawasan baru dan suka mencerdaskan teman', sifat: 'Cendekia' },
      { label: 'Pohon Bunga Beraroma Wangi Penyejuk Hati', makna: 'Membawa ketenangan dan kedamaian bagi lingkungan sekitar', sifat: 'Harmonis' },
      { label: 'Pohon Raksasa yang Bisa Dipanjat Seperti Istana', makna: 'Jiwa petualang sejati, menyukai tantangan fisik dan bermain', sifat: 'Petualang' },
    ],
  },
  {
    id: 'p23',
    hariKe: 23,
    pertanyaan: 'Saat belajar kelompok di kelas, peran apa yang paling kamu sukai?',
    kategori: 'Dinamika Kelompok',
    dimensi: 'Peran Kolaborasi',
    pilihan: [
      { label: 'Memimpin & Membagi Tugas ke Teman', makna: 'Bakat kepemimpinan alami, terstruktur, dan bertanggung jawab', sifat: 'Pemimpin' },
      { label: 'Mencatat & Menulis Laporan dengan Rapi', makna: 'Teliti, menghargai keakuratan informasi dan keteraturan', sifat: 'Terstruktur' },
      { label: 'Mencari Ide Kreatif & Memberi Masukan', makna: 'Pemikir konseptual, kaya ide baru, dan solutif', sifat: 'Inovatif' },
      { label: 'Mempresentasikan Hasil di Depan Kelas', makna: 'Komunikator percaya diri, artikulatif, dan berani bicara', sifat: 'Komunikatif' },
    ],
  },
  {
    id: 'p24',
    hariKe: 24,
    pertanyaan: 'Kejutan kecil apa yang paling bikin hatimu berbunga-bunga?',
    kategori: 'Apresiasi & Kasih',
    dimensi: 'Bahasa Kasih Sayang',
    pilihan: [
      { label: 'Pujian Tulus dari Guru atau Orang Tua', makna: 'Termotivasi oleh kata-kata apresiasi dan pengakuan usaha', sifat: 'Apresiatif' },
      { label: 'Hadiah Kejutan yang Sudah Lama Diidamkan', makna: 'Menghargai pemberian simbolik dan rasa diperhatikan', sifat: 'Ekspresif' },
      { label: 'Dibantu Teman Saat Sedang Kesulitan', makna: 'Peka pada tindakan nyata kepedulian dan kerjasama', sifat: 'Kooperatif' },
      { label: 'Diajak Jalan-jalan Bersama Keluarga', makna: 'Sangat menghargai waktu berkualitas bersama orang terkasih', sifat: 'Penyayang' },
    ],
  },
  {
    id: 'p25',
    hariKe: 25,
    pertanyaan: 'Olahraga apa yang paling seru dilakukan bersama teman-teman sekelas?',
    kategori: 'Aktivitas Fisik',
    dimensi: 'Sportivitas',
    pilihan: [
      { label: 'Sepak Bola / Futsal Penuh Kerjasama', makna: 'Kerjasama tim kuat, taktis, dan menyukai koordinasi bersama', sifat: 'Kooperatif' },
      { label: 'Bulu Tangkis / Tenis Meja Cepat', makna: 'Fokus tinggi, refleks cepat, dan ketepatan individu', sifat: 'Fokus' },
      { label: 'Lari Estafet Saling Menyemangati', makna: 'Semangat solidaritas tinggi, kompak, dan saling mendukung', sifat: 'Solidaritas' },
      { label: 'Senam Irama Musik Ceria Bersama', makna: 'Harmoni gerak, keceriaan bersama, dan kesehatan tubuh', sifat: 'Ceria' },
    ],
  },
  {
    id: 'p26',
    hariKe: 26,
    pertanyaan: 'Barang apa di dalam tas sekolah yang paling berharga bagimu?',
    kategori: 'Kepemilikan & Nilai',
    dimensi: 'Keterikatan Makna',
    pilihan: [
      { label: 'Buku Gambar Penuh Sketsa Rahasia', makna: 'Kreativitas pribadi tinggi dan memiliki imajinasi kaya', sifat: 'Kreatif' },
      { label: 'Pensil atau Pulpen Favorit yang Nyaman', makna: 'Praktis, menyukai fungsionalitas dan kenyamanan belajar', sifat: 'Praktis' },
      { label: 'Gantungan Kunci atau Hadiah dari Sahabat', makna: 'Menghargai kenangan pertemanan dan ikatan batin', sifat: 'Setia Kawan' },
      { label: 'Buku Cerita yang Sedang Dibaca', makna: 'Pencinta literasi, imajinatif, dan haus cerita bermakna', sifat: 'Literat' },
    ],
  },
  {
    id: 'p27',
    hariKe: 27,
    pertanyaan: 'Ketika sudah besar nanti, profesi impian apa yang paling ingin kamu jalani?',
    kategori: 'Aspirasi Masa Depan',
    dimensi: 'Orientasi Karier',
    pilihan: [
      { label: 'Dokter / Tenaga Medis Penolong Sesama', makna: 'Empatis tinggi, altruis, dan berdedikasi melayani sesama', sifat: 'Altruis' },
      { label: 'Insinyur / Arsitek / Ahli Teknologi', makna: 'Kecerdasan teknikal, analitis, dan perancang masa depan', sifat: 'Inovatif' },
      { label: 'Guru / Pendidik yang Inspiratif', makna: 'Pendidik berjiwa tulus, sabar, dan menyukai transfer ilmu', sifat: 'Inspiratif' },
      { label: 'Seniman / Penulis / Atlet Berprestasi', makna: 'Bakat ekspresif tinggi, berdedikasi pada karya keunggulan', sifat: 'Artistik' },
    ],
  },
  {
    id: 'p28',
    hariKe: 28,
    pertanyaan: 'Kebaikan sederhana apa yang paling sering kamu lakukan untuk teman?',
    kategori: 'Karakter Prososial',
    dimensi: 'Kepedulian Sosial',
    pilihan: [
      { label: 'Meminjamkan Alat Tulis Tanpa Ragu', makna: 'Murah hati, tanggap terhadap kebutuhan orang di sekitar', sifat: 'Dermawan' },
      { label: 'Menghibur Teman yang Sedang Sedih', makna: 'Empati tinggi, sensitif emosional, dan penyejuk suasana', sifat: 'Empatis' },
      { label: 'Mengajak Teman yang Sendirian untuk Bergabung', makna: 'Inklusif, tidak membeda-bedakan, dan merangkul semua', sifat: 'Inklusif' },
      { label: 'Membantu Merapikan Kelas Bersama-sama', makna: 'Rasa memiliki tinggi terhadap lingkungan dan rajin', sifat: 'Gotong Royong' },
    ],
  },
  {
    id: 'p29',
    hariKe: 29,
    pertanyaan: 'Misteri alam semesta apa yang paling bikin kamu penasaran dan takjub?',
    kategori: 'Rasa Ingin Tahu Ilmiah',
    dimensi: 'Inkuiri Sains',
    pilihan: [
      { label: 'Bintang & Planet di Luar Angkasa', makna: 'Kekaguman kosmik, wawasan luas, dan rasa ingin tahu astronomi', sifat: 'Eksploratif' },
      { label: 'Kehidupan Hewan Purba & Dinosaurus', makna: 'Kecintaan sejarah alam, imajinasi masa lampau, dan fosil', sifat: 'Arkeologis' },
      { label: 'Rahasia Dasar Lautan Terdalam', makna: 'Menyukai misteri tersembunyi, keberanian menghadapi hal baru', sifat: 'Pemberani' },
      { label: 'Kecerdasan Otak Manusia & Komputer Canggih', makna: 'Tertarik pada kognisi, logika berpikir, dan masa depan', sifat: 'Visioner' },
    ],
  },
  {
    id: 'p30',
    hariKe: 30,
    pertanyaan: 'Kata-kata apa yang paling cocok untuk menyemangati dirimu mengawali hari?',
    kategori: 'Afirmasi Positif Diri',
    dimensi: 'Efikasi Diri',
    pilihan: [
      { label: '"Aku Pasti Bisa Jika Bersungguh-sungguh!"', makna: 'Growth mindset kuat, percaya pada kekuatan usaha dan belajar', sifat: 'Gigih' },
      { label: '"Hari Ini Harus Lebih Bahagia dan Penuh Senyum!"', makna: 'Fokus pada kebahagiaan positif, optimisme, dan rasa syukur', sifat: 'Optimis' },
      { label: '"Jadilah Anak yang Bermanfaat bagi Banyak Orang!"', makna: 'Berorientasi nilai luhur dan kontribusi nyata bagi sesama', sifat: 'Integritas' },
      { label: '"Selalu Ada Hal Seru dan Menarik untuk Dipelajari!"', makna: 'Cinta belajar sepanjang hayat dan antusias terhadap kebaruan', sifat: 'Antusias' },
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

export function isCustomCurriculumActive(): boolean {
  try {
    const saved = localStorage.getItem('AI_GENERATED_QUESTIONS')
    if (saved) {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) && parsed.length > 0
    }
  } catch {}
  return false
}

export function saveCurriculumQuestions(items: PertanyaanItem[]) {
  localStorage.setItem('AI_GENERATED_QUESTIONS', JSON.stringify(items))
  window.dispatchEvent(new Event('storage'))
}

export function resetCurriculumToDefault() {
  localStorage.removeItem('AI_GENERATED_QUESTIONS')
  window.dispatchEvent(new Event('storage'))
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
