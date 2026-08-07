import { useMemo, useState } from 'react'
import { Calendar, Search, FileText } from 'lucide-react'
import type { Absensi, Siswa } from '../db/database'

interface Props {
  siswa: Siswa[]
  absensi: Absensi[]
  onSelectSiswa?: (siswaId: string) => void
}

function getCurrentMonthISO() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

export function TabelDetailKehadiran({ siswa, absensi, onSelectSiswa }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthISO())
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate days in the selected month
  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number)
    if (!year || !month) return []
    const count = new Date(year, month, 0).getDate()
    const result: { dateStr: string; dayNum: number; dayName: string; isWeekend: boolean }[] = []
    
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    for (let i = 1; i <= count; i++) {
      const dayStr = String(i).padStart(2, '0')
      const dateStr = `${selectedMonth}-${dayStr}`
      const d = new Date(year, month - 1, i)
      const dayOfWeek = d.getDay()
      result.push({
        dateStr,
        dayNum: i,
        dayName: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      })
    }
    return result
  }, [selectedMonth])

  // Filter students
  const filteredSiswa = useMemo(() => {
    return siswa.filter((s) => s.nama.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [siswa, searchQuery])

  // Index attendance records by siswaId and dateStr
  const absensiMap = useMemo(() => {
    const map = new Map<string, Absensi>()
    absensi.forEach((record) => {
      if (record.tanggal.startsWith(selectedMonth)) {
        map.set(`${record.siswaId}_${record.tanggal}`, record)
      }
    })
    return map
  }, [absensi, selectedMonth])

  return (
    <article className="space-y-4 rounded-2xl border border-[var(--border)] bg-white/70 p-5 shadow-sm dark:bg-dark-surface-2">
      {/* Table Title & Filter Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="text-primary shrink-0" size={22} />
            <h2 className="font-heading text-xl font-bold">Detail & Matriks Kehadiran Siswa</h2>
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Rekapitulasi presensi harian per tanggal beserta total H, S, I, A dan persentase kehadiran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Select Picker */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-1.5 dark:bg-dark-surface-1">
            <Calendar size={16} className="text-primary shrink-0" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer text-[var(--text-primary)]"
            />
          </div>

          {/* Student Search */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-1.5 dark:bg-dark-surface-1">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 sm:w-36 bg-transparent text-xs outline-none text-[var(--text-primary)] placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Attendance Status Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium border-t border-[var(--border)] pt-3">
        <span className="text-[var(--text-muted)] font-semibold">Keterangan:</span>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 font-bold text-emerald-800 dark:text-emerald-300">
          H = Hadir
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 font-bold text-amber-800 dark:text-amber-300">
          S = Sakit
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 font-bold text-blue-800 dark:text-blue-300">
          I = Izin
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-950/80 px-2 py-0.5 font-bold text-red-800 dark:text-red-300">
          A = Alfa
        </span>
      </div>

      {/* Matrix Table Container */}
      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-[var(--border)] bg-white dark:bg-dark-surface-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {/* Header Row 1 */}
            <tr className="bg-gray-100 dark:bg-[#1E2025] text-gray-800 dark:text-gray-100 font-bold border-b border-[var(--border)]">
              <th rowSpan={2} className="px-3 py-2.5 text-center border-r border-[var(--border)] w-10">
                No
              </th>
              <th rowSpan={2} className="px-4 py-2.5 border-r border-[var(--border)] min-w-[150px]">
                Nama Siswa
              </th>
              <th colSpan={daysInMonth.length} className="px-2 py-1.5 text-center border-r border-[var(--border)]">
                Tanggal ({selectedMonth})
              </th>
              <th colSpan={5} className="px-2 py-1.5 text-center">
                Jumlah
              </th>
            </tr>

            {/* Header Row 2: Dates 1..N & Summaries H, S, I, A, % */}
            <tr className="bg-gray-50 dark:bg-[#252830] text-gray-700 dark:text-gray-200 font-bold border-b border-[var(--border)]">
              {daysInMonth.map((day) => (
                <th
                  key={day.dateStr}
                  className={`px-1.5 py-1 text-center border-r border-[var(--border)] min-w-[28px] ${
                    day.isWeekend ? 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' : ''
                  }`}
                  title={`${day.dayName}, ${day.dayNum}`}
                >
                  {day.dayNum}
                </th>
              ))}
              <th className="px-2 py-1 text-center border-r border-[var(--border)] text-emerald-700 dark:text-emerald-400 min-w-[32px]">
                H
              </th>
              <th className="px-2 py-1 text-center border-r border-[var(--border)] text-amber-700 dark:text-amber-400 min-w-[32px]">
                S
              </th>
              <th className="px-2 py-1 text-center border-r border-[var(--border)] text-blue-700 dark:text-blue-400 min-w-[32px]">
                I
              </th>
              <th className="px-2 py-1 text-center border-r border-[var(--border)] text-red-700 dark:text-red-400 min-w-[32px]">
                A
              </th>
              <th className="px-2 py-1 text-center text-primary dark:text-primary-300 min-w-[48px]">
                %
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)] text-gray-900 dark:text-gray-100">
            {filteredSiswa.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth.length + 7} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  Tidak ada data siswa.
                </td>
              </tr>
            ) : (
              filteredSiswa.map((item, idx) => {
                let totalH = 0
                let totalS = 0
                let totalI = 0
                let totalA = 0

                const dateCells = daysInMonth.map((day) => {
                  const record = absensiMap.get(`${item.id}_${day.dateStr}`)
                  const status = record?.status

                  if (status === 'H') totalH++
                  else if (status === 'S') totalS++
                  else if (status === 'I') totalI++
                  else if (status === 'A') totalA++

                  return { day, status }
                })

                const totalFilled = totalH + totalS + totalI + totalA
                const persenHadir = totalFilled > 0 ? Math.round((totalH / totalFilled) * 100) : 0

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-surface-2 transition"
                  >
                    {/* No */}
                    <td className="px-2 py-2 text-center border-r border-[var(--border)] font-semibold text-gray-500 dark:text-gray-400">
                      {item.nomorAbsen || idx + 1}
                    </td>

                    {/* Nama Siswa */}
                    <td className="px-4 py-2 border-r border-[var(--border)] font-semibold">
                      {onSelectSiswa ? (
                        <button
                          type="button"
                          onClick={() => onSelectSiswa(item.id)}
                          className="hover:text-primary text-left transition font-semibold"
                        >
                          {item.nama}
                        </button>
                      ) : (
                        <span>{item.nama}</span>
                      )}
                    </td>

                    {/* Date Status Cells */}
                    {dateCells.map(({ day, status }) => {
                      let badgeStyle = 'text-gray-300 dark:text-gray-600'
                      let label = '-'

                      if (status === 'H') {
                        badgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold'
                        label = 'H'
                      } else if (status === 'S') {
                        badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold'
                        label = 'S'
                      } else if (status === 'I') {
                        badgeStyle = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-extrabold'
                        label = 'I'
                      } else if (status === 'A') {
                        badgeStyle = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-extrabold'
                        label = 'A'
                      }

                      return (
                        <td
                          key={day.dateStr}
                          className={`px-1 py-1.5 text-center border-r border-[var(--border)] ${
                            day.isWeekend ? 'bg-gray-50/50 dark:bg-dark-surface-2/40' : ''
                          }`}
                        >
                          {label !== '-' ? (
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[11px] ${badgeStyle}`}>
                              {label}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300 dark:text-gray-600">-</span>
                          )}
                        </td>
                      )
                    })}

                    {/* Summary Totals: H, S, I, A, % */}
                    <td className="px-2 py-2 text-center border-r border-[var(--border)] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                      {totalH}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-[var(--border)] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                      {totalS}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-[var(--border)] font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20">
                      {totalI}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-[var(--border)] font-extrabold text-red-700 dark:text-red-400 bg-red-50/40 dark:bg-red-950/20">
                      {totalA}
                    </td>
                    <td className="px-2 py-2 text-center font-extrabold">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[11px] ${
                          persenHadir >= 90
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : persenHadir >= 75
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {totalFilled > 0 ? `${persenHadir}%` : '-'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </article>
  )
}
