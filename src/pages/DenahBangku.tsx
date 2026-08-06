import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Dices, Printer, ArrowLeftRight, RefreshCw, Sparkles, UserCheck, Shield, Check, Monitor, LayoutGrid, AlertCircle } from 'lucide-react'
import { db, type Siswa } from '../db/database'
import { useStore } from '../store/useStore'
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
  const { kelasInfo, notify } = useStore()
  const allSiswa = useLiveQuery(() => db.siswa.toArray(), [])?.filter((s) => s.aktif).sort((a, b) => a.nomorAbsen - b.nomorAbsen) ?? []

  const [isRolling, setIsRolling] = useState(false)
  const [tickerCount, setTickerCount] = useState(0)
  const [swapSource, setSwapSource] = useState<{ mejaNo: number; side: 'L' | 'R' } | null>(null)

  const [seating, setSeating] = useState<MejaPair[]>([])

  // Load saved seating or initialize
  useEffect(() => {
    if (!allSiswa.length) return
    const saved = localStorage.getItem('DENAH_BANGKU_SAVED')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Map saved IDs back to active Siswa objects
        const restored: MejaPair[] = parsed.map((item: any) => ({
          mejaNo: item.mejaNo,
          siswaL: allSiswa.find((s) => s.id === item.siswaLId) || null,
          siswaR: allSiswa.find((s) => s.id === item.siswaRId) || null,
        }))
        setSeating(restored)
        return
      } catch {}
    }
    // Default initial arrangement
    generateDefaultSeating(allSiswa)
  }, [allSiswa.length])

  // Rolling Dice Animation Ticker
  useEffect(() => {
    let timer: any
    if (isRolling) {
      timer = setInterval(() => {
        setTickerCount((prev) => prev + 1)
      }, 120)
    }
    return () => clearInterval(timer)
  }, [isRolling])

  function generateDefaultSeating(siswaList: Siswa[]) {
    const pairs = buildGenderConstrainedPairs(siswaList)
    setSeating(pairs)
  }

  /**
   * Same-Gender Seating Algorithm:
   * Pairs Males with Males (L & L) and Females with Females (P & P)
   */
  function buildGenderConstrainedPairs(siswaList: Siswa[]): MejaPair[] {
    const males = shuffleArray(siswaList.filter((s) => s.jenisKelamin === 'L'))
    const females = shuffleArray(siswaList.filter((s) => s.jenisKelamin === 'P'))

    const pairedList: { siswaL: Siswa | null; siswaR: Siswa | null }[] = []

    // 1. Pair Males (L & L)
    for (let i = 0; i < males.length; i += 2) {
      if (i + 1 < males.length) {
        pairedList.push({ siswaL: males[i], siswaR: males[i + 1] })
      } else {
        // Odd male remaining
        pairedList.push({ siswaL: males[i], siswaR: null })
      }
    }

    // 2. Pair Females (P & P)
    for (let i = 0; i < females.length; i += 2) {
      if (i + 1 < females.length) {
        pairedList.push({ siswaL: females[i], siswaR: females[i + 1] })
      } else {
        // Odd female remaining
        pairedList.push({ siswaL: females[i], siswaR: null })
      }
    }

    // 3. Shuffle desk order so class layout is well-mixed
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

  function handleToggleRoll() {
    if (!isRolling) {
      // Start rolling dice animation
      setIsRolling(true)
      notify('Pengacakan tempat duduk dimulai! Ketuk tombol lagi untuk berhenti & menetapkan denah.', 'info')
    } else {
      // Stop rolling dice animation & shuffle final seating
      setIsRolling(false)
      const newSeating = buildGenderConstrainedPairs(allSiswa)
      saveSeating(newSeating)
      notify('Denah tempat duduk berhasil diacak & ditetapkan! (Laki-laki & Perempuan terpisah)', 'success')
    }
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

    // Swap students between swapSource and target
    const updated = seating.map((m) => {
      const item = { ...m }
      if (m.mejaNo === swapSource.mejaNo && m.mejaNo === mejaNo) {
        // Swap within same desk
        const temp = item.siswaL
        item.siswaL = item.siswaR
        item.siswaR = temp
      } else if (m.mejaNo === swapSource.mejaNo) {
        const sourceSiswa = swapSource.side === 'L' ? item.siswaL : item.siswaR
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
    notify('Posisi tempat duduk siswa berhasil ditukar.', 'success')
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
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end print:hidden">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Denah Bangku Interaktif</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Denah Tempat Duduk Kelas</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Pengacakan denah tempat duduk siswa secara periodik dengan aturan pasangan sesama gender ({counts.l} Laki-laki & {counts.p} Perempuan).
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleRoll}
            className={`flex min-h-12 items-center gap-2.5 rounded-xl px-5 text-sm font-bold text-white shadow-md transition-all ${
              isRolling ? 'bg-amber-600 animate-pulse ring-4 ring-amber-300 dark:ring-amber-900/50' : 'bg-primary hover:bg-primary-600'
            }`}
          >
            <motion.div
              animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
              transition={isRolling ? { repeat: Infinity, duration: 0.4, ease: 'linear' } : {}}
            >
              <Dices size={20} />
            </motion.div>
            <span>{isRolling ? 'Pengacakan Berjalan... (Ketuk Lagi untuk Berhenti)' : 'Acak Tempat Duduk (Dadu)'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:bg-dark-surface-1 dark:text-gray-100 dark:hover:bg-dark-surface-2"
          >
            <Printer size={18} /> Cetak Denah
          </motion.button>
        </div>
      </div>

      {/* Rolling Dice Animation Banner */}
      <AnimatePresence>
        {isRolling && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="rounded-3xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-primary-500/10 p-5 shadow-lg dark:bg-amber-950/40 print:hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 180, 360], scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md"
                >
                  <Dices size={28} />
                </motion.div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-amber-900 dark:text-amber-200">
                    Sedang Menyusun Ulang Tempat Duduk Siswa...
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Sistem sedang mengacak pasangan tempat duduk sesama gender. Ketuk tombol <strong className="underline">Pengacakan Berjalan</strong> di atas untuk menetapkan denah!
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 font-mono text-xl font-bold text-amber-700 dark:text-amber-300">
                <Sparkles size={20} className="animate-spin" />
                <span>ACAK #{tickerCount}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classroom Seating Grid Area */}
      <div className="rounded-3xl border border-[var(--border)] bg-white/80 p-6 shadow-sm dark:bg-dark-surface-2 print:border-none print:p-0 print:shadow-none">
        
        {/* Printable Kop Surat Header */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-4 text-center">
          <div className="flex items-center justify-between">
            <img src={kelasInfo?.logoDinas || '/logo-majalengka.png'} alt="Logo Dinas" className="h-16 w-16 object-contain" />
            <div>
              <h2 className="font-bold text-lg uppercase tracking-wide">Pemerintah Kabupaten Majalengka</h2>
              <h3 className="font-bold text-xl uppercase">{kelasInfo?.namaSekolah || 'SDN CIJUREY I'}</h3>
              <p className="text-xs">DENAH TEMPAT DUDUK SISWA - {kelasInfo?.nama || 'KELAS 3A'} ({kelasInfo?.tahunAjaran || '2025/2026'})</p>
            </div>
            <img src={kelasInfo?.logoSekolah || '/logo-sekolah.png'} alt="Logo Sekolah" className="h-16 w-16 object-contain" />
          </div>
        </div>

        {/* Classroom Front Board & Teacher Desk */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-3 rounded-2xl bg-emerald-900 p-4 text-center text-white shadow-md border-4 border-emerald-950 dark:bg-emerald-950">
            <p className="font-heading text-sm font-bold tracking-[0.3em] uppercase text-emerald-200">
              Papan Tulis Utama (Depan Kelas)
            </p>
          </div>

          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-3.5 text-center shadow-sm dark:bg-amber-950/30 dark:border-amber-800">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Meja Wali Kelas</p>
            <p className="font-heading text-sm font-bold mt-0.5 text-gray-900 dark:text-gray-100">{kelasInfo?.namaWaliKelas || 'Wali Kelas'}</p>
            {kelasInfo?.nipWaliKelas && <p className="text-[10px] text-[var(--text-muted)]">NIP: {kelasInfo.nipWaliKelas}</p>}
          </div>
        </div>

        {/* Desk Grid (3 Meja per baris) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seating.map((meja) => (
            <motion.div
              key={meja.mejaNo}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border-2 border-[var(--border)] bg-gradient-to-b from-white to-gray-50/80 p-4 shadow-sm dark:from-dark-surface-1 dark:to-dark-surface-2"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 mb-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary-50 dark:bg-primary-950/50 px-2.5 py-1 rounded-full">
                  <LayoutGrid size={13} /> Meja #{meja.mejaNo}
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">Bangku Berpasangan</span>
              </div>

              {/* Student Seats Pair (Left & Right) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left Seat */}
                <SeatCard
                  siswa={meja.siswaL}
                  mejaNo={meja.mejaNo}
                  side="L"
                  isRolling={isRolling}
                  isSwapSelected={swapSource?.mejaNo === meja.mejaNo && swapSource?.side === 'L'}
                  onSwapSelect={() => handleSwap(meja.mejaNo, 'L')}
                />

                {/* Right Seat */}
                <SeatCard
                  siswa={meja.siswaR}
                  mejaNo={meja.mejaNo}
                  side="R"
                  isRolling={isRolling}
                  isSwapSelected={swapSource?.mejaNo === meja.mejaNo && swapSource?.side === 'R'}
                  onSwapSelect={() => handleSwap(meja.mejaNo, 'R')}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {!seating.length && (
          <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-8 text-center text-[var(--text-muted)] dark:bg-dark-surface-2">
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
              <p className="font-bold">Wali Kelas {kelasInfo?.nama || '3A'}</p>
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
  mejaNo,
  side,
  isRolling,
  isSwapSelected,
  onSwapSelect,
}: {
  siswa: Siswa | null
  mejaNo: number
  side: 'L' | 'R'
  isRolling: boolean
  isSwapSelected: boolean
  onSwapSelect: () => void
}) {
  if (isRolling) {
    return (
      <div className="flex min-h-[90px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-2 text-center animate-pulse">
        <Dices size={18} className="text-amber-500 animate-spin mb-1" />
        <span className="text-[10px] font-bold text-amber-700">Mengacak...</span>
      </div>
    )
  }

  if (!siswa) {
    return (
      <div className="flex min-h-[90px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-gray-50/50 p-2 text-center dark:bg-dark-surface-1">
        <span className="text-[10px] font-semibold text-[var(--text-muted)]">Kosong</span>
      </div>
    )
  }

  const isBoy = siswa.jenisKelamin === 'L'

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={onSwapSelect}
      className={`relative flex min-h-[90px] flex-col items-center justify-center rounded-2xl border p-2.5 text-center cursor-pointer transition-all shadow-2xs ${
        isSwapSelected
          ? 'border-primary ring-2 ring-primary bg-primary-50 dark:bg-primary-950/50'
          : isBoy
          ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20'
          : 'border-pink-200 bg-pink-50/40 hover:bg-pink-50 dark:border-pink-900/50 dark:bg-pink-950/20'
      }`}
    >
      {/* Gender Badge Tag */}
      <span
        className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${
          isBoy ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
        }`}
      >
        {isBoy ? 'L' : 'P'}
      </span>

      <Avatar name={siswa.nama} />
      <p className="font-heading text-xs font-bold leading-tight line-clamp-1 text-gray-900 dark:text-gray-100">{siswa.nama}</p>
      <p className="text-[10px] font-medium text-[var(--text-muted)]">No. Absen {siswa.nomorAbsen}</p>
    </motion.div>
  )
}
