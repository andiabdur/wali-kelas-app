import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, FileText, Loader2 } from 'lucide-react'
import { db, KATEGORI_POTENSI } from '../db/database'
import { getActiveStudents } from '../db/queries'
import { useStore } from '../store/useStore'
import { downloadElementAsPdf } from '../utils/pdfGenerator'
import { synthesizePsychologicalProfile } from '../utils/psychologyEngine'

export function Laporan() {
  const { kelasInfo, notify } = useStore()
  const siswa = useLiveQuery(async () => getActiveStudents(await db.siswa.toArray()), []) ?? []
  const absensi = useLiveQuery(() => db.absensi.toArray(), []) ?? []
  const nilai = useLiveQuery(() => db.nilai.toArray(), []) ?? []
  const mapel = useLiveQuery(() => db.mataPelajaran.toArray(), []) ?? []
  const catatan = useLiveQuery(() => db.catatan.toArray(), []) ?? []
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))
  const [siswaId, setSiswaId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = siswa.find((item) => item.id === siswaId) || siswa[0]
  const absensiBulan = selected ? absensi.filter((a) => a.siswaId === selected.id && a.tanggal.startsWith(bulan)) : []
  const nilaiBulan = selected ? nilai.filter((n) => n.siswaId === selected.id && n.tanggal.startsWith(bulan)) : []
  const catatanBulan = selected ? catatan.filter((c) => c.siswaId === selected.id && c.tanggal.startsWith(bulan)) : []

  async function download() {
    if (!ref.current || !selected) return
    setIsGenerating(true)
    notify('Menggenerasi PDF Laporan...', 'info')
    try {
      await downloadElementAsPdf(ref.current, `Laporan_Bulanan_${selected.nama.replace(/\s+/g, '_')}_${bulan}.pdf`)
      notify(`Laporan PDF "${selected.nama}" berhasil diunduh.`)
    } catch {
      notify('Gagal mengunduh PDF.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Laporan</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Laporan PDF Bulanan</h1>
          <p className="mt-1 text-[var(--text-muted)]">Preview A4 siap cetak atau dikirim ke orang tua.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={download}
          disabled={!selected || isGenerating}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white shadow-md disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {isGenerating ? 'Memproses PDF...' : 'Download PDF'}
        </motion.button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white/70 p-4 dark:bg-dark-surface-2 sm:grid-cols-2">
        <label><span className="text-sm font-semibold">Bulan</span><input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base dark:bg-dark-surface-1 dark:text-gray-100" /></label>
        <label><span className="text-sm font-semibold">Siswa</span><select value={selected?.id || siswaId} onChange={(e) => setSiswaId(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base dark:bg-dark-surface-1 dark:text-gray-100">{siswa.map((item) => <option key={item.id} value={item.id} className="bg-white text-gray-900 dark:bg-dark-surface-2 dark:text-gray-100">{item.nama}</option>)}</select></label>
      </div>

      {!selected ? <Empty /> : (
        <div className="overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div ref={ref} className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[18mm] text-black shadow-lg">
            <header className="flex items-center justify-between gap-4 border-b-4 border-double border-black pb-4">
              <img src={kelasInfo?.logoDinas || '/logo-majalengka.png'} alt="Logo Pemkab Majalengka" className="h-24 w-24 object-contain shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-800">PEMERINTAH KABUPATEN MAJALENGKA</p>
                <p className="text-sm font-extrabold uppercase tracking-wider text-gray-900">DINAS PENDIDIKAN</p>
                <h2 className="text-xl font-extrabold uppercase tracking-wide text-gray-900 mt-0.5">{kelasInfo?.namaSekolah || 'SDN CIJUREY I'}</h2>
                <p className="text-xs font-semibold text-gray-600 mt-1 uppercase tracking-widest border-t border-gray-300 pt-1">LAPORAN PERKEMBANGAN SISWA • {kelasInfo?.nama || 'Kelas'} • PERIODE: {bulan}</p>
              </div>
              <img src={kelasInfo?.logoSekolah || '/logo-sekolah.png'} alt="Logo SDN Cijurey I" className="h-24 w-24 object-contain shrink-0" />
            </header>

            <section className="mt-6 grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Info label="Nama Siswa" value={selected.nama} />
              <Info label="Nomor Absen" value={String(selected.nomorAbsen)} />
              <Info label="Jenis Kelamin" value={selected.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
              <Info label="NISN" value={selected.nisn || '-'} />
              <Info label="NIS" value={selected.nis || '-'} />
              <Info label="Wali Kelas" value={kelasInfo?.namaWaliKelas || '-'} />
            </section>

            <Section title="Rekap Absensi">
              <div className="grid grid-cols-4 gap-2 text-center">
                {(['H', 'I', 'S', 'A'] as const).map((status) => <div key={status} className="rounded border border-gray-300 p-2"><b className="block text-xl">{absensiBulan.filter((a) => a.status === status).length}</b><span className="text-xs text-gray-600 font-semibold">{status === 'H' ? 'Hadir (H)' : status === 'I' ? 'Izin (I)' : status === 'S' ? 'Sakit (S)' : 'Alpa (A)'}</span></div>)}
              </div>
            </Section>

            <Section title="Nilai Akademis Bulan Ini">
              <table className="w-full border-collapse text-sm border border-gray-300"><thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2 text-left">Mata Pelajaran</th><th className="border border-gray-300 p-2">Jenis</th><th className="border border-gray-300 p-2">Tanggal</th><th className="border border-gray-300 p-2">Nilai</th></tr></thead><tbody>{nilaiBulan.length ? nilaiBulan.map((n) => <tr key={n.id}><td className="border border-gray-300 p-2">{mapel.find((m) => m.id === n.mapelId)?.nama || '-'}</td><td className="border border-gray-300 p-2 text-center capitalize">{n.jenis}</td><td className="border border-gray-300 p-2 text-center">{n.tanggal}</td><td className="border border-gray-300 p-2 text-center font-bold">{n.nilai}</td></tr>) : <tr><td colSpan={4} className="border border-gray-300 p-3 text-center text-gray-500 italic">Belum ada nilai terdaftar pada bulan ini</td></tr>}</tbody></table>
            </Section>

            <Section title="Potensi & Bakat Siswa">
              <p className="text-gray-800 font-medium">{selected.potensi.map((id) => KATEGORI_POTENSI.find((p) => p.id === id)?.label).filter(Boolean).join(', ') || 'Belum ditandai'}</p>
            </Section>

            {/* AI Psychological Narrative Profile */}
            {(() => {
              const profileAI = synthesizePsychologicalProfile(selected.nama, absensi, nilai, catatan)
              return (
                <Section title="Analisis & Profil Karakteristik Psikologis Siswa (AI Generated)">
                  <div className="rounded-lg border border-gray-300 bg-gray-50/70 p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <span>Karakter Dominan:</span>
                      <span className="font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        {profileAI.karakterUtama.join(' • ')}
                      </span>
                    </div>
                    <p className="leading-relaxed text-gray-800 text-justify">
                      {profileAI.narasiKarakter}
                    </p>
                    <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-bold block text-gray-900">Saran Pendekatan Belajar:</span>
                        <span className="text-gray-700">{profileAI.saranPendekatan}</span>
                      </div>
                      <div>
                        <span className="font-bold block text-gray-900">Rekomendasi Bakat:</span>
                        <span className="text-gray-700">{profileAI.rekomendasiBakat}</span>
                      </div>
                    </div>
                  </div>
                </Section>
              )
            })()}

            <Section title="Catatan Perkembangan Wali Kelas">
              {catatanBulan.length ? catatanBulan.map((c) => <p key={c.id} className="mb-1.5 text-gray-800">• {c.isi}</p>) : <p className="text-gray-500 italic">- Tidak ada catatan khusus -</p>}
            </Section>

            <footer className="mt-12 grid grid-cols-2 gap-10 text-center text-sm">
              <div>
                <p className="font-semibold">Orang Tua / Wali Siswa</p>
                <div className="h-20" />
                <p className="font-bold underline">( _______________________ )</p>
              </div>
              <div>
                <p className="font-semibold">Wali Kelas</p>
                <div className="h-20" />
                <p className="font-bold underline">{kelasInfo?.namaWaliKelas || '( _______________________ )'}</p>
                <p className="text-xs text-gray-700 mt-1">NIP. {kelasInfo?.nipWaliKelas || '_______________________'}</p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </section>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-6"><h3 className="mb-2 text-lg font-bold">{title}</h3>{children}</section> }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs uppercase tracking-wider text-gray-500">{label}</p><p className="font-semibold">{value}</p></div> }
function Empty() { return <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-6 text-center text-[var(--text-muted)]"><FileText className="mx-auto mb-2" />Belum ada siswa.</div> }
