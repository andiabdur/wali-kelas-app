import { useEffect, useMemo, useState } from 'react'
import { Dices, Printer, Grid3X3, ArrowLeftRight } from 'lucide-react'
import { useKelas, useSiswaList, type Siswa } from '../db/firestore'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './SiswaList'

export interface MejaPair {
  mejaNo: number
  siswaL: Siswa | null
  siswaR: Siswa | null
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function DenahBangku() {
  const { notify } = useStore()
  const { activeKelasId } = useAuth()
  const { data: kelasInfo } = useKelas(activeKelasId)
  const { siswa: rawSiswa } = useSiswaList(activeKelasId)
  const allSiswa = useMemo(() => rawSiswa.filter((s) => s.aktif), [rawSiswa])

  const [isRolling, setIsRolling] = useState(false)
  const [swapSource, setSwapSource] = useState<{ mejaNo: number; side: 'L' | 'R' } | null>(null)
  const [seating, setSeating] = useState<MejaPair[]>([])

  useEffect(() => {
    if (!allSiswa.length) return
    const saved = localStorage.getItem('DENAH_BANGKU_SAVED')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const restored: MejaPair[] = parsed.map((item: any) => ({
          mejaNo: item.mejaNo,
          siswaL: allSiswa.find((s) => s.id === item.siswaLId) || null,
          siswaR: allSiswa.find((s) => s.id === item.siswaRId) || null,
        }))
        setSeating(restored)
        return
      } catch {}
    }
    generateDefaultSeating(allSiswa)
  }, [allSiswa.length])

  function generateDefaultSeating(siswaList: Siswa[]) {
    const pairs = buildGenderConstrainedPairs(siswaList)
    setSeating(pairs)
  }

  function buildGenderConstrainedPairs(siswaList: Siswa[]): MejaPair[] {
    const males = shuffleArray(siswaList.filter((s) => s.jenisKelamin === 'L'))
    const females = shuffleArray(siswaList.filter((s) => s.jenisKelamin === 'P'))

    const pairedList: { siswaL: Siswa | null; siswaR: Siswa | null }[] = []

    for (let i = 0; i < males.length; i += 2) {
      if (i + 1 < males.length) {
        pairedList.push({ siswaL: males[i], siswaR: males[i + 1] })
      } else {
        pairedList.push({ siswaL: males[i], siswaR: null })
      }
    }

    for (let i = 0; i < females.length; i += 2) {
      if (i + 1 < females.length) {
        pairedList.push({ siswaL: females[i], siswaR: females[i + 1] })
      } else {
        pairedList.push({ siswaL: females[i], siswaR: null })
      }
    }

    const shuffledPairs = shuffleArray(pairedList)

    return shuffledPairs.map((pair, index) => ({
      mejaNo: index + 1,
      siswaL: pair.siswaL,
      siswaR: pair.siswaR,
    }))
  }

  function saveSeating(newSeating: MejaPair[]) {
    setSeating(newSeating)
    const payload = newSeating.map((m) => ({
      mejaNo: m.mejaNo,
      siswaLId: m.siswaL?.id || null,
      siswaRId: m.siswaR?.id || null,
    }))
    localStorage.setItem('DENAH_BANGKU_SAVED', JSON.stringify(payload))
  }

  function handleShuffle() {
    setIsRolling(true)
    setTimeout(() => {
      const newSeating = buildGenderConstrainedPairs(allSiswa)
      saveSeating(newSeating)
      setIsRolling(false)
      notify('Denah tempat duduk berhasil diacak berpasangan sesama gender.', 'success')
    }, 200)
  }

  function handleSwap(mejaNo: number, side: 'L' | 'R') {
    if (!swapSource) {
      setSwapSource({ mejaNo, side })
      notify('Pilih bangku target untuk menukar posisi siswa.', 'info')
      return
    }

    if (swapSource.mejaNo === mejaNo && swapSource.side === side) {
      setSwapSource(null)
      return
    }

    const updated = seating.map((m) => {
      const item = { ...m }
      if (m.mejaNo === swapSource.mejaNo && m.mejaNo === mejaNo) {
        const temp = item.siswaL
        item.siswaL = item.siswaR
        item.siswaR = temp
      } else if (m.mejaNo === swapSource.mejaNo) {
        const targetMeja = seating.find((sm) => sm.mejaNo === mejaNo)
        const targetSiswa = side === 'L' ? targetMeja?.siswaL : targetMeja?.siswaR

        if (swapSource.side === 'L') item.siswaL = targetSiswa || null
        else item.siswaR = targetSiswa || null
      } else if (m.mejaNo === mejaNo) {
        const sourceMeja = seating.find((sm) => sm.mejaNo === swapSource.mejaNo)
        const sourceSiswa = swapSource.side === 'L' ? sourceMeja?.siswaL : sourceMeja?.siswaR

        if (side === 'L') item.siswaL = sourceSiswa || null
        else item.siswaR = sourceSiswa || null
      }
      return item
    })

    saveSeating(updated)
    setSwapSource(null)
    notify('Posisi tempat duduk berhasil ditukar.', 'success')
  }

  function handlePrint() {
    window.print()
  }

  const counts = useMemo(() => {
    const l = allSiswa.filter((s) => s.jenisKelamin === 'L').length
    const p = allSiswa.filter((s) => s.jenisKelamin === 'P').length
    return { l, p, total: allSiswa.length }
  }, [allSiswa])

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Tata Letak Kelas</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            Denah Bangku Kelas
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Total {counts.total} siswa aktif ({counts.l} Laki-laki, {counts.p} Perempuan). Pasangan bangku terpisah berdasarkan gender.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleShuffle}
            disabled={isRolling}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            <Dices size={16} />
            <span>Acak Denah Bangku</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-primary/40 transition-colors"
          >
            <Printer size={16} />
            <span>Cetak Denah</span>
          </button>
        </div>
      </div>

      {/* Swap Mode Indicator */}
      {swapSource && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary-50/60 dark:bg-primary-950/30 p-3 text-xs text-primary print:hidden">
          <div className="flex items-center gap-2 font-medium">
            <ArrowLeftRight size={16} />
            <span>Mode Tukar: Meja #{swapSource.mejaNo} (Sisi {swapSource.side === 'L' ? 'Kiri' : 'Kanan'}). Klik bangku tujuan untuk menukar posisi.</span>
          </div>
          <button
            onClick={() => setSwapSource(null)}
            className="text-xs font-bold underline hover:opacity-80 ml-2"
          >
            Batal
          </button>
        </div>
      )}

      {/* Classroom Seating Grid Area */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 print:border-none print:p-0 print:bg-white">
        {/* Printable Official Header */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-4 text-center">
          <div className="flex items-center justify-between">
            <img
              src={kelasInfo?.logoDinas || '/logo-majalengka.png'}
              alt="Logo Dinas"
              className="h-16 w-16 object-contain"
            />
            <div>
              <h2 className="font-bold text-base uppercase tracking-wide">Pemerintah Kabupaten Majalengka</h2>
              <h3 className="font-bold text-lg uppercase">{kelasInfo?.namaSekolah || 'SDN CIJUREY I'}</h3>
              <p className="text-xs">
                DENAH TEMPAT DUDUK SISWA &bull; {kelasInfo?.nama || 'KELAS V'} ({kelasInfo?.tahunAjaran || '2026/2027'})
              </p>
            </div>
            <img
              src={kelasInfo?.logoSekolah || '/logo-sekolah.png'}
              alt="Logo Sekolah"
              className="h-16 w-16 object-contain"
            />
          </div>
        </div>

        {/* Classroom Front: Blackboard & Teacher Desk */}
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-3 rounded-lg bg-emerald-900 dark:bg-emerald-950 p-3 text-center text-white border border-emerald-950">
            <p className="font-heading text-xs font-bold tracking-[0.2em] uppercase text-emerald-200">
              Papan Tulis Depan Kelas
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Meja Guru</p>
            <p className="font-heading text-xs font-bold mt-0.5 text-[var(--text-primary)]">
              {kelasInfo?.namaWaliKelas || 'Wali Kelas'}
            </p>
          </div>
        </div>

        {/* Desk Grid (3 Meja per baris) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seating.map((meja) => (
            <div
              key={meja.mejaNo}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-2.5">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                  <Grid3X3 size={13} /> Meja #{meja.mejaNo}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">Bangku Berpasangan</span>
              </div>

              {/* Student Seats Pair */}
              <div className="grid grid-cols-2 gap-2">
                <SeatCard
                  siswa={meja.siswaL}
                  mejaNo={meja.mejaNo}
                  side="L"
                  isSwapSelected={swapSource?.mejaNo === meja.mejaNo && swapSource?.side === 'L'}
                  onSwapSelect={() => handleSwap(meja.mejaNo, 'L')}
                />
                <SeatCard
                  siswa={meja.siswaR}
                  mejaNo={meja.mejaNo}
                  side="R"
                  isSwapSelected={swapSource?.mejaNo === meja.mejaNo && swapSource?.side === 'R'}
                  onSwapSelect={() => handleSwap(meja.mejaNo, 'R')}
                />
              </div>
            </div>
          ))}
        </div>

        {!seating.length && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--text-muted)]">
            Belum ada data siswa aktif untuk menyusun denah tempat duduk.
          </div>
        )}

        {/* Printable Signature Footer */}
        <div className="hidden print:block mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between text-xs">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah {kelasInfo?.namaSekolah || 'SDN CIJUREY I'}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">( _______________________ )</p>
              <p>NIP. ____________________</p>
            </div>
            <div className="text-right">
              <p>Majalengka, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Wali Kelas {kelasInfo?.nama || 'Kelas V'}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{kelasInfo?.namaWaliKelas || 'Wali Kelas'}</p>
              <p>NIP. {kelasInfo?.nipWaliKelas || '____________________'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SeatCard({
  siswa,
  mejaNo: _mejaNo,
  side: _side,
  isSwapSelected,
  onSwapSelect,
}: {
  siswa: Siswa | null
  mejaNo: number
  side: 'L' | 'R'
  isSwapSelected: boolean
  onSwapSelect: () => void
}) {
  if (!siswa) {
    return (
      <div className="flex min-h-[76px] flex-col items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-2 text-center">
        <span className="text-[10px] text-[var(--text-muted)]">Kosong</span>
      </div>
    )
  }

  const isBoy = siswa.jenisKelamin === 'L'

  return (
    <div
      onClick={onSwapSelect}
      className={`relative flex min-h-[76px] flex-col items-center justify-center rounded-md border p-2 text-center cursor-pointer transition-colors ${
        isSwapSelected
          ? 'border-primary ring-2 ring-primary bg-primary-50 dark:bg-primary-950/40'
          : isBoy
          ? 'border-blue-200/80 bg-blue-50/20 hover:border-blue-300 dark:border-blue-900/30 dark:bg-blue-950/10'
          : 'border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-300 dark:border-emerald-900/30 dark:bg-emerald-950/10'
      }`}
    >
      <span
        className={`absolute top-1 right-1 px-1 py-0.2 rounded text-[9px] font-bold ${
          isBoy
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
        }`}
      >
        {isBoy ? 'L' : 'P'}
      </span>

      <Avatar name={siswa.nama} />
      <p className="mt-1 font-heading text-xs font-bold leading-tight line-clamp-1 text-[var(--text-primary)]">
        {siswa.nama}
      </p>
      <p className="text-[10px] text-[var(--text-muted)]">Absen #{siswa.nomorAbsen}</p>
    </div>
  )
}
