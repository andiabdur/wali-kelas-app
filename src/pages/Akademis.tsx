import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookPlus, Plus, Save, Trash2 } from 'lucide-react'
import { db, generateId, type Nilai } from '../db/database'
import { getActiveStudents } from '../db/queries'
import { useStore } from '../store/useStore'

export function Akademis() {
  const { notify } = useStore()
  const mapel = useLiveQuery(() => db.mataPelajaran.orderBy('urutan').toArray(), []) ?? []
  const siswa = useLiveQuery(async () => getActiveStudents(await db.siswa.toArray()), []) ?? []
  const nilai = useLiveQuery(() => db.nilai.toArray(), []) ?? []
  const [namaMapel, setNamaMapel] = useState('')
  const [selectedMapel, setSelectedMapel] = useState('')
  const [jenis, setJenis] = useState<Nilai['jenis']>('kuis')
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [scores, setScores] = useState<Record<string, string>>({})

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

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Akademis</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Mata Pelajaran & Nilai</h1>
        <p className="mt-1 text-[var(--text-muted)]">Mapel fleksibel, bisa ditambah atau dikurangi sesuai kebutuhan kelas.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
          <div className="mb-4 flex items-center gap-2"><BookPlus className="text-primary" /><h2 className="font-heading text-xl font-bold">Daftar Mapel</h2></div>
          <div className="flex gap-2">
            <input value={namaMapel} onChange={(e) => setNamaMapel(e.target.value)} placeholder="Contoh: Matematika" className="min-h-12 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:ring-2 focus:ring-primary/20" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={addMapel} className="min-h-12 rounded-xl bg-primary px-4 text-white shadow-md flex items-center justify-center"><Plus /></motion.button>
          </div>
          <div className="mt-4 space-y-2">
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
            <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base">
              <option value="">Pilih mapel</option>
              {mapel.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
            </select>
            <select value={jenis} onChange={(e) => setJenis(e.target.value as Nilai['jenis'])} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base">
              <option value="kuis">Kuis</option>
              <option value="latihan">Latihan</option>
              <option value="ulangan">Ulangan</option>
              <option value="tugas">Tugas</option>
            </select>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base" />
          </div>
          <div className="mt-4 max-h-[460px] space-y-2 overflow-auto pr-1">
            {siswa.map((anak) => (
              <label key={anak.id} className="grid grid-cols-[1fr_92px] items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <span><b>{anak.nomorAbsen}.</b> {anak.nama}</span>
                <input type="number" min="0" max="100" value={scores[anak.id] || ''} onChange={(e) => setScores({ ...scores, [anak.id]: e.target.value })} className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-2 text-center text-base focus:ring-2 focus:ring-primary/20 outline-none" />
              </label>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={saveScores} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white shadow-md"><Save size={18} /> Simpan Nilai</motion.button>
        </article>
      </div>

      <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
        <h2 className="font-heading text-xl font-bold">Nilai Terbaru</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-[var(--text-muted)]"><tr><th className="py-2">Tanggal</th><th>Siswa</th><th>Mapel</th><th>Jenis</th><th>Nilai</th></tr></thead>
            <tbody className="divide-y divide-[var(--border)]">
              {nilai.slice(-20).reverse().map((n) => <tr key={n.id}><td className="py-2">{n.tanggal}</td><td>{siswa.find((s) => s.id === n.siswaId)?.nama || '-'}</td><td>{mapel.find((m) => m.id === n.mapelId)?.nama || '-'}</td><td>{n.jenis}</td><td className="font-bold">{n.nilai}</td></tr>)}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
