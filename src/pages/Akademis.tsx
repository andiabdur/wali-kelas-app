import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  BookPlus,
  Plus,
  Save,
  Trash2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  RotateCcw,
  Award,
  BookOpen,
  TrendingUp,
  BarChart2,
} from 'lucide-react'
import { db, generateId, type Nilai } from '../db/database'
import { getActiveStudents } from '../db/queries'
import { useStore } from '../store/useStore'

type SortField = 'tanggal' | 'nilai' | 'siswa' | 'mapel'
type SortOrder = 'asc' | 'desc'

export function Akademis() {
  const { notify } = useStore()
  const mapel = useLiveQuery(() => db.mataPelajaran.orderBy('urutan').toArray(), []) ?? []
  const siswa = useLiveQuery(async () => getActiveStudents(await db.siswa.toArray()), []) ?? []
  const nilai = useLiveQuery(() => db.nilai.toArray(), []) ?? []
  
  // Input batch state
  const [namaMapel, setNamaMapel] = useState('')
  const [selectedMapel, setSelectedMapel] = useState('')
  const [jenis, setJenis] = useState<Nilai['jenis']>('kuis')
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [scores, setScores] = useState<Record<string, string>>({})

  // Dynamic filter & sort state
  const [filterSiswa, setFilterSiswa] = useState('')
  const [filterMapel, setFilterMapel] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('tanggal')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  async function addMapel() {
    if (!namaMapel.trim()) return
    await db.mataPelajaran.add({ id: generateId(), nama: namaMapel.trim(), urutan: mapel.length + 1 })
    notify(`Mata pelajaran "${namaMapel.trim()}" ditambahkan.`)
    setNamaMapel('')
  }

  async function deleteMapel(id: string) {
    if (!confirm('Hapus mata pelajaran ini? Nilai terkait juga akan dihapus.')) return
    await db.transaction('rw', [db.mataPelajaran, db.nilai], async () => {
      await db.mataPelajaran.delete(id)
      await db.nilai.where('mapelId').equals(id).delete()
    })
    notify('Mata pelajaran berhasil dihapus.', 'info')
  }

  async function deleteNilai(id: string) {
    await db.nilai.delete(id)
    notify('Nilai berhasil dihapus.', 'info')
  }

  async function saveScores() {
    if (!selectedMapel) return notify('Pilih mata pelajaran terlebih dahulu.', 'error')
    const rows = Object.entries(scores)
      .filter(([, value]) => value !== '' && !Number.isNaN(Number(value)))
      .map(([siswaId, value]) => ({ id: generateId(), siswaId, mapelId: selectedMapel, jenis, tanggal, nilai: Number(value) }))
    if (!rows.length) return notify('Isi minimal satu nilai.', 'error')
    await db.nilai.bulkAdd(rows)
    notify(`Berhasil menyimpan ${rows.length} nilai siswa.`)
    setScores({})
  }

  // Filter & Sort Logic
  const filteredAndSortedNilai = useMemo(() => {
    let result = [...nilai]

    // 1. Filter Siswa
    if (filterSiswa) {
      result = result.filter((n) => n.siswaId === filterSiswa)
    }

    // 2. Filter Mapel
    if (filterMapel) {
      result = result.filter((n) => n.mapelId === filterMapel)
    }

    // 3. Filter Jenis
    if (filterJenis) {
      result = result.filter((n) => n.jenis === filterJenis)
    }

    // 4. Search Query (Nama siswa atau Nama Mapel)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((n) => {
        const sNama = siswa.find((s) => s.id === n.siswaId)?.nama.toLowerCase() || ''
        const mNama = mapel.find((m) => m.id === n.mapelId)?.nama.toLowerCase() || ''
        return sNama.includes(q) || mNama.includes(q)
      })
    }

    // 5. Sorting
    result.sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      if (sortField === 'tanggal') {
        valA = a.tanggal
        valB = b.tanggal
      } else if (sortField === 'nilai') {
        valA = a.nilai
        valB = b.nilai
      } else if (sortField === 'siswa') {
        valA = siswa.find((s) => s.id === a.siswaId)?.nama || ''
        valB = siswa.find((s) => s.id === b.siswaId)?.nama || ''
      } else if (sortField === 'mapel') {
        valA = mapel.find((m) => m.id === a.mapelId)?.nama || ''
        valB = mapel.find((m) => m.id === b.mapelId)?.nama || ''
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [nilai, siswa, mapel, filterSiswa, filterMapel, filterJenis, searchQuery, sortField, sortOrder])

  // Analytics Stats
  const stats = useMemo(() => {
    if (!filteredAndSortedNilai.length) {
      return { total: 0, average: 0, highest: 0, lowest: 0 }
    }
    const total = filteredAndSortedNilai.length
    const sum = filteredAndSortedNilai.reduce((acc, curr) => acc + curr.nilai, 0)
    const average = Math.round((sum / total) * 10) / 10
    const highest = Math.max(...filteredAndSortedNilai.map((n) => n.nilai))
    const lowest = Math.min(...filteredAndSortedNilai.map((n) => n.nilai))
    return { total, average, highest, lowest }
  }, [filteredAndSortedNilai])

  function handleHeaderSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  function resetFilters() {
    setFilterSiswa('')
    setFilterMapel('')
    setFilterJenis('')
    setSearchQuery('')
    setSortField('tanggal')
    setSortOrder('desc')
  }

  const isFiltered = Boolean(filterSiswa || filterMapel || filterJenis || searchQuery)

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Akademis</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Mata Pelajaran & Nilai</h1>
        <p className="mt-1 text-[var(--text-muted)]">Kelola mapel, input nilai batch, dan analisis rekap nilai siswa secara dinamis.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
          <div className="mb-4 flex items-center gap-2"><BookPlus className="text-primary" /><h2 className="font-heading text-xl font-bold">Daftar Mapel</h2></div>
          <div className="flex gap-2">
            <input value={namaMapel} onChange={(e) => setNamaMapel(e.target.value)} placeholder="Contoh: Matematika" className="min-h-12 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:ring-2 focus:ring-primary/20" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={addMapel} className="min-h-12 rounded-xl bg-primary px-4 text-white shadow-md flex items-center justify-center"><Plus /></motion.button>
          </div>
          <div className="mt-4 space-y-2 max-h-[460px] overflow-auto">
            {mapel.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <span className="font-semibold">{item.nama}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => deleteMapel(item.id)} className="text-sm font-semibold text-red-600 p-1 hover:bg-red-50 rounded-lg flex items-center gap-1"><Trash2 size={16} /> Hapus</motion.button>
              </div>
            ))}
            {!mapel.length && <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--text-muted)]">Belum ada mapel.</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
          <h2 className="font-heading text-xl font-bold">Input Nilai Batch</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Pilih mapel</option>
              {mapel.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
            </select>
            <select value={jenis} onChange={(e) => setJenis(e.target.value as Nilai['jenis'])} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:ring-2 focus:ring-primary/20">
              <option value="kuis">Kuis</option>
              <option value="latihan">Latihan</option>
              <option value="ulangan">Ulangan</option>
              <option value="tugas">Tugas</option>
            </select>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="mt-4 max-h-[460px] space-y-2 overflow-auto pr-1">
            {siswa.map((anak) => (
              <label key={anak.id} className="grid grid-cols-[1fr_92px] items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 hover:border-gray-300 transition">
                <span><b>{anak.nomorAbsen}.</b> {anak.nama}</span>
                <input type="number" min="0" max="100" value={scores[anak.id] || ''} onChange={(e) => setScores({ ...scores, [anak.id]: e.target.value })} className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-2 text-center text-base focus:ring-2 focus:ring-primary/20 outline-none dark:bg-dark-surface-2" />
              </label>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={saveScores} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white shadow-md"><Save size={18} /> Simpan Nilai</motion.button>
        </article>
      </div>

      {/* Dynamic Summary Analytics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 shadow-sm dark:bg-dark-surface-2 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Rata-Rata Nilai</p>
            <p className="text-2xl font-bold font-heading">{stats.average || '-'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 shadow-sm dark:bg-dark-surface-2 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nilai Tertinggi</p>
            <p className="text-2xl font-bold font-heading text-emerald-600">{stats.highest || '-'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 shadow-sm dark:bg-dark-surface-2 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <BarChart2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nilai Terendah</p>
            <p className="text-2xl font-bold font-heading text-amber-600">{stats.lowest || '-'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 shadow-sm dark:bg-dark-surface-2 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Nilai Terdata</p>
            <p className="text-2xl font-bold font-heading">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Table with Filters & Sorting */}
      <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            <h2 className="font-heading text-xl font-bold">Daftar Rekap Nilai Siswa</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isFiltered && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100/60"
              >
                <RotateCcw size={14} /> Reset Filter
              </motion.button>
            )}
          </div>
        </div>

        {/* Filters Controls */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <Search size={18} className="text-[var(--text-muted)] shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa / mapel..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)]"
            />
          </label>

          <select
            value={filterSiswa}
            onChange={(e) => setFilterSiswa(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Siswa ({siswa.length})</option>
            {siswa.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nomorAbsen}. {s.nama}
              </option>
            ))}
          </select>

          <select
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Mapel ({mapel.length})</option>
            {mapel.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </select>

          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 capitalize"
          >
            <option value="">Semua Kategori Nilai</option>
            <option value="kuis">Kuis</option>
            <option value="latihan">Latihan</option>
            <option value="ulangan">Ulangan</option>
            <option value="tugas">Tugas</option>
          </select>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[700px] text-left text-sm border-collapse">
            <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th
                  onClick={() => handleHeaderSort('tanggal')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition"
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    <SortIcon field="tanggal" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('siswa')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition"
                >
                  <div className="flex items-center gap-1">
                    Nama Siswa
                    <SortIcon field="siswa" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('mapel')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition"
                >
                  <div className="flex items-center gap-1">
                    Mata Pelajaran
                    <SortIcon field="mapel" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th className="py-3 px-4">Kategori</th>
                <th
                  onClick={() => handleHeaderSort('nilai')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    Nilai
                    <SortIcon field="nilai" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Predikat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-white/40 dark:bg-dark-surface-1/40">
              <AnimatePresence>
                {filteredAndSortedNilai.map((n) => {
                  const s = siswa.find((item) => item.id === n.siswaId)
                  const m = mapel.find((item) => item.id === n.mapelId)
                  const predikat = getPredikatBadge(n.nilai)

                  return (
                    <motion.tr
                      key={n.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/80 dark:hover:bg-dark-surface-2/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[var(--text-muted)]">{n.tanggal}</td>
                      <td className="py-3 px-4 font-bold">{s ? `${s.nomorAbsen}. ${s.nama}` : '-'}</td>
                      <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{m?.nama || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-dark-surface-2 dark:text-gray-300">
                          {n.jenis}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-base">{n.nilai}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${predikat.className}`}>
                          {predikat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteNilai(n.id)}
                          title="Hapus Nilai"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>

              {!filteredAndSortedNilai.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-[var(--text-muted)] italic">
                    {isFiltered ? 'Tidak ada data nilai yang sesuai dengan filter.' : 'Belum ada data nilai terdaftar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

function SortIcon({ field, currentField, order }: { field: SortField; currentField: SortField; order: SortOrder }) {
  if (field !== currentField) {
    return <ArrowUpDown size={14} className="opacity-40" />
  }
  return order === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />
}

function getPredikatBadge(score: number) {
  if (score >= 85) {
    return { label: 'A (Sangat Baik)', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' }
  }
  if (score >= 75) {
    return { label: 'B (Baik)', className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' }
  }
  if (score >= 65) {
    return { label: 'C (Cukup)', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' }
  }
  return { label: 'D (Perlu Bimbingan)', className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' }
}
