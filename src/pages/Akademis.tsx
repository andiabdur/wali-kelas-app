import { useMemo, useState } from 'react'
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
import {
  useMataPelajaranList,
  useSiswaList,
  useNilaiList,
  addMataPelajaran,
  deleteMataPelajaranCascade,
  batchSaveNilai,
  deleteNilai as deleteNilaiFirestore,
  generateId,
  type Nilai,
} from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'

type SortField = 'tanggal' | 'nilai' | 'siswa' | 'mapel'
type SortOrder = 'asc' | 'desc'

export function Akademis() {
  const { notify } = useStore()
  const { activeKelasId } = useAuth()
  const { mapel } = useMataPelajaranList(activeKelasId)
  const { siswa: allSiswa } = useSiswaList(activeKelasId)
  const siswa = allSiswa.filter((s) => s.aktif)
  const { nilai } = useNilaiList(activeKelasId)

  // Input batch state
  const [namaMapel, setNamaMapel] = useState('')
  const [selectedMapel, setSelectedMapel] = useState('')
  const [jenis, setJenis] = useState<Nilai['jenis']>('kuis')
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [scores, setScores] = useState<Record<string, string>>({})

  // Filter & sort state
  const [filterSiswa, setFilterSiswa] = useState('')
  const [filterMapel, setFilterMapel] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('tanggal')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  async function addMapel() {
    if (!namaMapel.trim()) return
    await addMataPelajaran({
      id: generateId(),
      kelasId: activeKelasId,
      nama: namaMapel.trim(),
      urutan: mapel.length + 1,
    })
    notify(`Mata pelajaran "${namaMapel.trim()}" ditambahkan.`)
    setNamaMapel('')
  }

  async function deleteMapel(id: string) {
    if (!confirm('Hapus mata pelajaran ini? Seluruh rekaman nilai terkait juga akan dibersihkan.')) return
    await deleteMataPelajaranCascade(id, activeKelasId)
    notify('Mata pelajaran berhasil dihapus.', 'info')
  }

  async function deleteNilai(id: string) {
    await deleteNilaiFirestore(id)
    notify('Nilai berhasil dihapus.', 'info')
  }

  async function saveScores() {
    if (!selectedMapel) return notify('Pilih mata pelajaran terlebih dahulu.', 'error')
    const rows: Nilai[] = Object.entries(scores)
      .filter(([, value]) => value !== '' && !Number.isNaN(Number(value)))
      .map(([siswaId, value]) => ({
        id: generateId(),
        kelasId: activeKelasId,
        siswaId,
        mapelId: selectedMapel,
        jenis,
        tanggal,
        nilai: Number(value),
      }))
    if (!rows.length) return notify('Isi minimal satu nilai siswa.', 'error')
    await batchSaveNilai(rows)
    notify(`Berhasil menyimpan ${rows.length} nilai siswa.`)
    setScores({})
  }

  // Filter & Sort Logic
  const filteredAndSortedNilai = useMemo(() => {
    let result = [...nilai]

    if (filterSiswa) {
      result = result.filter((n) => n.siswaId === filterSiswa)
    }

    if (filterMapel) {
      result = result.filter((n) => n.mapelId === filterMapel)
    }

    if (filterJenis) {
      result = result.filter((n) => n.jenis === filterJenis)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((n) => {
        const sNama = siswa.find((s) => s.id === n.siswaId)?.nama.toLowerCase() || ''
        const mNama = mapel.find((m) => m.id === n.mapelId)?.nama.toLowerCase() || ''
        return sNama.includes(q) || mNama.includes(q)
      })
    }

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
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Evaluasi Akademis</p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
          Mata Pelajaran & Nilai Siswa
        </h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Master Mapel Card */}
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
          <div className="mb-3.5 flex items-center gap-2">
            <BookPlus className="text-primary" size={18} />
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">Daftar Mapel</h2>
          </div>

          <div className="flex gap-2">
            <input
              value={namaMapel}
              onChange={(e) => setNamaMapel(e.target.value)}
              placeholder="Tambah mapel baru..."
              className="min-h-10 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
            />
            <button
              onClick={addMapel}
              className="min-h-10 rounded-md bg-primary px-3 text-white text-xs font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={15} />
              <span>Tambah</span>
            </button>
          </div>

          <div className="mt-3.5 space-y-1.5 max-h-[420px] overflow-y-auto scrollbar-thin">
            {mapel.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
              >
                <span className="font-medium text-[var(--text-primary)]">{item.nama}</span>
                <button
                  onClick={() => deleteMapel(item.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors p-1 flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
            ))}
            {!mapel.length && (
              <p className="rounded-lg bg-[var(--surface)] p-3 text-center text-xs text-[var(--text-muted)]">
                Belum ada mata pelajaran terdaftar.
              </p>
            )}
          </div>
        </article>

        {/* Input Nilai Batch Card */}
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
          <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">Input Nilai Batch</h2>
          
          <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3">
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer"
            >
              <option value="">Pilih Mapel</option>
              {mapel.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>

            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value as Nilai['jenis'])}
              className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer capitalize"
            >
              <option value="kuis">Kuis</option>
              <option value="latihan">Latihan</option>
              <option value="ulangan">Ulangan Harian</option>
              <option value="tugas">Tugas</option>
            </select>

            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
            />
          </div>

          <div className="mt-3.5 max-h-[380px] space-y-1.5 overflow-y-auto scrollbar-thin pr-1">
            {siswa.map((anak) => (
              <label
                key={anak.id}
                className="grid grid-cols-[1fr_80px] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
              >
                <span className="truncate text-[var(--text-primary)]">
                  <span className="font-semibold">{anak.nomorAbsen}.</span> {anak.nama}
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={scores[anak.id] || ''}
                  onChange={(e) => setScores({ ...scores, [anak.id]: e.target.value })}
                  className="min-h-8 rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 text-center text-xs font-semibold focus:border-primary outline-none text-[var(--text-primary)]"
                />
              </label>
            ))}
          </div>

          <button
            onClick={saveScores}
            className="mt-3.5 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
          >
            <Save size={15} />
            <span>Simpan Nilai Evaluasi</span>
          </button>
        </article>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={TrendingUp} label="Rata-rata Nilai" value={stats.average || '-'} tone="primary" />
        <MetricTile icon={Award} label="Nilai Tertinggi" value={stats.highest || '-'} tone="emerald" />
        <MetricTile icon={BarChart2} label="Nilai Terendah" value={stats.lowest || '-'} tone="amber" />
        <MetricTile icon={BookOpen} label="Total Nilai Terdata" value={stats.total} tone="blue" />
      </div>

      {/* Dynamic Records Table */}
      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-primary" />
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">
              Rekapitulasi Nilai Siswa
            </h2>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50/50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100/50 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5">
            <Search size={15} className="text-[var(--text-muted)] shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau mapel..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--text-subtle)] text-[var(--text-primary)]"
            />
          </label>

          <select
            value={filterSiswa}
            onChange={(e) => setFilterSiswa(e.target.value)}
            className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer truncate"
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
            className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer truncate"
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
            className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer capitalize"
          >
            <option value="">Semua Kategori</option>
            <option value="kuis">Kuis</option>
            <option value="latihan">Latihan</option>
            <option value="ulangan">Ulangan</option>
            <option value="tugas">Tugas</option>
          </select>
        </div>

        {/* Table Container with scrollbar */}
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] scrollbar-thin">
          <table className="w-full min-w-[620px] text-left text-xs border-collapse">
            <thead className="bg-[var(--surface)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th
                  onClick={() => handleHeaderSort('tanggal')}
                  className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal</span>
                    <SortIcon field="tanggal" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('siswa')}
                  className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Siswa</span>
                    <SortIcon field="siswa" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('mapel')}
                  className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Mata Pelajaran</span>
                    <SortIcon field="mapel" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th className="py-2.5 px-3">Kategori</th>
                <th
                  onClick={() => handleHeaderSort('nilai')}
                  className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Nilai</span>
                    <SortIcon field="nilai" currentField={sortField} order={sortOrder} />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-2)]">
              {filteredAndSortedNilai.map((item) => {
                const s = siswa.find((anak) => anak.id === item.siswaId)
                const m = mapel.find((map) => map.id === item.mapelId)

                return (
                  <tr key={item.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">{item.tanggal}</td>
                    <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">
                      {s?.nama || 'Siswa Dihapus'}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-primary)]">{m?.nama || 'Mapel Dihapus'}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-primary-50 text-primary capitalize dark:bg-primary-950/60 dark:text-primary-300">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block font-heading font-bold text-xs ${
                          item.nilai >= 75
                            ? 'text-emerald-600'
                            : item.nilai >= 60
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {item.nilai}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deleteNilai(item.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                        title="Hapus Nilai"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!filteredAndSortedNilai.length && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[var(--text-muted)]">
                    Tidak ada rekaman nilai yang sesuai kriteria filter.
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

function MetricTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any
  label: string
  value: string | number
  tone: 'primary' | 'emerald' | 'amber' | 'blue'
}) {
  const toneMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneMap[tone]} shrink-0`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold font-heading text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  )
}

function SortIcon({
  field,
  currentField,
  order,
}: {
  field: SortField
  currentField: SortField
  order: SortOrder
}) {
  if (field !== currentField) {
    return <ArrowUpDown size={12} className="opacity-40" />
  }
  return order === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
}
