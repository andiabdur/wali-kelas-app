import { useRef, useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import {
  useKelas,
  useSiswaList,
  useAbsensiList,
  useNilaiList,
  useMataPelajaranList,
  useCatatanList,
  useAnalisisPsikologis,
  KATEGORI_POTENSI,
} from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { downloadElementAsPdf } from '../utils/pdfGenerator'
import { synthesizePsychologicalProfile } from '../utils/psychologyEngine'
import { formatTTL } from '../utils/formatters'

export function Laporan() {
  const { notify } = useStore()
  const { activeKelasId } = useAuth()
  const { data: kelasInfo } = useKelas(activeKelasId)
  const { siswa: allSiswa } = useSiswaList(activeKelasId)
  const siswa = allSiswa.filter((item) => item.aktif)
  const { records: absensi } = useAbsensiList(activeKelasId)
  const { nilai } = useNilaiList(activeKelasId)
  const { mapel } = useMataPelajaranList(activeKelasId)
  const { catatan } = useCatatanList(activeKelasId)
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))
  const [siswaId, setSiswaId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = siswa.find((item) => item.id === siswaId) || siswa[0]
  const savedAI = useAnalisisPsikologis(activeKelasId, selected?.id)
  const absensiBulan = selected ? absensi.filter((a) => a.siswaId === selected.id && a.tanggal.startsWith(bulan)) : []
  const nilaiBulan = selected ? nilai.filter((n) => n.siswaId === selected.id && n.tanggal.startsWith(bulan)) : []
  const catatanBulan = selected ? catatan.filter((c) => c.siswaId === selected.id && c.tanggal.startsWith(bulan)) : []

  async function download() {
    if (!ref.current || !selected) return
    setIsGenerating(true)
    notify('Membuat dokumen PDF...', 'info')
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
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Dokumentasi & Cetak</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            Laporan Perkembangan Siswa
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Pratinjau lembar laporan format standar A4.</p>
        </div>
        <button
          onClick={download}
          disabled={!selected || isGenerating}
          className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          <span>{isGenerating ? 'Memproses...' : 'Unduh PDF'}</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-[var(--text-primary)]">Pilih Bulan Periode:</span>
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)]"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[var(--text-primary)]">Pilih Siswa:</span>
          <select
            value={selected?.id || siswaId}
            onChange={(e) => setSiswaId(e.target.value)}
            className="mt-1 min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none focus:border-primary text-[var(--text-primary)] cursor-pointer"
          >
            {siswa.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nomorAbsen}. {item.nama}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* A4 Sheet Container */}
      {!selected ? (
        <Empty />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-3)]/60 p-4 scrollbar-thin">
          <div ref={ref} className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[18mm] text-black shadow-sm">
            {/* Header Kop Surat */}
            <header className="flex items-center justify-between gap-4 border-b-4 border-double border-black pb-4">
              <img
                src={kelasInfo?.logoDinas || '/logo-majalengka.png'}
                alt="Logo Pemkab Majalengka"
                className="h-20 w-20 object-contain shrink-0"
              />
              <div className="flex-1 text-center">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-800">
                  PEMERINTAH KABUPATEN MAJALENGKA
                </p>
                <p className="text-sm font-extrabold uppercase tracking-wider text-gray-900">DINAS PENDIDIKAN</p>
                <h2 className="text-lg font-extrabold uppercase tracking-wide text-gray-900 mt-0.5">
                  {kelasInfo?.namaSekolah || 'SDN CIJUREY I'}
                </h2>
                <p className="text-xs font-semibold text-gray-600 mt-1 uppercase tracking-widest border-t border-gray-300 pt-1">
                  LAPORAN PERKEMBANGAN SISWA &bull; {kelasInfo?.nama || 'KELAS V'} &bull; PERIODE: {bulan}
                </p>
              </div>
              <img
                src={kelasInfo?.logoSekolah || '/logo-sekolah.png'}
                alt="Logo SDN Cijurey I"
                className="h-20 w-20 object-contain shrink-0"
              />
            </header>

            {/* Student Biodata */}
            <section className="mt-5 grid grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 rounded border border-gray-200">
              <Info label="Nama Siswa" value={selected.nama} />
              <Info label="Nomor Absen" value={String(selected.nomorAbsen)} />
              <Info label="Jenis Kelamin" value={selected.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
              <Info label="Tempat, Tgl Lahir" value={formatTTL(selected.tempatLahir, selected.tanggalLahir)} />
              <Info label="NISN / NIS" value={`${selected.nisn || '-'} / ${selected.nis || '-'}`} />
              <Info label="Wali Kelas" value={kelasInfo?.namaWaliKelas || '-'} />
            </section>

            {/* Attendance Summary */}
            <Section title="Rekapitulasi Presensi Bulan Ini">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {(['H', 'I', 'S', 'A'] as const).map((status) => (
                  <div key={status} className="rounded border border-gray-300 p-2">
                    <b className="block text-lg font-bold">
                      {absensiBulan.filter((a) => a.status === status).length}
                    </b>
                    <span className="text-[11px] text-gray-600 font-semibold">
                      {status === 'H' ? 'Hadir (H)' : status === 'I' ? 'Izin (I)' : status === 'S' ? 'Sakit (S)' : 'Alpa (A)'}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Academic Scores */}
            <Section title="Nilai Evaluasi Akademis">
              <table className="w-full border-collapse text-xs border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Mata Pelajaran</th>
                    <th className="border border-gray-300 p-2 text-center">Jenis</th>
                    <th className="border border-gray-300 p-2 text-center">Tanggal</th>
                    <th className="border border-gray-300 p-2 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {nilaiBulan.length ? (
                    nilaiBulan.map((n) => (
                      <tr key={n.id}>
                        <td className="border border-gray-300 p-2">{mapel.find((m) => m.id === n.mapelId)?.nama || '-'}</td>
                        <td className="border border-gray-300 p-2 text-center capitalize">{n.jenis}</td>
                        <td className="border border-gray-300 p-2 text-center">{n.tanggal}</td>
                        <td className="border border-gray-300 p-2 text-center font-bold">{n.nilai}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 p-3 text-center text-gray-500 italic">
                        Belum ada rekaman nilai pada bulan ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            {/* Potensi */}
            <Section title="Potensi & Bakat Siswa">
              <p className="text-xs text-gray-800 font-medium">
                {selected.potensi
                  .map((id) => KATEGORI_POTENSI.find((p) => p.id === id)?.label)
                  .filter(Boolean)
                  .join(', ') || 'Belum ditandai'}
              </p>
            </Section>

            {/* Psychological Synthesis */}
            {(() => {
              const profileAI = savedAI
                ? {
                    karakterUtama: savedAI.karakterUtama,
                    narasiKarakter: savedAI.narasiKarakter,
                    saranPendekatan: savedAI.saranPendekatan,
                    rekomendasiBakat: savedAI.rekomendasiBakat,
                  }
                : synthesizePsychologicalProfile(selected.nama, absensi, nilai, catatan)
              return (
                <Section title="Catatan Perkembangan Karakter Siswa">
                  <div className="rounded border border-gray-300 bg-gray-50/70 p-3 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <span>Karakter Dominan:</span>
                      <span className="font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                        {profileAI.karakterUtama.join(', ')}
                      </span>
                    </div>
                    <p className="leading-relaxed text-gray-800 text-justify whitespace-pre-line">{profileAI.narasiKarakter}</p>
                    <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-bold block text-gray-900">Saran Pendekatan:</span>
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

            {/* Teacher Notes */}
            <Section title="Catatan Perkembangan Wali Kelas">
              {catatanBulan.length ? (
                catatanBulan.map((c) => (
                  <p key={c.id} className="mb-1 text-xs text-gray-800">
                    &bull; {c.isi}
                  </p>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">Tidak ada catatan khusus.</p>
              )}
            </Section>

            {/* Signature Footer */}
            <footer className="mt-10 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-semibold">Orang Tua / Wali Siswa</p>
                <div className="h-16" />
                <p className="font-bold underline">( _______________________ )</p>
              </div>
              <div>
                <p className="font-semibold">Wali Kelas</p>
                <div className="h-16" />
                <p className="font-bold underline">{kelasInfo?.namaWaliKelas || '( _______________________ )'}</p>
                <p className="text-[11px] text-gray-700 mt-0.5">
                  NIP. {kelasInfo?.nipWaliKelas || '_______________________'}
                </p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </section>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-900">{title}</h3>
      {children}
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function Empty() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-6 text-center text-xs text-[var(--text-muted)]">
      <FileText className="mx-auto mb-2 opacity-50" size={20} />
      Belum ada data siswa aktif.
    </div>
  )
}
