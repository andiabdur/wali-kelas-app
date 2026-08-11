import { describe, expect, it } from 'vitest'
import { formatDateIndonesian, formatTTL } from './formatters'

describe('formatDateIndonesian', () => {
  it('formats YYYY-MM-DD to Indonesian date format', () => {
    expect(formatDateIndonesian('2012-08-15')).toContain('15')
    expect(formatDateIndonesian('2012-08-15')).toContain('Agustus')
    expect(formatDateIndonesian('2012-08-15')).toContain('2012')
  })

  it('returns empty string if empty date is passed', () => {
    expect(formatDateIndonesian('')).toBe('')
  })
})

describe('formatTTL', () => {
  it('combines birthplace and formatted date', () => {
    expect(formatTTL('Majalengka', '2012-08-15')).toContain('Majalengka, 15')
    expect(formatTTL('Majalengka', '2012-08-15')).toContain('Agustus 2012')
  })

  it('returns birthplace only if date is not provided', () => {
    expect(formatTTL('Bandung', '')).toBe('Bandung')
  })

  it('returns formatted date only if birthplace is not provided', () => {
    expect(formatTTL('', '2012-08-15')).toContain('15 Agustus 2012')
  })

  it('returns dash if neither is provided', () => {
    expect(formatTTL('', '')).toBe('-')
  })
})
